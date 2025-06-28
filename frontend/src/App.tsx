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
import { ModalProvider, useModal } from './context/ModalContext';
import ImageModal from './components/common/ImageModal';
import { BooksProvider } from './context/BooksContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastProvider } from './contexts/ToastContext';
import LibraryPage from './pages/LibraryPage'; // <--- Newly used

const AdminPage = lazy(() => import('./pages/AdminPage'));

const GlobalImageModal: React.FC = () => {
  const { isOpen, imageUrl, altText, closeModal } = useModal();
  return <ImageModal isOpen={isOpen} imageUrl={imageUrl} altText={altText} onClose={closeModal} />;
};

const App: React.FC = () => {
  return (
    <ModalProvider>
      <BooksProvider>
        <LibraryProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen bg-background">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
                <Route path="/work" element={<Layout><WorkPage /></Layout>} />
                <Route path="/bookshelf" element={<Layout><BookshelfPage /></Layout>} />

                <Route path="/library" element={<Layout><LibraryPage /></Layout>} />

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
            <GlobalImageModal />
          </div>
          </ToastProvider>
        </LibraryProvider>
      </BooksProvider>
    </ModalProvider>
  );
};

export default App;