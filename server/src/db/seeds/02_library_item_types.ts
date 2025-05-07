import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Insert common library item types
  await knex('library_item_types').del(); // Clear existing if any
  await knex('library_item_types').insert([
    { name: 'blog' },
    { name: 'article' },
    { name: 'video' },
    { name: 'tweet' },
    { name: 'show' },
    { name: 'movie' },
    { name: 'quote' },
    { name: 'company' },
    { name: 'paper' },
    { name: 'product' },
    { name: 'event' },
  ]);
}