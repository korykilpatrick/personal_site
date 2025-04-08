import { Knex } from 'knex';

/**
 * Seed function to populate the database with initial data for projects, gigs, and posts tables
 * Books-related tables already exist in the database and are not affected by this seed
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data from the new tables
  await knex('projects').del();
  await knex('gigs').del();
  await knex('posts').del();

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

  // Seed gigs
  await knex('gigs').insert([
    {
      company: 'Tech Solutions Inc.',
      role: 'Senior Software Engineer',
      duration: 'Jan 2022 - Present',
      achievements: 'Led a team of 5 engineers in developing a scalable microservices architecture. Implemented CI/CD pipelines that reduced deployment time by 40%. Mentored junior developers and conducted code reviews.',
      gig_links: JSON.stringify([
        { title: 'Company Website', url: 'https://example.com' }
      ])
    },
    {
      company: 'Innovative Startups LLC',
      role: 'Full Stack Developer',
      duration: 'Mar 2020 - Dec 2021',
      achievements: 'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Implemented responsive designs and optimized application performance. Collaborated with UX designers to improve user experience.',
      gig_links: JSON.stringify([
        { title: 'Company Website', url: 'https://example.com' },
        { title: 'Project Demo', url: 'https://example.com/demo' }
      ])
    }
  ]);

  // Seed blog posts
  await knex('posts').insert([
    {
      title: 'Getting Started with React and TypeScript',
      content: '# Getting Started with React and TypeScript\n\nTypeScript has become increasingly popular in the React ecosystem, and for good reason. It adds static typing to JavaScript, which can help catch errors during development and improve code quality.\n\n## Benefits of TypeScript with React\n\n- **Type checking**: Catch errors at compile time rather than runtime\n- **Better developer experience**: Improved autocompletion and documentation\n- **Easier refactoring**: Types make it safer to change your code\n- **Self-documenting code**: Types serve as documentation\n\n## Setting Up a Project\n\nThe easiest way to start a new React project with TypeScript is to use Create React App:\n\n```bash\nnpx create-react-app my-app --template typescript\n```\n\nThis sets up a new React project with TypeScript configuration already in place.\n\n## Basic TypeScript with React\n\nHere\'s a simple example of a React component with TypeScript:\n\n```tsx\ninterface ButtonProps {\n  text: string;\n  onClick: () => void;\n  disabled?: boolean;\n}\n\nconst Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {\n  return (\n    <button\n      onClick={onClick}\n      disabled={disabled}\n      className="px-4 py-2 bg-blue-500 text-white rounded"\n    >\n      {text}\n    </button>\n  );\n};\n```\n\nWith TypeScript, you define an interface for your component props, which helps ensure that the component is used correctly.\n\n## Conclusion\n\nAdding TypeScript to your React projects can significantly improve code quality and developer experience. While there is a learning curve, the benefits of type safety and improved tooling make it worthwhile for most projects.',
      date: '2023-06-15',
      post_tags: JSON.stringify(['React', 'TypeScript', 'Web Development']),
      excerpt: 'Learn how to set up a new project with React and TypeScript to improve your development experience.'
    },
    {
      title: 'The Power of Meditation in Software Development',
      content: '# The Power of Meditation in Software Development\n\nIn the fast-paced world of software development, finding ways to stay focused and clear-minded is essential. One practice that has gained popularity among developers is meditation.\n\n## How Meditation Helps Developers\n\n### Improved Focus\n\nMeditation trains your brain to focus on one thing at a time. This skill is invaluable when diving deep into complex code or debugging issues that require sustained attention.\n\n### Better Problem-Solving\n\nRegular meditation creates mental space that allows for more creative thinking. Often, solutions to difficult problems come during moments of mental clarity rather than intense concentration.\n\n### Reduced Stress\n\nSoftware development can be stressful, with tight deadlines and complex challenges. Meditation helps reduce stress and prevents burnout, keeping you productive in the long run.\n\n## Simple Meditation Practices for Developers\n\n### 1. Mindful Breathing (5 minutes)\n\nTake a short break from coding and focus solely on your breath for 5 minutes. When your mind wanders to that bug you\'re fixing or the feature you\'re implementing, gently bring your attention back to your breath.\n\n### 2. Code Review Mindfulness\n\nBefore starting a code review, take 2 minutes to clear your mind. This helps you approach the code with fresh eyes and avoid bringing preconceptions or biases.\n\n### 3. Pomodoro Meditation\n\nAdd a 3-minute meditation to your Pomodoro breaks. After 25 minutes of focused work, take a 5-minute break with the first 3 minutes spent in meditation.\n\n## Conclusion\n\nIncorporating meditation into your development routine doesn\'t require hours of practice. Even short, consistent sessions can lead to significant improvements in focus, problem-solving abilities, and overall well-being. As a developer, your mind is your most valuable tool—meditation helps keep it sharp and clear.',
      date: '2023-05-22',
      post_tags: JSON.stringify(['Productivity', 'Spirituality', 'Mental Health']),
      excerpt: 'How regular meditation practice can improve focus, problem-solving, and overall code quality.'
    }
  ]);
}