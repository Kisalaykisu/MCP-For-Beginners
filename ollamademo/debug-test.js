#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔍 Debug Test: Checking argument passing');

const serverProcess = spawn('node', ['server.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'] // Capture stderr too
});

let step = 0;

serverProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  step++;
  console.log(`📤 STDOUT ${step}:`, response);
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString().trim();
  console.log(`🐛 STDERR:`, error);
});

// Initialize
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'debug-client', version: '1.0.0' }
  }
};

console.log('🔧 Initializing server...');
serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  const promptRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'prompts/get',
    params: {
      name: 'greeting',
      arguments: { name: 'Debug Test' }
    }
  };
  
  console.log('📤 Sending test prompt with arguments...');
  console.log('Request:', JSON.stringify(promptRequest, null, 2));
  serverProcess.stdin.write(JSON.stringify(promptRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('🛑 Stopping debug test');
  serverProcess.kill();
  process.exit(0);
}, 8000);
