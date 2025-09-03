import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  console.log('✅ Simple test setup completed');
});

afterAll(async () => {
  console.log('✅ Simple test cleanup completed');
});