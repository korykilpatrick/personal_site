import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import GigsPage from './pages/GigsPage';
import TimelinePage from './pages/TimelinePage';
import BlogPage from './pages/BlogPage';
import BookshelfPage from './pages/BookshelfPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/bookshelf" element={<BookshelfPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
