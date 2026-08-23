export const redirectToLogin = (): void => {
  if (!window.location.pathname.includes('/login')) {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
};
