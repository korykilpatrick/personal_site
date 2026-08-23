import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import { ModalProvider, useModal } from './context/ModalContext';
import ImageModal from './components/common/ImageModal';
import { ToastProvider } from './context/ToastContext';
import ScrollToLocation from './components/layout/ScrollToLocation';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const BookshelfPage = lazy(() => import('./pages/BookshelfPage'));
const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PostsRoutes =
  process.env.REACT_APP_POSTS_ENABLED === 'true'
    ? lazy(() => import('./features/posts/PostsRoutes'))
    : null;

const GlobalImageModal: React.FC = () => {
  const { isOpen, imageUrl, altText, closeModal } = useModal();
  return <ImageModal isOpen={isOpen} imageUrl={imageUrl} altText={altText} onClose={closeModal} />;
};

interface RouteLoaderProps {
  label: string;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ label }) => (
  <div className="flex min-h-[40vh] items-center justify-center py-12">
    <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-textTertiary">
      {label}
    </p>
  </div>
);

const App: React.FC = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/bookshelf';
  const room = location.pathname.startsWith('/posts') ? 'posts' : 'default';

  return (
    <ModalProvider>
      <ToastProvider>
        <div className="site-app">
          <a href="#main-content" className="site-skip-link">
            Skip to content
          </a>
          <ScrollToLocation />
          <Navbar />
          <main id="main-content" className={`site-main site-main--${room}`} tabIndex={-1}>
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
              <Route
                path="/about"
                element={
                  <Layout>
                    <AboutPage />
                  </Layout>
                }
              />
              <Route
                path="/bookshelf"
                element={
                  <Layout>
                    <Suspense fallback={<RouteLoader label="Opening the bookshelf" />}>
                      <BookshelfPage />
                    </Suspense>
                  </Layout>
                }
              />
              <Route
                path="/quotes"
                element={
                  <Layout>
                    <Suspense fallback={<RouteLoader label="Loading quotes" />}>
                      <QuotesPage />
                    </Suspense>
                  </Layout>
                }
              />

              {PostsRoutes ? (
                <Route
                  path="/posts/*"
                  element={
                    <Layout>
                      <Suspense fallback={<RouteLoader label="Opening the archive" />}>
                        <PostsRoutes />
                      </Suspense>
                    </Layout>
                  }
                />
              ) : null}

              <Route
                path="/login"
                element={
                  <Suspense fallback={<RouteLoader label="Loading login" />}>
                    <LoginPage />
                  </Suspense>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={<RouteLoader label="Loading admin" />}>
                    <AdminPage />
                  </Suspense>
                }
              />

              <Route
                path="*"
                element={
                  <Layout>
                    <Suspense fallback={<RouteLoader label="Loading page" />}>
                      <NotFoundPage />
                    </Suspense>
                  </Layout>
                }
              />
            </Routes>
          </main>
          {!hideFooter && <Footer />}
          <GlobalImageModal />
        </div>
      </ToastProvider>
    </ModalProvider>
  );
};

export default App;
