import copy
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from scripts import goodreads


def make_book(goodreads_id, title=None):
    return goodreads.Book(
        goodreads_id=goodreads_id,
        img_url=f'https://images.example/{goodreads_id}.jpg',
        img_url_small=f'https://images.example/{goodreads_id}-small.jpg',
        title=title or f'Book {goodreads_id}',
        book_link=f'https://www.goodreads.com/book/show/{goodreads_id}',
        author='Test Author',
        author_link='',
        num_pages=200,
        avg_rating=4.0,
        num_ratings=0,
        date_pub='2024',
        rating=None,
        blurb='',
        date_added='2024-01-01',
        date_started=None,
        date_read=None,
    )


def rss_item(goodreads_id, shelves):
    return f"""
        <item>
            <title>Book {goodreads_id}</title>
            <book_id>{goodreads_id}</book_id>
            <author_name>Test Author</author_name>
            <book_small_image_url>https://images.example/small.jpg</book_small_image_url>
            <book_large_image_url>https://images.example/large.jpg</book_large_image_url>
            <book><num_pages>200</num_pages></book>
            <average_rating>4.0</average_rating>
            <book_published>2024</book_published>
            <user_rating>0</user_rating>
            <user_review />
            <user_date_added>Mon, 01 Jan 2024 00:00:00 +0000</user_date_added>
            <user_read_at />
            <user_shelves>{shelves}</user_shelves>
        </item>
    """


def rss_page(*items):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<rss version="2.0"><channel><title>Test shelf</title>'
        + ''.join(items)
        + '</channel></rss>'
    ).encode('utf-8')


def complete_snapshot(book_shelves):
    return goodreads.GoodreadsSnapshot(
        books={book.goodreads_id: book for book, _ in book_shelves},
        book_shelves={
            book.goodreads_id: list(shelves)
            for book, shelves in book_shelves
        },
        completed_shelves=frozenset(goodreads.SHELVES_TO_SYNC),
    )


