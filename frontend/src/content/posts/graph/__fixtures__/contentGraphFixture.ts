import type {
  ContentGraph,
  ContentTaxonomy,
  PostMetadataV2,
  PostStatus,
} from '../../types';
import { compileContentGraph, type GraphVisibility } from '../compileContentGraph';

const taxonomy: ContentTaxonomy = {
  version: 1,
  themes: [
    {
      id: 'practice-and-judgment',
      title: 'Practice & Judgment',
      description: 'How repeated choices form clearer judgment.',
      order: 1,
      anchor: { x: 0.25, y: 0.4 },
      tone: 'oxblood',
    },
    {
      id: 'tools-and-context',
      title: 'Tools & Context',
      description: 'How tools depend on the context around them.',
      order: 2,
      anchor: { x: 0.55, y: 0.35 },
      tone: 'navy',
    },
    {
      id: 'making-and-revision',
      title: 'Making & Revision',
      description: 'How unfinished work becomes useful.',
      order: 3,
      anchor: { x: 0.75, y: 0.65 },
      tone: 'walnut',
    },
    {
      id: 'change-and-identity',
      title: 'Change & Identity',
      description: 'What remains when a familiar role changes.',
      order: 4,
      anchor: { x: 0.35, y: 0.75 },
      tone: 'sage',
    },
  ],
  concepts: [
    { id: 'discipline', label: 'Discipline' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'machine-intelligence', label: 'Machine intelligence', aliases: ['artificial intelligence'] },
    { id: 'curiosity', label: 'Curiosity' },
    { id: 'thinking', label: 'Thinking' },
    { id: 'context', label: 'Context' },
    { id: 'writing', label: 'Writing' },
    { id: 'revision', label: 'Revision' },
    { id: 'identity', label: 'Identity' },
    { id: 'leaving', label: 'Leaving' },
  ],
};

function post(
  slug: string,
  order: number,
  primaryTheme: string,
  conceptIds: readonly string[],
  options: {
    secondaryThemes?: readonly string[];
    status?: PostStatus;
    relations?: PostMetadataV2['relations'];
  } = {},
): PostMetadataV2 {
  return {
    slug,
    title: slug
      .split('-')
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' '),
    dek: `A concrete essay about ${slug.replace(/-/g, ' ')}.`,
    status: options.status ?? 'published',
    sourcePeriod: '2025',
    order,
    themes: {
      primary: primaryTheme,
      ...(options.secondaryThemes ? { secondary: options.secondaryThemes } : {}),
    },
    conceptIds,
    relations: options.relations ?? [],
    wordCount: 440,
    readingMinutes: 2,
  };
}

export const fixturePosts: readonly PostMetadataV2[] = [
  post('steady-practice', 1, 'practice-and-judgment', ['discipline', 'evidence'], {
    secondaryThemes: ['tools-and-context'],
    relations: [
      {
        to: 'question-machine',
        kind: 'contrasts',
        reason: 'One supplies discipline; the other removes the cost of asking.',
      },
      {
        to: 'private-draft',
        kind: 'echoes',
        reason: 'Both examine what happens when a familiar operating model breaks.',
      },
    ],
  }),
  post('question-machine', 2, 'tools-and-context', [
    'machine-intelligence',
    'curiosity',
    'thinking',
  ]),
  post('context-matters', 3, 'tools-and-context', [
    'machine-intelligence',
    'context',
    'thinking',
  ]),
  post('unfinished-letter', 4, 'making-and-revision', ['writing', 'revision']),
  post('private-draft', 5, 'change-and-identity', ['identity', 'leaving'], {
    status: 'draft',
  }),
];

export function createFixtureGraph(visibility: GraphVisibility = 'all'): ContentGraph {
  return compileContentGraph({
    posts: fixturePosts,
    taxonomy,
    visibility,
    bodyLinks: {
      'unfinished-letter': ['context-matters'],
      'question-machine': ['private-draft'],
    },
  });
}

export { taxonomy as fixtureTaxonomy };
