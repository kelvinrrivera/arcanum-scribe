// Temporary environment configuration for seeder
// In production, use a proper .env file

export const SEEDER_ENV = {
  SUPABASE_URL: "https://jsionesaegddqcngccie.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaW9uZXNhZWdkZHFjbmdjY2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE0NjI5MiwiZXhwIjoyMDY5NzIyMjkyfQ.JRzyiVsUdIgcCIhUR0YgE4PrCmueHsQeScrZMBQKCGo", // Replace with actual service role key
  
  // Seeder Configuration
  USERS_COUNT: 50,
  ADVENTURES_COUNT: 150,
  INVITE_CODES_COUNT: 20,
  
  // Debug Mode
  DEBUG: true
}; 