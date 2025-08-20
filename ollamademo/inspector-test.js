#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔍 Testing prompt listing for MCP Inspector compatibility...');

const serverProcess = spawn('node', ['working-server.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

let responses = 0;

serverProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  responses++;
  
  console.log(`📤 Response ${responses}:`, response);
  
  if (responses === 1) {
    // After init, try to list prompts
    setTimeout(() => {
      const listRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'prompts/list',
        params: {}
      };
      
      console.log('📋 Requesting prompt list...');
      serverProcess.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 500);
  } else if (responses === 2) {
    // Check if listing worked
    try {
      const parsed = JSON.parse(response);
      if (parsed.error) {
        console.log('❌ Error in response:', parsed.error);
      } else if (parsed.result && parsed.result.prompts) {
        console.log('✅ Prompts listed successfully:');
        parsed.result.prompts.forEach((prompt, index) => {
          console.log(`   ${index + 1}. ${prompt.name} - ${prompt.title}`);
        });
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
    
    setTimeout(() => {
      serverProcess.kill();
      process.exit(0);
    }, 100);
  }
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString().trim();
  console.log('🔧 Server log:', error);
});

// Initialize
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'inspector-test', version: '1.0.0' }
  }
};

console.log('🚀 Initializing server...');
serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
  console.log('⏰ Test timeout');
  serverProcess.kill();
  process.exit(1);
}, 10000);
