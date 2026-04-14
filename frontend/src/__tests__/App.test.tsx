import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the components to avoid rendering the entire app
jest.mock('../components/layout/Navbar', () => {
  const MockNavbar = () => <div data-testid="navbar">Navbar</div>;
  MockNavbar.displayName = 'MockNavbar';
  return MockNavbar;
});
jest.mock('../components/layout/Footer', () => {
  const MockFooter = () => <div data-testid="footer">Footer</div>;
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});
jest.mock('../pages/HomePage', () => {
  const MockHomePage = () => <div data-testid="home-page">Home Page</div>;
  MockHomePage.displayName = 'MockHomePage';
  return MockHomePage;
});
jest.mock('../pages/AboutPage', () => {
  const MockAboutPage = () => <div>About Page</div>;
  MockAboutPage.displayName = 'MockAboutPage';
  return MockAboutPage;
});
jest.mock('../pages/ProjectsPage', () => {
  const MockProjectsPage = () => <div>Projects Page</div>;
  MockProjectsPage.displayName = 'MockProjectsPage';
  return MockProjectsPage;
});
jest.mock('../pages/WorkPage', () => {
  const MockWorkPage = () => <div>Work Page</div>;
  MockWorkPage.displayName = 'MockWorkPage';
  return MockWorkPage;
});
jest.mock('../pages/BookshelfPage', () => {
  const MockBookshelfPage = () => <div>Bookshelf Page</div>;
  MockBookshelfPage.displayName = 'MockBookshelfPage';
  return MockBookshelfPage;
});
jest.mock('../pages/NotFoundPage', () => {
  const MockNotFoundPage = () => <div>Not Found Page</div>;
  MockNotFoundPage.displayName = 'MockNotFoundPage';
  return MockNotFoundPage;
});

describe('App component', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('renders the bookshelf home route and hides the footer', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Bookshelf Page')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  test('renders the footer on non-home routes', () => {
    window.history.pushState({}, '', '/about');

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(screen.getByText('About Page')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
