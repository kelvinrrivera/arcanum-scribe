#!/usr/bin/env tsx

import { spawn, exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Starting Arcanum Scribe Development Environment...\n');

// Clean cache and kill any existing processes
console.log('🧹 Cleaning development environment...');
try {
  // Kill any existing node/tsx processes that might be running on our ports
  await execAsync('pkill -f "tsx.*server" || true').catch(() => {});
  await execAsync('pkill -f "node.*3000" || true').catch(() => {});
  await execAsync('pkill -f "vite.*8080" || true').catch(() => {});
  
  // Clean various caches
  await execAsync('rm -rf node_modules/.cache 2>/dev/null || true');
  await execAsync('rm -rf .tsx-cache 2>/dev/null || true');
  await execAsync('rm -rf dist 2>/dev/null || true');
  
  console.log('✅ Environment cleaned successfully\n');
} catch (error) {
  console.log('⚠️  Some cleanup operations failed, but continuing...\n');
}

async function startServers() {
  // Start Express server
  console.log('📡 Starting Express server on port 3000...');
  const server = spawn('npm', ['run', 'server'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait a bit for server to start
  setTimeout(() => {
    console.log('🌐 Starting Vite dev server on port 8080...');
    const client = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      server.kill();
      client.kill();
      process.exit(0);
    });

    server.on('close', (code) => {
      console.log(`📡 Express server exited with code ${code}`);
      client.kill();
    });

    client.on('close', (code) => {
      console.log(`🌐 Vite server exited with code ${code}`);
      server.kill();
    });

  }, 2000);

  server.on('error', (error) => {
    console.error('❌ Failed to start Express server:', error);
    process.exit(1);
  });
}

// Start the servers
startServers().catch((error) => {
  console.error('❌ Failed to start development environment:', error);
  process.exit(1);
});