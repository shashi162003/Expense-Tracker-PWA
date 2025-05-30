#!/usr/bin/env node

/**
 * Debug Startup Script for Expense Tracker API
 * This script starts the server and opens the debug page automatically
 */

const { spawn } = require('child_process');
const open = require('open');

console.log('🚀 Starting Expense Tracker API in Debug Mode...\n');

// Start the server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start, then open debug page
setTimeout(() => {
  console.log('\n🌐 Opening debug page in browser...');
  open('http://localhost:5000/debug').catch(err => {
    console.log('Could not open browser automatically. Please visit: http://localhost:5000/debug');
  });
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('close', (code) => {
  console.log(`\n📊 Server process exited with code ${code}`);
  process.exit(code);
});
