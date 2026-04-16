import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';
import BookshelfPage from './pages/BookshelfPage';
import { ModalProvider, useModal } from './context/ModalContext';
import ImageModal from './components/common/ImageModal';
import { ToastProvider } from './context/ToastContext';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const QuotesPage = lazy(() => import('./pages/QuotesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

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

  return (
    <ModalProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Layout><AboutPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route
                path="/bookshelf"
                element={
                  <Layout density="compact">
                    <BookshelfPage />
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
