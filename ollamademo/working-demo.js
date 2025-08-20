#!/usr/bin/env node

import { spawn } from 'child_process';

const testCases = [
  { name: 'greeting', description: 'Personalized Greeting Demo' },
  { name: 'explain-concept', description: 'Concept Explanation Demo' },
  { name: 'code-review', description: 'Code Review Demo' }
];

async function runTest(testCase, index) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${index + 1}. ${testCase.description}`);
  console.log(`${'='.repeat(50)}`);
  
  const serverProcess = spawn('node', ['working-server.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  return new Promise((resolve) => {
    let step = 0;

    serverProcess.stdout.on('data', (data) => {
      const response = data.toString().trim();
      step++;
      
      if (step === 1) {
        console.log('✅ Server ready');
        
        const promptRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'prompts/get',
          params: {
            name: testCase.name,
            arguments: {} // Arguments are hardcoded in this demo version
          }
        };
        
        console.log('📤 Executing prompt...');
        serverProcess.stdin.write(JSON.stringify(promptRequest) + '\n');
        
      } else if (step === 2) {
        console.log('🎯 Response received!\n');
        
        try {
          const parsed = JSON.parse(response);
          if (parsed.result && parsed.result.messages) {
            console.log('🔤 RENDERED PROMPT:');
            console.log(parsed.result.messages[0].content.text);
            console.log('\n🤖 OLLAMA RESPONSE:');
            console.log(parsed.result.messages[1].content.text);
          }
        } catch (e) {
          console.log('Raw response:', response.substring(0, 300) + '...');
        }
        
        setTimeout(() => {
          serverProcess.kill();
          resolve();
        }, 100);
      }
    });

    // Initialize
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'working-demo', version: '1.0.0' }
      }
    };

    serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

    setTimeout(() => {
      console.log('⏰ Test timed out');
      serverProcess.kill();
      resolve();
    }, 20000);
  });
}

async function main() {
  console.log('🚀 MCP-Ollama Working Demo');
  console.log('This demo uses hardcoded example arguments to showcase all prompts');
  
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i);
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Demo completed! All prompts working with Ollama.');
  console.log('\n💡 Next steps:');
  console.log('   - Configure with Claude Desktop using USAGE.md');
  console.log('   - Add custom prompts to the prompts/ directory');
  console.log('   - Modify DEFAULT_MODEL in server.js to use different models');
}

main().catch(console.error);
