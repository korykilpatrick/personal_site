#!/usr/bin/env python3
"""
Goodreads Sync Script

Fetches book data from Goodreads RSS feeds and syncs to PostgreSQL database.
Uses RSS feeds which are publicly accessible (no authentication required).

Usage:
    python3 scripts/goodreads.py

Environment variables (or .env file):
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
"""

import os
import xml.etree.ElementTree as ET
from collections import namedtuple, defaultdict
from dataclasses import dataclass
from datetime import datetime
from email.utils import parsedate_to_datetime

import requests
import psycopg2

try:
    from dotenv import load_dotenv as _load_dotenv
except ImportError:
    _load_dotenv = None


def load_env_file(env_path):
    """Load a simple KEY=VALUE env file, even when python-dotenv is unavailable."""
    if _load_dotenv is not None:
        _load_dotenv(env_path)
        return

    if not os.path.exists(env_path):
        return

    with open(env_path, encoding='utf-8') as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue

            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()

            if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
                value = value[1:-1]

            os.environ.setdefault(key, value)


def parse_rss_date(date_str):
    """Parse RSS date format (RFC 2822) to ISO date string (YYYY-MM-DD)."""
    if not date_str:
        return None
    try:
        dt = parsedate_to_datetime(date_str)
        return dt.strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        return None

# Data models (matching existing database schema)
Book = namedtuple('Book', [
    'goodreads_id', 'img_url', 'img_url_small', 'title', 'book_link',
    'author', 'author_link', 'num_pages', 'avg_rating', 'num_ratings',
    'date_pub', 'rating', 'blurb', 'date_added', 'date_started', 'date_read'
])
Bookshelf = namedtuple('Bookshelf', ['name'])
BooksShelves = namedtuple('BooksShelves', ['book_id', 'shelf_id'])


@dataclass(frozen=True)
class ShelfSnapshot:
    """A shelf feed that reached a valid empty terminal page."""

    shelf: str
    books: tuple
    book_shelves: dict
    terminal_page: int
    complete: bool = True


@dataclass(frozen=True)
class GoodreadsSnapshot:
    """The complete, authoritative union of every configured shelf feed."""

    books: dict
    book_shelves: dict
    completed_shelves: frozenset


class GoodreadsSyncError(RuntimeError):
    """Base class for errors that make a Goodreads snapshot unsafe to apply."""


class FeedFetchError(GoodreadsSyncError):
    """Raised when an RSS page cannot be fetched successfully."""


class FeedParseError(GoodreadsSyncError):
    """Raised when an RSS page or item cannot be parsed completely."""


class FeedPaginationError(GoodreadsSyncError):
    """Raised when a feed never reaches a valid empty terminal page."""


class PruneSafetyError(GoodreadsSyncError):
    """Raised when a snapshot could cause an unexpectedly destructive prune."""


# Configuration
PROFILE_ID = '76731654'
RSS_BASE_URL = f'https://www.goodreads.com/review/list_rss/{PROFILE_ID}'
SHELVES_TO_SYNC = ['currently-reading', 'read']
MAX_RSS_PAGES = 50
# Automated syncs may delete at most 20% of existing Goodreads-backed books.
# Larger intentional reductions require the --allow-large-prune CLI override.
MAX_PRUNE_FRACTION = 0.20

# HTTP headers to avoid 403 errors
REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Accept': 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
}


