import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><NavLink to="/" className="hover:text-gray-300">Home</NavLink></li>
        <li className="relative group">
          <NavLink to="/work" className="hover:text-gray-300">Work</NavLink>
          <ul className="absolute hidden group-hover:block bg-gray-700 p-2">
            <li><NavLink to="/work/projects" className="block hover:text-gray-300">Projects</NavLink></li>
            <li><NavLink to="/work/gigs" className="block hover:text-gray-300">Gigs</NavLink></li>
            <li><NavLink to="/work/timeline" className="block hover:text-gray-300">Timeline</NavLink></li>
          </ul>
        </li>
        <li><NavLink to="/blog" className="hover:text-gray-300">Blog</NavLink></li>
        <li><NavLink to="/bookshelf" className="hover:text-gray-300">Bookshelf</NavLink></li>
        <li><NavLink to="/about" className="hover:text-gray-300">About</NavLink></li>
        <li><NavLink to="/contact" className="hover:text-gray-300">Contact</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navbar;