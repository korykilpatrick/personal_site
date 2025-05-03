import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 pt-4 pb-8 border-t border-primary/10">
      <div className="container text-center">
        <p className="text-textSecondary text-xs font-sans">
          © {currentYear} <span className="text-primary font-medium">Kory Kilpatrick</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;