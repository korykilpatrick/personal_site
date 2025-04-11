import { Knex } from 'knex';

/**
 * Seed function to populate the database with initial data for projects and work_entries tables
 * Books-related tables already exist in the database and are not affected by this seed
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data from the relevant tables
  await knex('projects').del();
  await knex('work_entries').del();

  // Seed projects
  await knex('projects').insert([
    {
      title: 'Personal Portfolio Website',
      description: 'A responsive personal website built with React, TypeScript, and Tailwind CSS.',
      media_urls: JSON.stringify(['https://via.placeholder.com/800x450?text=Portfolio+Screenshot']),
      project_links: JSON.stringify([
        { title: 'GitHub', url: 'https://github.com/yourusername/portfolio', icon: 'github' },
        { title: 'Live Demo', url: '#', icon: 'external-link' }
      ]),
      writeup: '## Personal Portfolio Website\n\nThis website showcases my work as a software engineer and provides a platform for my blog posts.\n\n### Technologies Used\n\n- React\n- TypeScript\n- Tailwind CSS\n- Node.js\n- Express\n- PostgreSQL\n\n### Features\n\n- Responsive design that works on all devices\n- Interactive timeline of my professional journey\n- Blog with filtering and search functionality\n- Bookshelf integrated with Goodreads\n- Dark mode support',
      project_tags: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Node.js'])
    },
    {
      title: 'E-commerce Platform',
      description: 'A full-stack e-commerce solution with product management, cart functionality, and payment processing.',
      media_urls: JSON.stringify(['https://via.placeholder.com/800x450?text=E-commerce+Screenshot']),
      project_links: JSON.stringify([
        { title: 'GitHub', url: 'https://github.com/yourusername/ecommerce', icon: 'github' }
      ]),
      writeup: '## E-commerce Platform\n\nA complete e-commerce solution built from scratch.\n\n### Technologies Used\n\n- React\n- Redux\n- Node.js\n- Express\n- MongoDB\n- Stripe Payment Integration\n\n### Features\n\n- User authentication and profiles\n- Product catalog with categories and filters\n- Shopping cart and checkout process\n- Payment processing with Stripe\n- Order history and tracking\n- Admin dashboard for inventory management',
      project_tags: JSON.stringify(['React', 'Redux', 'Node.js', 'MongoDB'])
    }
  ]);

  // Seed work_entries
  await knex('work_entries').insert([
    {
      company: 'Tech Solutions Inc.',
      role: 'Senior Software Engineer',
      duration: 'Jan 2022 - Present',
      achievements: 'Led a team of 5 engineers in developing a scalable microservices architecture. Implemented CI/CD pipelines that reduced deployment time by 40%. Mentored junior developers and conducted code reviews.',
      work_entry_links: JSON.stringify([
        { title: 'Company Website', url: 'https://example.com' }
      ])
    },
    {
      company: 'Innovative Startups LLC',
      role: 'Full Stack Developer',
      duration: 'Mar 2020 - Dec 2021',
      achievements: 'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Implemented responsive designs and optimized application performance. Collaborated with UX designers to improve user experience.',
      work_entry_links: JSON.stringify([
        { title: 'Company Website', url: 'https://example.com' },
        { title: 'Project Demo', url: 'https://example.com/demo' }
      ])
    }
  ]);
}