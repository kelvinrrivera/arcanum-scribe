#!/usr/bin/env tsx

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('🔑 Creating admin token...');

// Create admin token
const adminPayload = {
  id: 1,
  email: 'admin@example.com',
  is_admin: true,
  tier: 'professional'
};

const adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '24h' });

console.log('✅ Admin token created:');
console.log(adminToken);
console.log('\n📋 Copy this token and use it in your browser localStorage:');
console.log(`localStorage.setItem('token', '${adminToken}');`);
console.log('\n🌐 Then navigate to: http://localhost:8080/admin');