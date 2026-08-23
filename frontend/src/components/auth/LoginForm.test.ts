import { getLoginDestination, normalizeLoginReturnTo } from './LoginForm';

const ORIGIN = 'https://korykilpatrick.com';

describe('login return destination', () => {
  it('normalizes same-origin destinations to a path, search, and hash', () => {
    expect(
      normalizeLoginReturnTo(
        'https://korykilpatrick.com/posts?view=map&theme=learning#focus-12',
        ORIGIN,
      ),
    ).toBe('/posts?view=map&theme=learning#focus-12');
  });

  it.each([
    'https://example.com/posts',
    '//example.com/posts',
    String.raw`\\example.com\posts`,
    String.raw`/\example.com/posts`,
    '/%5C%5Cexample.com/posts',
  ])('rejects an unsafe return destination: %s', (destination) => {
    expect(normalizeLoginReturnTo(destination, ORIGIN)).toBeUndefined();
  });

  it('preserves pathname, search, and hash from router state', () => {
    expect(
      getLoginDestination(
        '',
        {
          from: {
            pathname: '/posts',
            search: '?view=map&theme=learning',
            hash: '#focus-12',
          },
        },
        ORIGIN,
      ),
    ).toBe('/posts?view=map&theme=learning#focus-12');
  });

  it('falls back to safe router state when the query destination is unsafe', () => {
    const search = `?returnTo=${encodeURIComponent('//example.com/posts')}`;

    expect(
      getLoginDestination(
        search,
        { from: { pathname: '/bookshelf', search: '?sort=recent' } },
        ORIGIN,
      ),
    ).toBe('/bookshelf?sort=recent');
  });

  it('falls back to the admin route when no safe destination exists', () => {
    const search = `?returnTo=${encodeURIComponent(String.raw`/\example.com/posts`)}`;

    expect(getLoginDestination(search, null, ORIGIN)).toBe('/admin');
  });
});
