import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Homepage from './components/pages/Homepage/Homepage';
import About from './components/pages/About/About';
import Work from './components/pages/Work/Work';
import Blog from './components/pages/Blog/Blog';
import Bookshelf from './components/pages/Bookshelf/Bookshelf';
import Contact from './components/pages/Contact/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/work/*" element={<Work />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;