class InMemoryDatabase:
    """Small transactional fake; it never opens a real database connection."""

    def __init__(self, book_shelves=()):
        self.books = {}
        self.shelves = {}
        self.assignments = set()
        self.next_book_id = 1
        self.next_shelf_id = 1
        self.commits = 0
        self.rollbacks = 0
        self.events = []
        self.fail_on = None

        for book, shelf_names in book_shelves:
            self._store_book(book)
            for shelf_name in shelf_names:
                shelf_id = self._store_shelf(shelf_name)
                self.assignments.add((self.books[book.goodreads_id]['id'], shelf_id))

        self._committed_state = self._capture_state()

    def _capture_state(self):
        return copy.deepcopy((
            self.books,
            self.shelves,
            self.assignments,
            self.next_book_id,
            self.next_shelf_id,
        ))

    def _restore_state(self, state):
        (
            self.books,
            self.shelves,
            self.assignments,
            self.next_book_id,
            self.next_shelf_id,
        ) = copy.deepcopy(state)

    def _store_book(self, book):
        stored = self.books.get(book.goodreads_id)
        if stored is None:
            stored = {'id': self.next_book_id, 'book': book}
            self.books[book.goodreads_id] = stored
            self.next_book_id += 1
        else:
            stored['book'] = book
        return stored['id']

    def _store_shelf(self, name):
        shelf_id = self.shelves.get(name)
        if shelf_id is None:
            shelf_id = self.next_shelf_id
            self.shelves[name] = shelf_id
            self.next_shelf_id += 1
        return shelf_id

    def _maybe_fail(self, operation):
        if self.fail_on == operation:
            raise goodreads.psycopg2.DatabaseError(f'failure during {operation}')

    def get_goodreads_books(self):
        self._maybe_fail('get_goodreads_books')
        return [
            SimpleNamespace(id=stored['id'], goodreads_id=goodreads_id)
            for goodreads_id, stored in self.books.items()
        ]

    def get_bookshelves(self):
        self._maybe_fail('get_bookshelves')
        return [
            SimpleNamespace(id=shelf_id, name=name)
            for name, shelf_id in self.shelves.items()
        ]

    def get_book_shelf_assignments(self):
        self._maybe_fail('get_book_shelf_assignments')
        shelf_names = {shelf_id: name for name, shelf_id in self.shelves.items()}
        return [
            SimpleNamespace(
                book_id=book_id,
                shelf_id=shelf_id,
                name=shelf_names[shelf_id],
            )
            for book_id, shelf_id in self.assignments
        ]

    def upsert_books(self, books):
        self._maybe_fail('upsert_books')
        self.events.append('upsert_books')
        for book in books:
            self._store_book(book)

    def insert_bookshelves(self, shelves):
        self._maybe_fail('insert_bookshelves')
        self.events.append('insert_bookshelves')
        for shelf in shelves:
            self._store_shelf(shelf.name)

    def insert_books_shelves(self, assignments):
        self._maybe_fail('insert_books_shelves')
        self.events.append('insert_books_shelves')
        for assignment in assignments:
            self.assignments.add((assignment.book_id, assignment.shelf_id))

    def delete_books_shelves(self, assignments):
        self._maybe_fail('delete_books_shelves')
        self.events.append('delete_books_shelves')
        for assignment in assignments:
            self.assignments.discard(tuple(assignment))

    def delete_books(self, book_ids):
        self._maybe_fail('delete_books')
        book_ids = set(book_ids)
        self.events.append('delete_join_rows')
        self.assignments = {
            assignment for assignment in self.assignments
            if assignment[0] not in book_ids
        }
        self.events.append('delete_books')
        self.books = {
            goodreads_id: stored
            for goodreads_id, stored in self.books.items()
            if stored['id'] not in book_ids
        }

    def commit(self):
        self._maybe_fail('commit')
        self.commits += 1
        self.events.append('commit')
        self._committed_state = self._capture_state()

    def rollback(self):
        self.rollbacks += 1
        self.events.append('rollback')
        self._restore_state(self._committed_state)

    def shelf_names_for(self, goodreads_id):
        book_id = self.books[goodreads_id]['id']
        shelf_names = {shelf_id: name for name, shelf_id in self.shelves.items()}
        return {
            shelf_names[shelf_id]
            for assigned_book_id, shelf_id in self.assignments
            if assigned_book_id == book_id
        }

    def visible_state(self):
        return {
            goodreads_id: self.shelf_names_for(goodreads_id)
            for goodreads_id in self.books
        }


class FeedCollectionTests(unittest.TestCase):
    def test_http_failure_raises_instead_of_looking_like_end_of_feed(self):
        with patch.object(
            goodreads.requests,
            'get',
            side_effect=goodreads.requests.exceptions.Timeout('timed out'),
        ):
            with self.assertRaises(goodreads.FeedFetchError):
                goodreads.fetch_rss('read', page=2)

    def test_valid_empty_page_is_required_to_complete_pagination(self):
        pages = [
            rss_page(rss_item(101, 'currently-reading')),
            rss_page(),
        ]

        with patch.object(goodreads, 'fetch_rss', side_effect=pages) as fetch:
            snapshot = goodreads.get_all_books_from_shelf('currently-reading')

        self.assertTrue(snapshot.complete)
        self.assertEqual(snapshot.terminal_page, 2)
        self.assertEqual([book.goodreads_id for book in snapshot.books], [101])
        self.assertEqual(fetch.call_count, 2)

    def test_empty_first_page_is_rejected_by_default(self):
        with patch.object(goodreads, 'fetch_rss', return_value=rss_page()):
            with self.assertRaises(goodreads.PruneSafetyError):
                goodreads.get_all_books_from_shelf('currently-reading')

    def test_empty_first_page_is_allowed_only_with_explicit_override(self):
        with patch.object(goodreads, 'fetch_rss', return_value=rss_page()):
            snapshot = goodreads.get_all_books_from_shelf(
                'currently-reading',
                allow_empty=True,
            )

        self.assertTrue(snapshot.complete)
        self.assertEqual(snapshot.terminal_page, 1)
        self.assertEqual(snapshot.books, ())

    def test_malformed_xml_aborts_the_shelf(self):
        with patch.object(goodreads, 'fetch_rss', return_value=b'<rss><channel>'):
            with self.assertRaises(goodreads.FeedParseError):
                goodreads.get_all_books_from_shelf('read')

    def test_failure_after_a_nonempty_page_aborts_partial_pagination(self):
        pages = [
            rss_page(rss_item(101, 'read')),
            goodreads.FeedFetchError('page two failed'),
        ]

        with patch.object(goodreads, 'fetch_rss', side_effect=pages):
            with self.assertRaises(goodreads.FeedFetchError):
                goodreads.get_all_books_from_shelf('read')

    def test_safety_limit_without_an_empty_page_is_not_complete(self):
        with patch.object(goodreads, 'MAX_RSS_PAGES', 1), patch.object(
            goodreads,
            'fetch_rss',
            return_value=rss_page(rss_item(101, 'read')),
        ):
            with self.assertRaises(goodreads.FeedPaginationError):
                goodreads.get_all_books_from_shelf('read')

    def test_snapshot_unions_shelves_and_reports_every_feed_complete(self):
        book = make_book(101)
        current = goodreads.ShelfSnapshot(
            shelf='currently-reading',
            books=(book,),
            book_shelves={101: ['favorites']},
            terminal_page=2,
        )
        read = goodreads.ShelfSnapshot(
            shelf='read',
            books=(book,),
            book_shelves={101: ['nonfiction']},
            terminal_page=2,
        )

        with patch.object(
            goodreads,
            'get_all_books_from_shelf',
            side_effect=[current, read],
        ):
            snapshot = goodreads.fetch_goodreads_snapshot()

        self.assertEqual(snapshot.completed_shelves, frozenset(goodreads.SHELVES_TO_SYNC))
        self.assertEqual(
            set(snapshot.book_shelves[101]),
            {'currently-reading', 'read', 'favorites', 'nonfiction'},
        )


