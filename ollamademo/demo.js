#!/usr/bin/env node

import { spawn } from 'child_process';

// Test different prompts with actual data
const testCases = [
  {
    name: 'greeting',
    args: { name: 'Alice' },
    description: 'Testing personalized greeting'
  },
  {
    name: 'explain-concept',
    args: { 
      concept: 'machine learning', 
      audience: 'beginner' 
    },
    description: 'Testing concept explanation'
  },
  {
    name: 'code-review',
    args: { 
      language: 'javascript',
      code: 'function hello(name) {\n  console.log("Hello " + name)\n}'
    },
    description: 'Testing code review'
  }
];

async function runPromptTest(testCase) {
  console.log(`\n=== ${testCase.description} ===`);
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  return new Promise((resolve) => {
    let responseCount = 0;

    // Initialize the server
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // Execute the prompt
    setTimeout(() => {
      const promptRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'prompts/get',
        params: {
          name: testCase.name,
          arguments: testCase.args
        }
      };
      
      console.log(`Executing prompt: ${testCase.name}`);
      console.log('Arguments:', JSON.stringify(testCase.args, null, 2));
      serverProcess.stdin.write(JSON.stringify(promptRequest) + '\n');
    }, 500);

    serverProcess.stdout.on('data', (data) => {
      const response = data.toString().trim();
      responseCount++;
      
      if (responseCount === 2) {
        // This is the prompt response
        try {
          const parsed = JSON.parse(response);
          if (parsed.result && parsed.result.messages) {
            console.log('\n--- User Prompt ---');
            console.log(parsed.result.messages[0].content.text);
            console.log('\n--- Ollama Response ---');
            console.log(parsed.result.messages[1].content.text);
          }
        } catch (e) {
          console.log('Raw response:', response);
        }
        
        serverProcess.kill();
        setTimeout(resolve, 100);
      }
    });

    // Cleanup after timeout
    setTimeout(() => {
      serverProcess.kill();
      resolve();
    }, 30000);
  });
}

async function runAllTests() {
  console.log('Testing MCP Server with Ollama Integration');
  console.log('==========================================');
  
  for (const testCase of testCases) {
    try {
      await runPromptTest(testCase);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
    } catch (error) {
      console.error(`Error testing ${testCase.name}:`, error);
    }
  }
  
  console.log('\n=== All tests completed ===');
}

runAllTests().catch(console.error);
