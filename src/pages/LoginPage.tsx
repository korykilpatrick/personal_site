import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout'; // Optional: Wrap in main layout

const LoginPage: React.FC = () => {
  return (
    <Layout> { /* Optional: Use Layout if you want Navbar/Footer */ }
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage; 