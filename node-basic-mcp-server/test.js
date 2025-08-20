#!/usr/bin/env node

import { spawn } from "child_process";
import { strict as assert } from "assert";

class MCPTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running test: ${testName}`);
    this.currentTest = testName;
    
    try {
      await testFn();
      this.testResults.push({ name: testName, status: 'PASS' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async sendMessage(server, message) {
    return new Promise((resolve, reject) => {
      let responseData = '';
      let errorData = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Test timeout - no response received'));
      }, 5000);

      const onData = (data) => {
        responseData += data.toString();
        
        // Check if we have a complete JSON response
        try {
          const lines = responseData.trim().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              const parsed = JSON.parse(line);
              clearTimeout(timeout);
              server.stdout.removeListener('data', onData);
              server.stderr.removeListener('data', onError);
              resolve(parsed);
              return;
            }
          }
        } catch (e) {
          // Not complete JSON yet, continue waiting
        }
      };

      const onError = (data) => {
        errorData += data.toString();
      };

      server.stdout.on('data', onData);
      server.stderr.on('data', onError);

      // Send the message
      server.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  async testListTools() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
      };

      const response = await this.sendMessage(server, message);
      
      // Validate response structure
      assert(response.jsonrpc === "2.0", "Response should have jsonrpc 2.0");
      assert(response.id === 1, "Response should have matching id");
      assert(response.result, "Response should have result");
      assert(Array.isArray(response.result.tools), "Result should have tools array");
      assert(response.result.tools.length === 1, "Should have exactly one tool");
      
      const tool = response.result.tools[0];
      assert(tool.name === "add-integers", "Tool name should be add-integers");
      assert(tool.description, "Tool should have description");
      assert(tool.inputSchema, "Tool should have inputSchema");
      assert(tool.inputSchema.properties.a, "Tool should require parameter 'a'");
      assert(tool.inputSchema.properties.b, "Tool should require parameter 'b'");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersValid() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: 5,
            b: 3
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.jsonrpc === "2.0", "Response should have jsonrpc 2.0");
      assert(response.id === 2, "Response should have matching id");
      assert(response.result, "Response should have result");
      assert(Array.isArray(response.result.content), "Result should have content array");
      assert(response.result.content.length === 1, "Should have one content item");
      assert(response.result.content[0].type === "text", "Content should be text type");
      assert(response.result.content[0].text === "8", "5 + 3 should equal 8");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersNegative() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: -10,
            b: 15
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.result.content[0].text === "5", "-10 + 15 should equal 5");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersZero() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: 0,
            b: 0
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.result.content[0].text === "0", "0 + 0 should equal 0");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersFloatError() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: 5.5,
            b: 3
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.error, "Should return error for float input");
      assert(response.error.message.includes("integers"), "Error should mention integers");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersStringError() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: "5",
            b: 3
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.error, "Should return error for string input");
      assert(response.error.message.includes("numbers"), "Error should mention numbers");
      
    } finally {
      server.kill();
    }
  }

  async testAddIntegersMissingParameter() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: 5
            // missing b parameter
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.error, "Should return error for missing parameter");
      
    } finally {
      server.kill();
    }
  }

  async testUnknownTool() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 8,
        method: "tools/call",
        params: {
          name: "unknown-tool",
          arguments: {}
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.error, "Should return error for unknown tool");
      assert(response.error.message.includes("Unknown tool"), "Error should mention unknown tool");
      
    } finally {
      server.kill();
    }
  }

  async testLargeNumbers() {
    const server = spawn('node', ['server.js']);
    
    try {
      const message = {
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {
          name: "add-integers",
          arguments: {
            a: 1000000,
            b: 2000000
          }
        }
      };

      const response = await this.sendMessage(server, message);
      
      assert(response.result.content[0].text === "3000000", "Large number addition should work");
      
    } finally {
      server.kill();
    }
  }

  async runAllTests() {
    console.log("🚀 Starting MCP Server Tests\n");
    
    await this.runTest("List Tools", () => this.testListTools());
    await this.runTest("Add Integers - Valid", () => this.testAddIntegersValid());
    await this.runTest("Add Integers - Negative Numbers", () => this.testAddIntegersNegative());
    await this.runTest("Add Integers - Zero", () => this.testAddIntegersZero());
    await this.runTest("Add Integers - Float Error", () => this.testAddIntegersFloatError());
    await this.runTest("Add Integers - String Error", () => this.testAddIntegersStringError());
    await this.runTest("Add Integers - Missing Parameter", () => this.testAddIntegersMissingParameter());
    await this.runTest("Unknown Tool Error", () => this.testUnknownTool());
    await this.runTest("Large Numbers", () => this.testLargeNumbers());

    this.printSummary();
  }

  printSummary() {
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log("\nFailed Tests:");
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
    
    console.log("\n" + (failed === 0 ? "🎉 All tests passed!" : "💥 Some tests failed!"));
    
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPTester();
  tester.runAllTests().catch(console.error);
}

export default MCPTester;
