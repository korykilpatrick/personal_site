export const redirectToLogin = (): void => {
  if (!window.location.pathname.includes('/login')) {
    window.location.assign('/login');
  }
};
