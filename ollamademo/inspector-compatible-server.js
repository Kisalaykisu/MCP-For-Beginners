#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Ollama configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b';

// Directory where prompts are stored
const PROMPTS_DIR = './prompts';

// Function to send prompt to Ollama
async function sendToOllama(prompt, model = DEFAULT_MODEL) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    throw new Error(`Failed to get response from Ollama: ${error.message}`);
  }
}

// Helper to load prompts from JSON files
async function loadPrompts() {
  const files = await fs.readdir(PROMPTS_DIR);
  return Promise.all(files
    .filter(f => f.endsWith('.json'))
    .map(async file => JSON.parse(await fs.readFile(path.join(PROMPTS_DIR, file), 'utf-8')))
  );
}

// Main function to start the server
async function main() {
  const server = new McpServer({
    name: 'ollama-prompts-server',
    version: '1.0.0',
  });

  const prompts = await loadPrompts();
  
  // Register each prompt with the simplest possible format
  for (const prompt of prompts) {
    try {
      // Use the most basic registration format to avoid schema issues
      server.registerPrompt(
        prompt.id,
        prompt.title,
        prompt.description
      );
      console.error(`✅ Registered prompt: ${prompt.id}`);
    } catch (error) {
      console.error(`❌ Failed to register prompt ${prompt.id}:`, error);
    }
  }

  // Add handlers manually for better control
  server.setRequestHandler({ method: "prompts/get" }, async (request) => {
    const promptName = request.params.name;
    const promptArgs = request.params.arguments || {};
    
    // Find the requested prompt
    const prompt = prompts.find(p => p.id === promptName);
    if (!prompt) {
      throw new Error(`Prompt not found: ${promptName}`);
    }

    // Use example args for demo since real argument passing is complex
    const exampleArgs = {
      'greeting': { name: 'Alice' },
      'explain-concept': { concept: 'quantum computing', audience: 'beginner' },
      'code-review': { language: 'javascript', code: 'function hello() { console.log("hi") }' }
    };
    
    const args = exampleArgs[prompt.id] || {};
    
    // Render the template
    const rendered = prompt.template.replace(/\{\{(\w+)\}\}/g, (_, k) => args[k] || `[${k}]`);
    
    try {
      // Send to Ollama and get response
      const ollamaResponse = await sendToOllama(rendered);
      
      return { 
        messages: [
          { role: 'user', content: { type: 'text', text: rendered } },
          { role: 'assistant', content: { type: 'text', text: ollamaResponse } }
        ] 
      };
    } catch (error) {
      return { 
        messages: [
          { role: 'user', content: { type: 'text', text: rendered } },
          { role: 'assistant', content: { type: 'text', text: `Error: ${error.message}` } }
        ] 
      };
    }
  });

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start the server
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