class ReconciliationTests(unittest.TestCase):
    def test_book_absent_from_all_feeds_is_deleted_with_its_join_rows_first(self):
        removed = make_book(101, 'Removed')
        retained = [
            make_book(goodreads_id, f'Retained {goodreads_id}')
            for goodreads_id in (202, 203, 204, 205)
        ]
        db = InMemoryDatabase(
            [(removed, ['currently-reading'])]
            + [(book, ['read']) for book in retained]
        )
        snapshot = complete_snapshot([(book, ['read']) for book in retained])

        with patch.object(goodreads, 'fetch_goodreads_snapshot', return_value=snapshot):
            goodreads.sync_from_goodreads(db)

        self.assertEqual(
            db.visible_state(),
            {book.goodreads_id: {'read'} for book in retained},
        )
        self.assertLess(
            db.events.index('delete_join_rows'),
            db.events.index('delete_books'),
        )
        self.assertEqual(db.commits, 1)
        self.assertEqual(db.rollbacks, 0)

    def test_currently_reading_to_read_reconciles_the_relationship(self):
        book = make_book(101)
        db = InMemoryDatabase([(book, ['currently-reading'])])
        snapshot = complete_snapshot([(book, ['read'])])

        with patch.object(goodreads, 'fetch_goodreads_snapshot', return_value=snapshot):
            goodreads.sync_from_goodreads(db)

        self.assertEqual(db.shelf_names_for(101), {'read'})

    def test_feed_failure_does_not_touch_existing_database_state(self):
        book = make_book(101)
        db = InMemoryDatabase([(book, ['currently-reading'])])
        before = db.visible_state()

        with patch.object(
            goodreads,
            'fetch_goodreads_snapshot',
            side_effect=goodreads.FeedFetchError('read page two failed'),
        ):
            with self.assertRaises(goodreads.FeedFetchError):
                goodreads.sync_from_goodreads(db)

        self.assertEqual(db.visible_state(), before)
        self.assertEqual(db.commits, 0)
        self.assertEqual(db.rollbacks, 1)
        self.assertNotIn('delete_books', db.events)

    def test_database_failure_rolls_back_all_prior_reconciliation_work(self):
        book = make_book(101)
        db = InMemoryDatabase()
        db.fail_on = 'insert_books_shelves'
        snapshot = complete_snapshot([(book, ['read'])])

        with patch.object(goodreads, 'fetch_goodreads_snapshot', return_value=snapshot):
            with self.assertRaises(goodreads.psycopg2.DatabaseError):
                goodreads.sync_from_goodreads(db)

        self.assertEqual(db.visible_state(), {})
        self.assertEqual(db.commits, 0)
        self.assertEqual(db.rollbacks, 1)

    def test_large_prune_is_rejected_before_any_database_write(self):
        books = [make_book(goodreads_id) for goodreads_id in range(101, 106)]
        db = InMemoryDatabase([(book, ['read']) for book in books])
        before = db.visible_state()
        snapshot = complete_snapshot([(book, ['read']) for book in books[:3]])

        with patch.object(goodreads, 'fetch_goodreads_snapshot', return_value=snapshot):
            with self.assertRaises(goodreads.PruneSafetyError):
                goodreads.sync_from_goodreads(db)

        self.assertEqual(db.visible_state(), before)
        self.assertEqual(db.events, ['rollback'])
        self.assertEqual(db.commits, 0)
        self.assertEqual(db.rollbacks, 1)

    def test_explicit_override_allows_intentional_large_prune(self):
        books = [make_book(goodreads_id) for goodreads_id in range(101, 106)]
        db = InMemoryDatabase([(book, ['read']) for book in books])
        snapshot = complete_snapshot([(book, ['read']) for book in books[:2]])

        with patch.object(
            goodreads,
            'fetch_goodreads_snapshot',
            return_value=snapshot,
        ) as fetch:
            goodreads.sync_from_goodreads(db, allow_large_prune=True)

        fetch.assert_called_once_with(allow_large_prune=True)
        self.assertEqual(set(db.visible_state()), {101, 102})
        self.assertEqual(db.commits, 1)
        self.assertEqual(db.rollbacks, 0)

    def test_successful_rerun_is_idempotent(self):
        book = make_book(101)
        db = InMemoryDatabase()
        snapshot = complete_snapshot([(book, ['read', 'favorites'])])

        with patch.object(goodreads, 'fetch_goodreads_snapshot', return_value=snapshot):
            goodreads.sync_from_goodreads(db)
            after_first_sync = db.visible_state()
            goodreads.sync_from_goodreads(db)

        self.assertEqual(db.visible_state(), after_first_sync)
        self.assertEqual(db.visible_state(), {101: {'read', 'favorites'}})
        self.assertEqual(db.commits, 2)
        self.assertEqual(db.rollbacks, 0)

    def test_incomplete_snapshot_is_rejected_before_database_queries(self):
        db = InMemoryDatabase()
        snapshot = goodreads.GoodreadsSnapshot(
            books={},
            book_shelves={},
            completed_shelves=frozenset({'read'}),
        )

        with self.assertRaises(goodreads.GoodreadsSyncError):
            goodreads.reconcile_database(db, snapshot)

        self.assertEqual(db.events, [])


