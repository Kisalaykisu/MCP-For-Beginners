#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';

async function testMcpServer() {
  console.log('Testing MCP server...');
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

  // Listen for response
  let responseBuffer = '';
  
  serverProcess.stdout.on('data', (data) => {
    responseBuffer += data.toString();
    console.log('Server response:', data.toString());
  });

  serverProcess.on('error', (error) => {
    console.error('Server error:', error);
  });

  serverProcess.on('exit', (code) => {
    console.log('Server exited with code:', code);
  });

  // Clean up after 5 seconds
  setTimeout(() => {
    serverProcess.kill();
    process.exit(0);
  }, 5000);
}

testMcpServer().catch(console.error);
