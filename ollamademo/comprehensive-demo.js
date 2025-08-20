#!/usr/bin/env node

import { spawn } from 'child_process';

// Test cases showing all three prompt types
const testCases = [
  {
    name: 'greeting',
    args: { name: 'Alice' },
    description: 'Personalized Greeting',
    expected: 'Should greet Alice by name'
  },
  {
    name: 'explain-concept',
    args: { 
      concept: 'blockchain', 
      audience: '10-year-old' 
    },
    description: 'Concept Explanation',
    expected: 'Should explain blockchain to a 10-year-old'
  },
  {
    name: 'code-review',
    args: { 
      language: 'javascript',
      code: 'const x = 1; var y = 2; function add() { return x + y }'
    },
    description: 'Code Review',
    expected: 'Should review the JavaScript code'
  }
];

async function runTest(testCase, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST ${index + 1}: ${testCase.description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Arguments:`, testCase.args);
  console.log('');
  
  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  return new Promise((resolve) => {
    let step = 0;
    let startTime = Date.now();

    serverProcess.stdout.on('data', (data) => {
      const response = data.toString().trim();
      step++;
      
      if (step === 1) {
        console.log('🔧 Server initialized');
        
        // Send prompt request with proper format
        const promptRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'prompts/get',
          params: {
            name: testCase.name,
            arguments: testCase.args
          }
        };
        
        console.log('📤 Sending request to Ollama...');
        serverProcess.stdin.write(JSON.stringify(promptRequest) + '\n');
        
      } else if (step === 2) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Response received in ${elapsed}s\n`);
        
        try {
          const parsed = JSON.parse(response);
          if (parsed.result && parsed.result.messages) {
            console.log('📝 RENDERED PROMPT:');
            console.log('-'.repeat(40));
            console.log(parsed.result.messages[0].content.text);
            
            console.log('\n🤖 OLLAMA RESPONSE:');
            console.log('-'.repeat(40));
            console.log(parsed.result.messages[1].content.text);
          } else {
            console.log('❌ Unexpected response format:', parsed);
          }
        } catch (e) {
          console.log('❌ Parse error:', e.message);
          console.log('Raw response:', response.substring(0, 200) + '...');
        }
        
        setTimeout(() => {
          serverProcess.kill();
          resolve();
        }, 100);
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Server error:', error);
      resolve();
    });

    // Initialize the server
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'comprehensive-demo', version: '1.0.0' }
      }
    };

    serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    // Timeout for this test
    setTimeout(() => {
      console.log('⏱️  Test timed out after 25 seconds');
      serverProcess.kill();
      resolve();
    }, 25000);
  });
}

async function main() {
  console.log('🚀 MCP-Ollama Comprehensive Demo');
  console.log('Testing all available prompts with different scenarios\n');
  
  for (let i = 0; i < testCases.length; i++) {
    try {
      await runTest(testCases[i], i);
      
      // Brief pause between tests
      if (i < testCases.length - 1) {
        console.log('\n⏳ Preparing next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 All tests completed!');
  console.log(`${'='.repeat(60)}`);
  process.exit(0);
}

main().catch(console.error);
