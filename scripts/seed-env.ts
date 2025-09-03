// Environment configuration for seeder
// SECURITY: Use environment variables for sensitive data

export const SEEDER_ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL || "https://your-project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here",
  
  // Seeder Configuration
  USERS_COUNT: 50,
  ADVENTURES_COUNT: 150,
  INVITE_CODES_COUNT: 20,
  
  // Debug Mode
  DEBUG: process.env.NODE_ENV === 'development'
}; 