import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout';
import { AuthProvider } from '../context/AuthContext';
import PageMetadata from '@/components/layout/PageMetadata';

const LoginPageContent: React.FC = () => {
  return (
    <Layout>
      <PageMetadata
        title="Sign in"
        description="Private site administration."
        path="/login"
        noIndex
      />
      <div className="login-room">
        <LoginForm />
      </div>
    </Layout>
  );
};

const LoginPage: React.FC = () => (
  <AuthProvider>
    <LoginPageContent />
  </AuthProvider>
);

export default LoginPage;
