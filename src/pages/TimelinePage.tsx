import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { formatDate } from '../utils/dateUtils';

interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  icon?: string;
  tags?: string[];
  links?: {
    title: string;
    url: string;
  }[];
}

const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        // In production, use: const data = await apiService.getTimeline();
        const data: TimelineEvent[] = [
          {
            id: 1,
            title: 'Senior Software Engineer at Tech Solutions Inc.',
            date: '2022-01-15',
            description: 'Leading a team of 5 engineers in developing a scalable microservices architecture. Implementing CI/CD pipelines and mentoring junior developers.',
            icon: 'work',
            tags: ['Leadership', 'Microservices', 'CI/CD']
          },
          {
            id: 2,
            title: 'Advanced Cloud Certification',
            date: '2021-11-05',
            description: 'Obtained advanced certification in cloud architecture and deployment strategies.',
            icon: 'education',
            tags: ['Certification', 'Cloud']
          },
          {
            id: 3,
            title: 'Full Stack Developer at Innovative Startups LLC',
            date: '2020-03-10',
            description: 'Developed and maintained multiple client projects using React, Node.js, and PostgreSQL. Implemented responsive designs and optimized application performance.',
            icon: 'work',
            tags: ['React', 'Node.js', 'PostgreSQL']
          },
          {
            id: 4,
            title: 'Frontend Development Workshop',
            date: '2019-09-15',
            description: 'Conducted a workshop on modern frontend development practices for a community of 50+ developers.',
            icon: 'event',
            tags: ['Speaking', 'Frontend']
          },
          {
            id: 5,
            title: 'Frontend Developer at Web Creations',
            date: '2018-06-01',
            description: 'Built interactive user interfaces using modern JavaScript frameworks. Collaborated with designers to implement pixel-perfect designs.',
            icon: 'work',
            tags: ['Frontend', 'JavaScript']
          },
          {
            id: 6,
            title: 'Computer Science Degree',
            date: '2018-05-15',
            description: 'Graduated with honors with a Bachelor\'s degree in Computer Science.',
            icon: 'education',
            tags: ['Education', 'Computer Science']
          },
          {
            id: 7,
            title: 'First Coding Project',
            date: '2016-04-10',
            description: 'Built my first web application, a simple task management tool.',
            icon: 'project',
            tags: ['Project', 'Web Development']
          }
        ];
        
        // Sort by date (newest first)
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load timeline data');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filterTags = ['All', 'Work', 'Education', 'Project', 'Certification', 'Speaking'];
  
  const filteredEvents = filter && filter !== 'All'
    ? events.filter(event => {
        if (filter === 'Work') return event.icon === 'work';
        if (filter === 'Education') return event.icon === 'education';
        if (filter === 'Project') return event.icon === 'project';
        return event.tags?.includes(filter);
      })
    : events;

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'work':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Professional Timeline</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Professional Timeline</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Professional Timeline</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag === 'All' ? null : tag)}
              className={`px-4 py-2 rounded-md transition ${(!filter && tag === 'All') || filter === tag ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No timeline events found matching the selected filter</p>
        </div>
      ) : (
        <div className="relative border-l-4 border-primary pl-6 ml-4 space-y-10">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline node */}
              <div 
                className="absolute -left-9 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-md"
              >
                {getIconForType(event.icon)}
              </div>
              
              {/* Content */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <time className="block text-sm font-medium text-primary mb-1">
                  {formatDate(event.date)}
                </time>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-textSecondary mb-4">{event.description}</p>
                
                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium cursor-pointer"
                        onClick={() => setFilter(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Links */}
                {event.links && event.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {event.links.map((link, idx) => (
                      <a
                        key={idx}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;