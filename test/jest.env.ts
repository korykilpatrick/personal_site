const setEnv = (key: string, value: string) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
};

setEnv('NODE_ENV', 'test');
setEnv('PORT', '3001');
setEnv('API_PREFIX', '/api');
setEnv('DB_HOST', 'localhost');
setEnv('DB_PORT', '5432');
setEnv('DB_NAME', 'test_db');
setEnv('DB_USER', 'test_user');
setEnv('DB_PASSWORD', 'test_password');
setEnv('CORS_ORIGIN', 'http://localhost:3000');
setEnv('LOG_LEVEL', 'info');
setEnv('JWT_SECRET', 'test-secret');
setEnv('JWT_EXPIRES_IN', '1h');
