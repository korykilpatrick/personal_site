/** @jest-environment node */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadAndValidateSource } from '../importPrivatePosts';

interface FixtureOptions {
  body?: string;
  manifestTransform?: (manifest: Record<string, unknown>) => void;
  taxonomyTransform?: (taxonomy: Record<string, unknown>) => void;
}

let fixtureDirectory = '';

function writeFixture(options: FixtureOptions = {}): string {
  const manifest: Record<string, unknown> = {
    version: 2,
    posts: [
      {
        slug: 'first-example',
        title: 'First example',
        dek: 'A deliberately generic fixture.',
        status: 'draft',
        sourcePeriod: 'test',
        order: 1,
        themes: { primary: 'first-theme' },
        conceptIds: ['shared-idea'],
        relations: [],
      },
    ],
  };
  const taxonomy: Record<string, unknown> = {
    version: 1,
    themes: [
      {
        id: 'first-theme',
        title: 'First theme',
        description: 'A generic theme.',
        order: 1,
        tone: 'navy',
        anchor: { x: 0.5, y: 0.5 },
      },
    ],
    concepts: [{ id: 'shared-idea', label: 'Shared idea' }],
  };
  options.manifestTransform?.(manifest);
  options.taxonomyTransform?.(taxonomy);

  fs.writeFileSync(path.join(fixtureDirectory, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(fixtureDirectory, 'taxonomy.json'), JSON.stringify(taxonomy));
  fs.writeFileSync(
    path.join(fixtureDirectory, 'graph-layout.json'),
    JSON.stringify({
      version: 1,
      algorithmVersion: 'test-layout-v1',
      sourceFingerprint: `sha256:${'0'.repeat(64)}`,
      coordinateSpace: 'normalized',
      minimumDistance: 0.05,
      nodes: {
        'post:first-example': { x: 0.45, y: 0.55 },
        'post:second-example': { x: 0.65, y: 0.55 },
      },
    }),
  );
  fs.writeFileSync(
    path.join(fixtureDirectory, 'first-example.md'),
    options.body ?? 'A small piece of valid Markdown.',
  );
  return fixtureDirectory;
}

describe('private post importer validation', () => {
  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'post-import-test-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  it('accepts a valid private source bundle without opening the database', () => {
    const source = loadAndValidateSource(writeFixture());

    expect(source.manifest.posts).toHaveLength(1);
    expect(source.bodies.get('first-example')).toContain('valid Markdown');
  });

  it('rejects raw executable HTML before it reaches the renderer', () => {
    expect(() =>
      loadAndValidateSource(writeFixture({ body: 'Text <script>alert(1)</script>' })),
    ).toThrow('raw HTML tag <script> is not allowed');
  });

  it('rejects duplicate taxonomy identifiers', () => {
    expect(() =>
      loadAndValidateSource(
        writeFixture({
          taxonomyTransform: (taxonomy) => {
            const concepts = taxonomy.concepts as unknown[];
            concepts.push({ id: 'shared-idea', label: 'Duplicate' });
          },
        }),
      ),
    ).toThrow('Concept IDs must be unique');
  });

  it('rejects impossible publication dates', () => {
    expect(() =>
      loadAndValidateSource(
        writeFixture({
          manifestTransform: (manifest) => {
            const [post] = manifest.posts as Array<Record<string, unknown>>;
            post.status = 'published';
            post.publishedAt = '2026-02-30';
          },
        }),
      ),
    ).toThrow();
  });

  it('prevents published bodies from exposing unpublished slugs', () => {
    const directory = writeFixture({
      body: 'Continue with [the private example](/posts/second-example).',
      manifestTransform: (manifest) => {
        const posts = manifest.posts as Array<Record<string, unknown>>;
        posts[0].status = 'published';
        posts[0].publishedAt = '2026-01-01';
        posts.push({
          slug: 'second-example',
          title: 'Second example',
          dek: 'Another generic fixture.',
          status: 'draft',
          sourcePeriod: 'test',
          order: 2,
          themes: { primary: 'first-theme' },
          conceptIds: ['shared-idea'],
          relations: [],
        });
      },
    });
    fs.writeFileSync(path.join(directory, 'second-example.md'), 'Private fixture body.');

    expect(() => loadAndValidateSource(directory)).toThrow(
      'published copy cannot expose unpublished post second-example',
    );
  });
});
