import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the components to avoid rendering the entire app
jest.mock('../components/layout/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/layout/Footer', () => () => <div data-testid="footer">Footer</div>);
jest.mock('../pages/HomePage', () => () => <div>Home Page</div>);
jest.mock('../pages/AboutPage', () => () => <div>About Page</div>);
jest.mock('../pages/ProjectsPage', () => () => <div>Projects Page</div>);
jest.mock('../pages/WorkPage', () => () => <div>Work Page</div>);
jest.mock('../pages/BookshelfPage', () => () => <div>Bookshelf Page</div>);
jest.mock('../pages/NotFoundPage', () => () => <div>Not Found Page</div>);

describe('App component', () => {
  test('renders the main layout components', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    // Check for navbar and footer
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Check that the home page is rendered by default
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
