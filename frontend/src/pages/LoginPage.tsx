import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout';
import { Card } from '../components/common';
import { AuthProvider } from '../context/AuthContext';

const LoginPageContent: React.FC = () => {
  return (
    <Layout> { /* Optional: Use Layout if you want Navbar/Footer */ }
      <div className="flex justify-center pt-12">
        <Card className="w-full max-w-sm p-6">
          <LoginForm />
        </Card>
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
