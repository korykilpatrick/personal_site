import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';
import apiService from '../api/apiService';
import { formatDate } from '../utils/dateUtils';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

const BlogPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch blog posts
  const {
    data: posts,
    loading,
    error,
    fetchData: fetchPosts
  } = useApi<Post[]>(
    () => {
      if (searchQuery) {
        return apiService.getPosts({ q: searchQuery });
      } else if (selectedTags.length === 1) {
        return apiService.getPosts({ tag: selectedTags[0] });
      } else {
        return apiService.getPosts();
      }
    }
  );
  
  // Re-fetch posts when search or tags change
  React.useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedTags, fetchPosts]);
  
  // Extract all unique tags from posts
  const allTags = React.useMemo(() => {
    if (!posts) return [];
    
    const tags = posts.flatMap(post => post.tags || []);
    return Array.from(new Set(tags));
  }, [posts]);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Filter posts client-side if multiple tags are selected (since the API only supports one tag)
  const filteredPosts = React.useMemo(() => {
    if (!posts) return [];
    if (selectedTags.length <= 1) return posts; // Already filtered by API
    
    return posts.filter(post => 
      selectedTags.some(tag => post.tags.includes(tag))
    );
  }, [posts, selectedTags]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Blog</h1>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-2/3">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-1/3">
            <div className="relative">
              <select
                className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedTags.length === 0 ? '' : selectedTags.join(',')}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTags(value ? value.split(',') : []);
                }}
              >
                <option value="">All Topics</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full transition ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {!filteredPosts || filteredPosts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No posts found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-2">
                <Link to={`/blog/${post.id}`} className="text-textPrimary hover:text-primary transition">
                  {post.title}
                </Link>
              </h2>
              <div className="flex items-center text-sm text-textSecondary mb-4">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="mx-2">•</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span 
                      key={tag}
                      className="cursor-pointer hover:text-primary"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-textSecondary mb-4">{post.excerpt}</p>
              <Link
                to={`/blog/${post.id}`}
                className="inline-flex items-center text-primary hover:underline"
              >
                Read More
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;