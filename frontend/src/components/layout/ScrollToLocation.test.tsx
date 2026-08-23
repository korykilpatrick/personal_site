import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import ScrollToLocation from './ScrollToLocation';

const NavigationHarness: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <ScrollToLocation />
      <span data-testid="pathname">{location.pathname}</span>
      <button type="button" onClick={() => navigate('/posts/example')}>
        Open post
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  );
};

describe('ScrollToLocation', () => {
  beforeEach(() => {
    let frameId = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameId += 1;
      callback(frameId);
      return frameId;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('preserves the saved document position when browser history pops', async () => {
    render(
      <MemoryRouter
        initialEntries={['/posts?view=list', '/posts/example']}
        initialIndex={1}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <NavigationHarness />
      </MemoryRouter>,
    );
    document.documentElement.scrollTop = 680;
    document.body.scrollTop = 680;

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByTestId('pathname')).toHaveTextContent('/posts'));

    expect(document.documentElement.scrollTop).toBe(680);
    expect(document.body.scrollTop).toBe(680);
  });

  test('still resets a newly pushed pathname', async () => {
    render(
      <MemoryRouter
        initialEntries={['/posts?view=list']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <NavigationHarness />
      </MemoryRouter>,
    );
    document.documentElement.scrollTop = 680;
    document.body.scrollTop = 680;

    fireEvent.click(screen.getByRole('button', { name: 'Open post' }));
    await waitFor(() => expect(screen.getByTestId('pathname')).toHaveTextContent('/posts/example'));

    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });
});
