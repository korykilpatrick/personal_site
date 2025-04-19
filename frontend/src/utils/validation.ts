export const isRequired = (value: string | undefined | null): boolean => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

// Basic URL format check (adjust regex as needed for stricter validation)
export const isUrl = (value: string | undefined | null): boolean => {
  if (!value) return false;
  // Simple regex: starts with http:// or https://, followed by some characters
  const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  return urlPattern.test(String(value));
};

// Minimum length check
export const minLength = (
  value: string | undefined | null,
  length: number
): boolean => {
  if (!value) return false;
  return String(value).trim().length >= length;
};

// Add more validation functions as needed
// export const isEmail = (value: string): boolean => { ... };
// export const minLength = (value: string, length: number): boolean => { ... }; 