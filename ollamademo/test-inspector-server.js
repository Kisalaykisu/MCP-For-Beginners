#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing inspector-compatible server...');

const serverProcess = spawn('node', ['inspector-compatible-server.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let step = 0;

serverProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  step++;
  
  console.log(`Response ${step}:`, response);
  
  if (step === 1) {
    setTimeout(() => {
      const listRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'prompts/list',
        params: {}
      };
      
      console.log('Sending prompts/list...');
      serverProcess.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 500);
  } else if (step === 2) {
    try {
      const parsed = JSON.parse(response);
      if (parsed.error) {
        console.log('❌ Still getting error:', parsed.error);
      } else {
        console.log('✅ Success! Prompts:', parsed.result?.prompts);
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
    
    serverProcess.kill();
    process.exit(0);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('Server:', data.toString().trim());
});

// Initialize
serverProcess.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  }
}) + '\n');

setTimeout(() => {
  console.log('Timeout');
  serverProcess.kill();
  process.exit(1);
}, 8000);
