import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pb-10 pt-8">
      <div className="container text-center">
        <div className="site-divider mb-4" />
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-textTertiary">
          © {currentYear} <span className="text-primary/90">Kory Kilpatrick</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