class DatabaseWrapperTests(unittest.TestCase):
    def test_execute_does_not_commit_individual_queries(self):
        cursor = Mock()
        cursor.description = [('answer',)]
        cursor.fetchall.return_value = [(42,)]
        connection = Mock()
        connection.cursor.return_value = cursor
        db = object.__new__(goodreads.Database)
        db.connection = connection

        rows = db.execute('SELECT 42 AS answer')

        self.assertEqual(rows[0].answer, 42)
        connection.commit.assert_not_called()
        connection.rollback.assert_not_called()
        cursor.close.assert_called_once_with()

    def test_delete_books_explicitly_deletes_join_rows_before_books(self):
        db = object.__new__(goodreads.Database)
        db.execute = Mock()

        db.delete_books([9, 3, 9])

        self.assertEqual(db.execute.call_count, 2)
        first_query = db.execute.call_args_list[0].args[0]
        second_query = db.execute.call_args_list[1].args[0]
        self.assertIn('DELETE FROM books_shelves', first_query)
        self.assertIn('DELETE FROM books WHERE', second_query)
        self.assertEqual(db.execute.call_args_list[0].args[1], ([3, 9],))
        self.assertEqual(db.execute.call_args_list[1].args[1], ([3, 9],))

    def test_cli_exposes_large_prune_override(self):
        args = goodreads.build_argument_parser().parse_args(['--allow-large-prune'])

        self.assertTrue(args.allow_large_prune)


if __name__ == '__main__':
    unittest.main()
