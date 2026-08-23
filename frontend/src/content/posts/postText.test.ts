import {
  countWords,
  formatReadingTime,
  markdownToPlainText,
  numberFootnotes,
  readingMinutes,
} from './postText';

describe('post text utilities', () => {
  test('counts prose while ignoring markdown and rich-content markup', () => {
    const body = [
      '## A heading',
      '',
      'This is [a linked phrase](/posts/example).',
      '<Figure src="/image.jpg" alt="A quiet room" />',
    ].join('\n');

    expect(markdownToPlainText(body)).toBe('A heading This is a linked phrase.');
    expect(countWords(body)).toBe(7);
  });

  test('uses a minimum one-minute reading time', () => {
    expect(readingMinutes('Tiny note.')).toBe(1);
    expect(formatReadingTime('Tiny note.')).toBe('1 min read');
  });

  test('numbers only footnotes without explicit numbers', () => {
    const body = [
      '<Footnote note="First">one</Footnote>',
      '<Footnote number="9" note="Pinned">two</Footnote>',
      '<Footnote note="Third">three</Footnote>',
    ].join(' ');

    expect(numberFootnotes(body)).toContain('<Footnote number="1" note="First">');
    expect(numberFootnotes(body)).toContain('<Footnote number="9" note="Pinned">');
    expect(numberFootnotes(body)).toContain('<Footnote number="2" note="Third">');
  });

  test('reserves explicit footnote numbers before assigning automatic ones', () => {
    const body = [
      '<Footnote note="Automatic">one</Footnote>',
      '<Footnote number="1" note="Reserved">two</Footnote>',
    ].join(' ');

    expect(numberFootnotes(body)).toContain('<Footnote number="2" note="Automatic">');
  });
});
