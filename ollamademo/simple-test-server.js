#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Simplified server that definitely won't have schema validation issues
async function main() {
  const server = new McpServer({
    name: 'simple-ollama-server',
    version: '1.0.0',
  });

  // Register prompts without any handlers for now - just to test listing
  server.registerPrompt('greeting', 'Simple Greeting', 'A basic greeting prompt');
  server.registerPrompt('explain', 'Explain Concept', 'Explains concepts simply'); 
  server.registerPrompt('review', 'Code Review', 'Reviews code for improvements');

  console.error('✅ All prompts registered successfully');

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✅ Server connected and ready');
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
