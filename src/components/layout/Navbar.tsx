import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'Work',
      path: '#',
      dropdown: true,
      items: [
        { name: 'Projects', path: '/projects' },
        { name: 'Gigs', path: '/gigs' },
        { name: 'Timeline', path: '/timeline' },
      ],
    },
    { name: 'Blog', path: '/blog' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            Portfolio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.name}
                  className="relative group pb-2"
                  onMouseEnter={() => setIsWorkDropdownOpen(true)}
                  onMouseLeave={() => setIsWorkDropdownOpen(false)}
                >
                  <button className="flex items-center text-textPrimary hover:text-primary transition">
                    {link.name}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isWorkDropdownOpen && (
                    <div className="absolute left-0 mt-0 -mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-2">
                      {link.items?.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block px-4 py-2 hover:bg-gray-100 ${
                            isActive(item.path) ? 'text-primary font-medium' : 'text-textPrimary'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path) ? 'text-primary font-medium' : 'text-textPrimary'
                  } hover:text-primary transition`}
                >
                  {link.name}
                </Link>
              ),
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-textPrimary focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.name} className="space-y-2">
                  <button
                    className="flex items-center w-full text-left py-2 text-textPrimary"
                    onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
                  >
                    {link.name}
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform ${
                        isWorkDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isWorkDropdownOpen && (
                    <div className="pl-4 space-y-2">
                      {link.items?.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block py-2 ${
                            isActive(item.path) ? 'text-primary font-medium' : 'text-textPrimary'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-2 ${
                    isActive(link.path) ? 'text-primary font-medium' : 'text-textPrimary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ),
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
