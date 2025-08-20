#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing fixed server...');

const serverProcess = spawn('node', ['fixed-server.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let step = 0;

serverProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  step++;
  
  if (step === 1) {
    console.log('✅ Server initialized');
    setTimeout(() => {
      const listRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'prompts/list',
        params: {}
      };
      
      console.log('📋 Requesting prompts list...');
      serverProcess.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 500);
  } else if (step === 2) {
    try {
      const parsed = JSON.parse(response);
      if (parsed.error) {
        console.log('❌ Error:', parsed.error.message);
      } else if (parsed.result && parsed.result.prompts) {
        console.log('✅ SUCCESS! Prompts listed:');
        parsed.result.prompts.forEach((prompt, i) => {
          console.log(`   ${i+1}. ${prompt.name} - ${prompt.title}`);
        });
      }
    } catch (e) {
      console.log('❌ Parse error:', e.message);
    }
    
    serverProcess.kill();
    process.exit(0);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.log('🔧', data.toString().trim());
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
  console.log('⏰ Timeout - cleaning up');
  serverProcess.kill();
  process.exit(1);
}, 5000);