class Database:
    """Simple database wrapper for PostgreSQL."""

    def __init__(self):
        self.connection = self._connect()

    def _connect(self):
        try:
            # Handle SSL - DB_SSL=true means require SSL
            ssl_mode = 'prefer'
            if os.getenv('DB_SSL', '').lower() == 'true':
                ssl_mode = 'require'
            elif os.getenv('DB_SSL_MODE'):
                ssl_mode = os.getenv('DB_SSL_MODE')

            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                dbname=os.getenv('DB_NAME', 'personal_site'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', ''),
                sslmode=ssl_mode
            )
            return conn
        except psycopg2.Error as e:
            print(f"Error connecting to database: {e}")
            raise

    def execute(self, query, args=(), many=False):
        """Execute a query without committing the surrounding transaction."""
        cursor = self.connection.cursor()
        try:
            if many:
                cursor.executemany(query, args)
            else:
                cursor.execute(query, args)

            # Return data for SELECT queries
            if cursor.description:
                columns = [d[0] for d in cursor.description]
                Row = namedtuple('Row', columns)
                return [Row(*row) for row in cursor.fetchall()]

            return None
        finally:
            cursor.close()

    def commit(self):
        """Commit the complete Goodreads reconciliation."""
        self.connection.commit()

    def rollback(self):
        """Roll back the complete Goodreads reconciliation."""
        self.connection.rollback()

    def get_goodreads_books(self):
        """Return database books managed by the Goodreads sync."""
        return self.execute("""
            SELECT id, goodreads_id
            FROM books
            WHERE goodreads_id IS NOT NULL
        """)

    def get_bookshelves(self):
        """Return all shelf IDs and names."""
        return self.execute('SELECT id, name FROM bookshelves')

    def get_book_shelf_assignments(self):
        """Return shelf assignments for Goodreads-backed books."""
        return self.execute("""
            SELECT books_shelves.book_id, books_shelves.shelf_id, bookshelves.name
            FROM books_shelves
            JOIN books ON books.id = books_shelves.book_id
            JOIN bookshelves ON bookshelves.id = books_shelves.shelf_id
            WHERE books.goodreads_id IS NOT NULL
        """)

    def upsert_books(self, books):
        """Insert new books and refresh existing Goodreads-backed records."""
        if not books:
            return

        query = """
            INSERT INTO books (
                goodreads_id, img_url, img_url_small, title, book_link,
                author, author_link, num_pages, avg_rating, num_ratings,
                date_pub, rating, blurb, date_added, date_started, date_read
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (goodreads_id) DO UPDATE SET
                img_url = EXCLUDED.img_url,
                img_url_small = EXCLUDED.img_url_small,
                title = EXCLUDED.title,
                book_link = EXCLUDED.book_link,
                author = EXCLUDED.author,
                author_link = EXCLUDED.author_link,
                num_pages = EXCLUDED.num_pages,
                avg_rating = EXCLUDED.avg_rating,
                num_ratings = EXCLUDED.num_ratings,
                date_pub = EXCLUDED.date_pub,
                rating = EXCLUDED.rating,
                blurb = EXCLUDED.blurb,
                date_added = EXCLUDED.date_added,
                date_started = EXCLUDED.date_started,
                date_read = EXCLUDED.date_read,
                updated_at = CURRENT_TIMESTAMP
        """
        self.execute(query, [tuple(b) for b in books], many=True)
        print(f"Upserted {len(books)} books")

    def insert_bookshelves(self, shelves):
        """Insert bookshelves, ignoring duplicates."""
        if not shelves:
            return

        query = """
            INSERT INTO bookshelves (name) VALUES (%s)
            ON CONFLICT DO NOTHING
        """
        self.execute(query, [(s.name,) for s in shelves], many=True)
        print(f"Inserted {len(shelves)} shelves (duplicates ignored)")

    def insert_books_shelves(self, assignments):
        """Insert book-shelf assignments, ignoring duplicates."""
        if not assignments:
            return

        query = """
            INSERT INTO books_shelves (book_id, shelf_id) VALUES (%s, %s)
            ON CONFLICT DO NOTHING
        """
        self.execute(query, [(a.book_id, a.shelf_id) for a in assignments], many=True)
        print(f"Inserted {len(assignments)} shelf assignments (duplicates ignored)")

    def delete_books_shelves(self, assignments):
        """Delete outdated book-shelf assignments."""
        if not assignments:
            return

        query = """
            DELETE FROM books_shelves
            WHERE book_id = %s AND shelf_id = %s
        """
        self.execute(query, assignments, many=True)
        print(f"Deleted {len(assignments)} stale shelf assignments")

    def delete_books(self, book_ids):
        """Delete junction rows before Goodreads-backed books.

        Production foreign keys use NO ACTION, so this ordering is required even
        though some local schema declarations historically specified cascades.
        """
        book_ids = sorted(set(book_ids))
        if not book_ids:
            return

        self.execute(
            'DELETE FROM books_shelves WHERE book_id = ANY(%s)',
            (book_ids,),
        )
        self.execute(
            'DELETE FROM books WHERE id = ANY(%s)',
            (book_ids,),
        )
        print(f"Deleted {len(book_ids)} books no longer present on Goodreads")

    def close(self):
        if self.connection:
            self.connection.close()


def fetch_rss(shelf, page=1):
    """Fetch RSS feed for a shelf."""
    url = f'{RSS_BASE_URL}?shelf={shelf}&page={page}'
    try:
        response = requests.get(url, headers=REQUEST_HEADERS, timeout=30)
        response.raise_for_status()
        return response.content
    except requests.RequestException as e:
        raise FeedFetchError(
            f"Failed to fetch Goodreads shelf {shelf!r} page {page}"
        ) from e


def _element_text(parent, tag, default=''):
    """Return a child element's text without treating optional fields as errors."""
    element = parent.find(tag)
    if element is None or element.text is None:
        return default
    return element.text


