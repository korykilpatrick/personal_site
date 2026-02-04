describe('frontend config', () => {
  const originalEnv = process.env.REACT_APP_API_BASE_URL;

  afterEach(() => {
    process.env.REACT_APP_API_BASE_URL = originalEnv;
    jest.resetModules();
  });

  it('defaults apiBaseUrl to /api when env is missing', async () => {
    delete process.env.REACT_APP_API_BASE_URL;
    jest.resetModules();

    const { default: config } = await import('../config');
    expect(config.apiBaseUrl).toBe('/api');
  });

  it('uses REACT_APP_API_BASE_URL when provided', async () => {
    process.env.REACT_APP_API_BASE_URL = 'https://example.com/api';
    jest.resetModules();

    const { default: config } = await import('../config');
    expect(config.apiBaseUrl).toBe('https://example.com/api');
  });
});
