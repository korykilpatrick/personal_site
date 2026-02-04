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
import sys
import xml.etree.ElementTree as ET
from collections import namedtuple, defaultdict
from datetime import datetime
from email.utils import parsedate_to_datetime

import requests
import psycopg2
from dotenv import load_dotenv


def parse_rss_date(date_str):
    """Parse RSS date format (RFC 2822) to ISO date string (YYYY-MM-DD)."""
    if not date_str:
        return None
    try:
        dt = parsedate_to_datetime(date_str)
        return dt.strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        return None

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))

# Data models (matching existing database schema)
Book = namedtuple('Book', [
    'goodreads_id', 'img_url', 'img_url_small', 'title', 'book_link',
    'author', 'author_link', 'num_pages', 'avg_rating', 'num_ratings',
    'date_pub', 'rating', 'blurb', 'date_added', 'date_started', 'date_read'
])
Bookshelf = namedtuple('Bookshelf', ['name'])
BooksShelves = namedtuple('BooksShelves', ['book_id', 'shelf_id'])

# Configuration
PROFILE_ID = '76731654'
RSS_BASE_URL = f'https://www.goodreads.com/review/list_rss/{PROFILE_ID}'
SHELVES_TO_SYNC = ['currently-reading', 'read']

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
            sys.exit(1)

    def execute(self, query, args=(), many=False):
        """Execute a query and return results."""
        try:
            cursor = self.connection.cursor()
            if many:
                cursor.executemany(query, args)
            else:
                cursor.execute(query, args)

            # Return data for SELECT queries
            if cursor.description:
                columns = [d[0] for d in cursor.description]
                Row = namedtuple('Row', columns)
                results = [Row(*row) for row in cursor.fetchall()]
                self.connection.commit()
                cursor.close()
                return results

            self.connection.commit()
            cursor.close()
            return None
        except psycopg2.Error as e:
            print(f"Database error: {e}")
            self.connection.rollback()
            return None

    def insert_books(self, books):
        """Insert books, ignoring duplicates."""
        if not books:
            return

        query = """
            INSERT INTO books (
                goodreads_id, img_url, img_url_small, title, book_link,
                author, author_link, num_pages, avg_rating, num_ratings,
                date_pub, rating, blurb, date_added, date_started, date_read
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (goodreads_id) DO NOTHING
        """
        self.execute(query, [tuple(b) for b in books], many=True)
        print(f"Inserted {len(books)} books (duplicates ignored)")

    def insert_bookshelves(self, shelves):
        """Insert bookshelves, ignoring duplicates."""
        if not shelves:
            return

        query = """
            INSERT INTO bookshelves (name) VALUES (%s)
            ON CONFLICT (name) DO NOTHING
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
        print(f"Error fetching RSS for {shelf} page {page}: {e}")
        return None


def parse_rss_item(item):
    """Parse a single RSS item into a Book namedtuple."""
    try:
        goodreads_id = int(item.find('book_id').text)
        title = item.find('title').text or ''
        author = item.find('author_name').text or ''

        # Image URLs
        img_url_small = item.find('book_small_image_url').text or ''
        img_url = item.find('book_large_image_url').text or img_url_small

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

        avg_rating_text = item.find('average_rating').text
        avg_rating = float(avg_rating_text) if avg_rating_text else 0.0

        num_ratings = 0  # Not available in RSS

        date_pub = item.find('book_published').text

        # User-specific data
        rating_text = item.find('user_rating').text
        rating = int(rating_text) if rating_text and rating_text != '0' else None

        blurb_elem = item.find('user_review')
        blurb = blurb_elem.text.strip() if blurb_elem is not None and blurb_elem.text else ''

        # Parse dates from RSS RFC 2822 format to ISO format (YYYY-MM-DD)
        date_added = parse_rss_date(item.find('user_date_added').text)
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

    except Exception as e:
        print(f"Error parsing RSS item: {e}")
        return None, []


def get_all_books_from_shelf(shelf):
    """Fetch all books from a shelf, handling pagination."""
    all_books = []
    book_shelves = {}  # goodreads_id -> list of shelf names
    page = 1

    while page <= 50:  # Safety limit
        content = fetch_rss(shelf, page)
        if not content:
            break

        try:
            root = ET.fromstring(content)
        except ET.ParseError as e:
            print(f"Error parsing RSS XML: {e}")
            break

        items = root.findall('.//item')
        if not items:
            break

        for item in items:
            book, shelves = parse_rss_item(item)
            if book:
                all_books.append(book)
                book_shelves[book.goodreads_id] = shelves

        page += 1

    return all_books, book_shelves


def sync_books(db):
    """Sync books from Goodreads to database."""
    # Get existing books
    existing = db.execute('SELECT goodreads_id FROM books')
    existing_ids = {b.goodreads_id for b in existing} if existing else set()

    # Fetch books from all shelves
    all_books = {}
    all_book_shelves = {}

    for shelf in SHELVES_TO_SYNC:
        print(f"Fetching shelf: {shelf}")
        books, book_shelves = get_all_books_from_shelf(shelf)
        print(f"  Found {len(books)} books")

        for book in books:
            if book.goodreads_id not in all_books:
                all_books[book.goodreads_id] = book
        all_book_shelves.update(book_shelves)

    # Insert new books
    new_books = [b for gid, b in all_books.items() if gid not in existing_ids]
    if new_books:
        db.insert_books(new_books)
    else:
        print("No new books to insert")

    # Report books in DB but not on Goodreads (we don't delete them)
    missing_from_goodreads = existing_ids - set(all_books.keys())
    if missing_from_goodreads:
        print(f"Skipping {len(missing_from_goodreads)} books not found on Goodreads (keeping in DB)")

    return all_book_shelves


def sync_bookshelves(db, book_shelves):
    """Sync bookshelves from collected shelf names."""
    # Get existing shelves
    existing = db.execute('SELECT name FROM bookshelves')
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
    books = db.execute('SELECT id, goodreads_id FROM books')
    book_id_lookup = {b.goodreads_id: b.id for b in books} if books else {}

    # Get shelf ID lookup
    shelves = db.execute('SELECT id, name FROM bookshelves')
    shelf_id_lookup = {s.name: s.id for s in shelves} if shelves else {}

    # Get existing assignments
    existing = db.execute('SELECT book_id, shelf_id FROM books_shelves')
    existing_assignments = {(a.book_id, a.shelf_id) for a in existing} if existing else set()

    # Build new assignments
    new_assignments = []
    for goodreads_id, shelf_names in book_shelves.items():
        book_id = book_id_lookup.get(goodreads_id)
        if not book_id:
            continue

        for shelf_name in shelf_names:
            shelf_id = shelf_id_lookup.get(shelf_name)
            if not shelf_id:
                continue

            if (book_id, shelf_id) not in existing_assignments:
                new_assignments.append(BooksShelves(book_id, shelf_id))

    if new_assignments:
        db.insert_books_shelves(new_assignments)
    else:
        print("No new shelf assignments to insert")


def dry_run():
    """Test fetching without database connection."""
    print(f"Starting Goodreads dry run at {datetime.now().isoformat()}")
    print("-" * 50)

    all_books = {}
    all_book_shelves = {}

    for shelf in SHELVES_TO_SYNC:
        print(f"Fetching shelf: {shelf}")
        books, book_shelves = get_all_books_from_shelf(shelf)
        print(f"  Found {len(books)} books")

        for book in books:
            if book.goodreads_id not in all_books:
                all_books[book.goodreads_id] = book
        all_book_shelves.update(book_shelves)

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


def main():
    """Main sync function."""
    print(f"Starting Goodreads sync at {datetime.now().isoformat()}")
    print("-" * 50)

    db = Database()

    try:
        # Sync books and collect shelf data
        book_shelves = sync_books(db)

        # Sync bookshelves
        sync_bookshelves(db, book_shelves)

        # Sync book-shelf relationships
        sync_books_shelves(db, book_shelves)

        print("-" * 50)
        print(f"Sync complete at {datetime.now().isoformat()}")

    finally:
        db.close()


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Sync Goodreads books to database')
    parser.add_argument('--dry-run', action='store_true', help='Test fetching without database')
    args = parser.parse_args()

    if args.dry_run:
        dry_run()
    else:
        main()
