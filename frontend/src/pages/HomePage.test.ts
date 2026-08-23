import { getHomePaths } from './HomePage';

describe('home page paths', () => {
  it('omits Posts and renumbers the remaining paths when posts are disabled', () => {
    expect(getHomePaths(false)).toEqual([
      {
        number: '01',
        title: 'Bookshelf',
        note: 'What I’m reading and have read',
        to: '/bookshelf',
      },
      {
        number: '02',
        title: 'About',
        note: 'Poker, software, AI, tennis, Winnie',
        to: '/about',
      },
    ]);
  });

  it('includes Posts first when posts are enabled', () => {
    expect(getHomePaths(true).map(({ number, to }) => ({ number, to }))).toEqual([
      { number: '01', to: '/posts' },
      { number: '02', to: '/bookshelf' },
      { number: '03', to: '/about' },
    ]);
  });
});