def _required_element_text(parent, tag):
    """Return required child text or reject the incomplete RSS item."""
    value = _element_text(parent, tag).strip()
    if not value:
        raise FeedParseError(f"RSS item is missing required <{tag}> text")
    return value


def parse_rss_item(item):
    """Parse a single RSS item into a Book namedtuple."""
    try:
        goodreads_id = int(_required_element_text(item, 'book_id'))
        title = _required_element_text(item, 'title')
        author = _required_element_text(item, 'author_name')

        # Image URLs
        img_url_small = _element_text(item, 'book_small_image_url')
        img_url = _element_text(item, 'book_large_image_url', img_url_small)

        # Book link
        book_link = f'https://www.goodreads.com/book/show/{goodreads_id}'
        author_link = ''  # Not available in RSS

        # Metadata
        book_elem = item.find('book')
        num_pages = None
        if book_elem is not None:
            pages_elem = book_elem.find('num_pages')
            if pages_elem is not None and pages_elem.text:
                try:
                    num_pages = int(pages_elem.text)
                except ValueError:
                    pass

        avg_rating_text = _element_text(item, 'average_rating')
        avg_rating = float(avg_rating_text) if avg_rating_text else 0.0

        num_ratings = 0  # Not available in RSS

        date_pub = _element_text(item, 'book_published') or None

        # User-specific data
        rating_text = _element_text(item, 'user_rating')
        rating = int(rating_text) if rating_text and rating_text != '0' else None

        blurb_elem = item.find('user_review')
        blurb = blurb_elem.text.strip() if blurb_elem is not None and blurb_elem.text else ''

        # Parse dates from RSS RFC 2822 format to ISO format (YYYY-MM-DD)
        date_added = parse_rss_date(_element_text(item, 'user_date_added'))
        date_started = None  # Not available in RSS
        date_read_elem = item.find('user_read_at')
        date_read = parse_rss_date(date_read_elem.text if date_read_elem is not None else None)

        # Get shelves for this book
        shelves_elem = item.find('user_shelves')
        shelves = []
        if shelves_elem is not None and shelves_elem.text:
            shelves = [s.strip().lower().replace(' ', '-') for s in shelves_elem.text.split(',')]

        book = Book(
            goodreads_id, img_url, img_url_small, title, book_link,
            author, author_link, num_pages, avg_rating, num_ratings,
            date_pub, rating, blurb, date_added, date_started, date_read
        )
        return book, shelves

    except FeedParseError:
        raise
    except (AttributeError, TypeError, ValueError) as e:
        raise FeedParseError("Could not parse a complete Goodreads RSS item") from e


def _local_name(tag):
    """Strip an optional XML namespace from a tag."""
    return tag.rsplit('}', 1)[-1]


def parse_rss_page(content, shelf, page):
    """Parse and validate one Goodreads RSS page."""
    try:
        root = ET.fromstring(content)
    except (ET.ParseError, TypeError) as e:
        raise FeedParseError(
            f"Invalid RSS XML for shelf {shelf!r} page {page}"
        ) from e

    if _local_name(root.tag).lower() != 'rss':
        raise FeedParseError(
            f"Unexpected RSS document for shelf {shelf!r} page {page}"
        )

    channel = next(
        (child for child in root if _local_name(child.tag).lower() == 'channel'),
        None,
    )
    if channel is None:
        raise FeedParseError(
            f"RSS channel missing for shelf {shelf!r} page {page}"
        )

    return [
        child for child in channel
        if _local_name(child.tag).lower() == 'item'
    ]


def get_all_books_from_shelf(shelf, allow_empty=False):
    """Fetch a complete shelf, requiring a valid empty terminal RSS page."""
    all_books = []
    book_shelves = {}  # goodreads_id -> list of shelf names
    seen_ids = set()

    for page in range(1, MAX_RSS_PAGES + 1):
        content = fetch_rss(shelf, page)
        items = parse_rss_page(content, shelf, page)
        if not items:
            if page == 1 and not allow_empty:
                raise PruneSafetyError(
                    f"Shelf {shelf!r} returned an empty first page; refusing to "
                    "treat it as authoritative without --allow-large-prune"
                )

            return ShelfSnapshot(
                shelf=shelf,
                books=tuple(all_books),
                book_shelves=book_shelves,
                terminal_page=page,
            )

        for item in items:
            book, shelves = parse_rss_item(item)
            if book.goodreads_id in seen_ids:
                raise FeedPaginationError(
                    f"Duplicate Goodreads book {book.goodreads_id} while paginating "
                    f"shelf {shelf!r} at page {page}"
                )

            seen_ids.add(book.goodreads_id)
            all_books.append(book)
            book_shelves[book.goodreads_id] = shelves

    raise FeedPaginationError(
        f"Shelf {shelf!r} did not reach an empty terminal page within "
        f"{MAX_RSS_PAGES} pages"
    )


