import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
jest.mock('../pages/AboutPage', () => {
  const MockAboutPage = () => <div>About Page</div>;
  MockAboutPage.displayName = 'MockAboutPage';
  return MockAboutPage;
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

const renderApp = (initialEntries: string[] = ['/']) =>
  render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );

describe('App component', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('renders the about page on the home route and shows the footer', () => {
    renderApp();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('About Page')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders the bookshelf route and hides the footer', async () => {
    window.history.pushState({}, '', '/bookshelf');

    renderApp(['/bookshelf']);

    expect(await screen.findByText('Bookshelf Page')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });
});
