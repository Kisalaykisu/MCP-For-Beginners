#!/usr/bin/env node

import { spawn } from 'child_process';

async function testPromptListing() {
  console.log('Testing MCP server prompt listing...');
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  let responseCount = 0;
  const responses = [];

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

  // After a short delay, send prompts/list request
  setTimeout(() => {
    const listPromptsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'prompts/list',
      params: {}
    };
    
    console.log('Sending prompts/list request...');
    serverProcess.stdin.write(JSON.stringify(listPromptsRequest) + '\n');
  }, 1000);

  // Listen for responses
  serverProcess.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log('Server response:', response);
    responses.push(response);
    responseCount++;
    
    if (responseCount >= 2) {
      // We've got both responses, clean up
      setTimeout(() => {
        serverProcess.kill();
        process.exit(0);
      }, 500);
    }
  });

  serverProcess.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    console.log('Server exited with code:', code);
  });

  // Clean up after 10 seconds max
  setTimeout(() => {
    serverProcess.kill();
    process.exit(0);
  }, 10000);
}

testPromptListing().catch(console.error);