def fetch_goodreads_snapshot(allow_large_prune=False):
    """Fetch every tracked shelf before any database reconciliation begins."""
    all_books = {}
    all_book_shelves = defaultdict(set)
    completed_shelves = set()

    for shelf in SHELVES_TO_SYNC:
        print(f"Fetching shelf: {shelf}")
        shelf_snapshot = get_all_books_from_shelf(
            shelf,
            allow_empty=allow_large_prune,
        )
        if not shelf_snapshot.complete:
            raise GoodreadsSyncError(f"Shelf {shelf!r} returned an incomplete snapshot")
        if (
            shelf_snapshot.terminal_page == 1
            and not shelf_snapshot.books
            and not allow_large_prune
        ):
            raise PruneSafetyError(
                f"Shelf {shelf!r} returned an empty first page; refusing to "
                "treat it as authoritative without --allow-large-prune"
            )

        completed_shelves.add(shelf)
        print(
            f"  Found {len(shelf_snapshot.books)} books; "
            f"terminal page {shelf_snapshot.terminal_page}"
        )

        for book in shelf_snapshot.books:
            all_books.setdefault(book.goodreads_id, book)
            # A book returned by a shelf feed necessarily belongs to that shelf,
            # even if Goodreads omits it from the user_shelves text field.
            all_book_shelves[book.goodreads_id].add(shelf)
            all_book_shelves[book.goodreads_id].update(
                shelf_snapshot.book_shelves.get(book.goodreads_id, [])
            )

    expected_shelves = set(SHELVES_TO_SYNC)
    if completed_shelves != expected_shelves:
        missing = sorted(expected_shelves - completed_shelves)
        raise GoodreadsSyncError(
            f"Refusing to reconcile an incomplete Goodreads snapshot; missing {missing}"
        )

    return GoodreadsSnapshot(
        books=all_books,
        book_shelves={
            goodreads_id: sorted(shelf_names)
            for goodreads_id, shelf_names in all_book_shelves.items()
        },
        completed_shelves=frozenset(completed_shelves),
    )


def sync_books(db, books, allow_large_prune=False):
    """Upsert present books and delete Goodreads books absent from the snapshot."""
    existing = db.get_goodreads_books() or []
    present_goodreads_ids = set(books)
    missing_book_ids = [
        book.id for book in existing
        if book.goodreads_id not in present_goodreads_ids
    ]

    # Validate the complete deletion plan before the first database write. The
    # existing-book count is the stable baseline for the destructive fraction.
    if existing and not allow_large_prune:
        prune_fraction = len(missing_book_ids) / len(existing)
        if prune_fraction > MAX_PRUNE_FRACTION:
            raise PruneSafetyError(
                f"Refusing to delete {len(missing_book_ids)} of {len(existing)} "
                f"Goodreads-backed books ({prune_fraction:.1%}); the automatic "
                f"limit is {MAX_PRUNE_FRACTION:.0%}. Re-run with "
                "--allow-large-prune if this reduction is intentional."
            )

    books_to_sync = list(books.values())
    if books_to_sync:
        db.upsert_books(books_to_sync)
    else:
        print("No books returned from Goodreads")

    if missing_book_ids:
        db.delete_books(missing_book_ids)
    else:
        print("No books to delete")


def sync_bookshelves(db, book_shelves):
    """Sync bookshelves from collected shelf names."""
    # Get existing shelves
    existing = db.get_bookshelves()
    existing_names = {s.name for s in existing} if existing else set()

    # Collect all unique shelf names
    all_shelf_names = set()
    for shelves in book_shelves.values():
        for shelf in shelves:
            if shelf and shelf != 'want-to-read':
                all_shelf_names.add(shelf)

    # Insert new shelves
    new_shelves = [Bookshelf(name) for name in all_shelf_names if name not in existing_names]
    if new_shelves:
        db.insert_bookshelves(new_shelves)
    else:
        print("No new shelves to insert")


