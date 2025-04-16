interface AppConfig {
  apiBaseUrl: string;
  // Add other frontend-specific configurations here
}

// Use environment variables provided by the build tool (e.g., Webpack DefinePlugin, Vite)
// Ensure these variables are set up in your webpack.config.js or similar
const config: AppConfig = {
  // Default to relative /api path, can be overridden by env var
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '/api', 
};

export default config; 