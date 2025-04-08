import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

interface Gig {
  id: number;
  company: string;
  role: string;
  duration: string;
  achievements: string;
  links?: {
    title: string;
    url: string;
  }[];
}

const GigsPage: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        // In production, use: const data = await apiService.getGigs();
        const data: Gig[] = [
          {
            id: 1,
            company: 'Tech Solutions Inc.',
            role: 'Senior Software Engineer',
            duration: 'Jan 2022 - Present',
            achievements: 'Led a team of 5 engineers in developing a scalable microservices architecture. Implemented CI/CD pipelines that reduced deployment time by 40%. Mentored junior developers and conducted code reviews.',
            links: [
              { title: 'Company Website', url: 'https://example.com' }
            ]
          },
          {
            id: 2,
            company: 'Innovative Startups LLC',
            role: 'Full Stack Developer',
            duration: 'Mar 2020 - Dec 2021',
            achievements: 'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Implemented responsive designs and optimized application performance. Collaborated with UX designers to improve user experience.',
            links: [
              { title: 'Company Website', url: 'https://example.com' },
              { title: 'Project Demo', url: 'https://example.com/demo' }
            ]
          },
          {
            id: 3,
            company: 'Web Creations',
            role: 'Frontend Developer',
            duration: 'Jun 2018 - Feb 2020',
            achievements: 'Built interactive user interfaces using modern JavaScript frameworks. Collaborated with designers to implement pixel-perfect designs. Improved site performance by optimizing asset delivery and implementing lazy loading.',
            links: [
              { title: 'Company Website', url: 'https://example.com' }
            ]
          }
        ];
        
        setGigs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load professional experience');
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Professional Experience</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Professional Experience</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Professional Experience</h1>
      
      <div className="space-y-8">
        {gigs.map((gig) => (
          <div key={gig.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary">{gig.role}</h2>
                <h3 className="text-xl font-semibold text-textPrimary mb-1">{gig.company}</h3>
              </div>
              <div className="text-textSecondary font-medium mt-1 md:mt-0">{gig.duration}</div>
            </div>
            
            <p className="text-textSecondary mb-4 whitespace-pre-line">{gig.achievements}</p>
            
            {gig.links && gig.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {gig.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GigsPage;