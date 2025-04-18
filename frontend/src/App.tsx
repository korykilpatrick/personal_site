import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import WorkPage from './pages/WorkPage';
import BookshelfPage from './pages/BookshelfPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AdminPage = lazy(() => import('./pages/AdminPage'));

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
          <Route path="/work" element={<Layout><WorkPage /></Layout>} />
          <Route path="/bookshelf" element={<Layout><BookshelfPage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<div>Loading Admin...</div>}>
                  <AdminPage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
