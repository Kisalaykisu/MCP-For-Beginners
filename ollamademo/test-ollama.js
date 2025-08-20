#!/usr/bin/env node

import { spawn } from 'child_process';

async function testPromptExecution() {
  console.log('Testing MCP server prompt execution with Ollama...');
  
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

  // After initialization, send a prompt execution request
  setTimeout(() => {
    const executePromptRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'prompts/get',
      params: {
        name: 'greeting',
        arguments: {
          name: 'Alice'
        }
      }
    };
    
    console.log('Sending prompt execution request with name: Alice...');
    serverProcess.stdin.write(JSON.stringify(executePromptRequest) + '\n');
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

  // Clean up after 30 seconds (Ollama might take a while)
  setTimeout(() => {
    console.log('Test timed out - cleaning up');
    serverProcess.kill();
    process.exit(0);
  }, 30000);
}

testPromptExecution().catch(console.error);