def sync_books_shelves(db, book_shelves):
    """Sync book-shelf relationships."""
    # Get book ID lookup
    books = db.get_goodreads_books()
    book_id_lookup = {b.goodreads_id: b.id for b in books} if books else {}

    # Get shelf ID lookup
    shelves = db.get_bookshelves()
    shelf_id_lookup = {s.name: s.id for s in shelves} if shelves else {}

    # Build a per-book view of current assignments so Goodreads can be the source of truth
    # for books that still appear in the synced feeds.
    existing = db.get_book_shelf_assignments()
    existing_assignments = defaultdict(dict)
    if existing:
        for assignment in existing:
            existing_assignments[assignment.book_id][assignment.name] = assignment.shelf_id

    # Build new assignments
    new_assignments = []
    stale_assignments = []
    for goodreads_id, shelf_names in book_shelves.items():
        book_id = book_id_lookup.get(goodreads_id)
        if not book_id:
            continue

        desired_shelves = {
            shelf_name for shelf_name in shelf_names
            if shelf_name and shelf_name != 'want-to-read' and shelf_name in shelf_id_lookup
        }
        current_shelves = set(existing_assignments.get(book_id, {}))

        for shelf_name in desired_shelves - current_shelves:
            new_assignments.append(BooksShelves(book_id, shelf_id_lookup[shelf_name]))

        for shelf_name in current_shelves - desired_shelves:
            stale_assignments.append((book_id, existing_assignments[book_id][shelf_name]))

    if new_assignments:
        db.insert_books_shelves(new_assignments)
    else:
        print("No new shelf assignments to insert")

    if stale_assignments:
        db.delete_books_shelves(stale_assignments)
    else:
        print("No stale shelf assignments to delete")


def reconcile_database(db, snapshot, allow_large_prune=False):
    """Apply one complete Goodreads snapshot to the database."""
    expected_shelves = set(SHELVES_TO_SYNC)
    if set(snapshot.completed_shelves) != expected_shelves:
        raise GoodreadsSyncError(
            "Refusing to reconcile a snapshot that did not complete every tracked shelf"
        )

    sync_books(
        db,
        snapshot.books,
        allow_large_prune=allow_large_prune,
    )
    sync_bookshelves(db, snapshot.book_shelves)
    sync_books_shelves(db, snapshot.book_shelves)


def sync_from_goodreads(db, allow_large_prune=False):
    """Fetch a complete snapshot and apply it as one atomic transaction."""
    try:
        snapshot = fetch_goodreads_snapshot(
            allow_large_prune=allow_large_prune,
        )
        reconcile_database(
            db,
            snapshot,
            allow_large_prune=allow_large_prune,
        )
        db.commit()
        return snapshot
    except Exception:
        db.rollback()
        raise


def dry_run(allow_large_prune=False):
    """Test fetching without database connection."""
    print(f"Starting Goodreads dry run at {datetime.now().isoformat()}")
    print("-" * 50)

    snapshot = fetch_goodreads_snapshot(
        allow_large_prune=allow_large_prune,
    )
    all_books = snapshot.books
    all_book_shelves = snapshot.book_shelves

    print("-" * 50)
    print(f"Total unique books: {len(all_books)}")

    # Collect unique shelves
    all_shelf_names = set()
    for shelves in all_book_shelves.values():
        for shelf in shelves:
            if shelf and shelf != 'want-to-read':
                all_shelf_names.add(shelf)

    print(f"Total unique shelves: {len(all_shelf_names)}")
    print(f"Shelves: {sorted(all_shelf_names)}")

    # Show sample books
    print("-" * 50)
    print("Sample books:")
    for i, (gid, book) in enumerate(list(all_books.items())[:5]):
        print(f"  {book.title} by {book.author}")
        print(f"    Rating: {book.rating}, Shelves: {all_book_shelves.get(gid, [])}")

    print("-" * 50)
    print(f"Dry run complete at {datetime.now().isoformat()}")


def main(allow_large_prune=False):
    """Main sync function."""
    print(f"Starting Goodreads sync at {datetime.now().isoformat()}")
    print("-" * 50)

    load_env_file(os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))
    db = Database()

    try:
        sync_from_goodreads(db, allow_large_prune=allow_large_prune)

        print("-" * 50)
        print(f"Sync complete at {datetime.now().isoformat()}")

    finally:
        db.close()


def build_argument_parser():
    """Build the command-line interface for the Goodreads sync."""
    import argparse
    parser = argparse.ArgumentParser(description='Sync Goodreads books to database')
    parser.add_argument('--dry-run', action='store_true', help='Test fetching without database')
    parser.add_argument(
        '--allow-large-prune',
        action='store_true',
        help=(
            'Allow an intentional empty shelf or deletion of more than 20%% '
            'of Goodreads-backed books'
        ),
    )
    return parser


if __name__ == '__main__':
    args = build_argument_parser().parse_args()

    if args.dry_run:
        dry_run(allow_large_prune=args.allow_large_prune)
    else:
        main(allow_large_prune=args.allow_large_prune)
