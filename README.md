# MCP Server Examples

This repository contains a collection of example Model Context Protocol (MCP) servers, each demonstrating different integrations and use cases for the MCP standard. These servers are designed for educational purposes as part of the course "MCP for beginners", and can be used as templates or references for building your own MCP-compatible tools.

## Table of Contents

- [google-calendar-mcp](#google-calendar-mcp)
- [node-basic-mcp-server](#node-basic-mcp-server)
- [ollama-mcp](#ollama-mcp)
- [ollamademo](#ollamademo)
- [postman-mcp](#postman-mcp)
- [Weather-MCP-Server](#weather-mcp-server)

---

## google-calendar-mcp

**Purpose:**  
A full-featured MCP server that integrates with Google Calendar, allowing AI assistants (like Claude) to manage calendar events, check availability, and perform smart scheduling.

**Key Features:**

- Multi-calendar support
- Create, update, delete, and search events
- Recurring event management
- Free/busy queries across calendars
- Smart scheduling and natural language date parsing
- Import events from images, PDFs, or web links

**How it works:**  
The server uses Google OAuth for authentication and communicates with the Google Calendar API. It exposes a set of MCP tools for calendar operations, which can be accessed by MCP clients.

**Setup:**

- Requires a Google Cloud project and OAuth credentials
- Can be run via `npx`, locally, or with Docker
- See the [google-calendar-mcp/README.md](google-calendar-mcp/README.md) and [docs/](google-calendar-mcp/docs/) for detailed setup, usage, and deployment instructions

---

## node-basic-mcp-server

**Purpose:**  
A minimal MCP server example that implements a single tool: integer addition.

**Key Features:**

- One tool: `add-integers` (adds two integers)
- Demonstrates basic STDIO transport and JSON-RPC handling
- Includes comprehensive tests for input validation and error handling

**How it works:**  
The server listens for MCP requests over STDIO, validates input, performs integer addition, and returns the result.

**Setup:**

- Run with `node server.js`
- Test with `npm test`
- See [node-basic-mcp-server/README.md](node-basic-mcp-server/README.md) for details

---

## ollama-mcp

**Purpose:**  
An MCP server that connects to a local [Ollama](https://ollama.com/) instance, exposing structured prompt-based tools (like code review, concept explanation, and greetings) to MCP clients.

**Key Features:**

- Integrates with Ollama's local LLM API
- Provides prompt-based tools: greeting, code review, concept explanation
- Uses STDIO transport for MCP communication

**How it works:**  
The server registers several prompts as MCP tools. When a tool is called, it renders a prompt template, sends it to Ollama, and returns the LLM's response.

**Setup:**

- Requires Ollama running locally (`ollama serve`)
- Start with `node server.js`
- Prompts are defined in the `prompts/` directory
- See code and comments in [ollama-mcp/server.js](ollama-mcp/server.js) for details

---

## ollamademo

**Purpose:**  
A demonstration MCP server for Ollama, similar to `ollama-mcp`, but with additional demo scripts and configuration examples for integration with Claude Desktop.

**Key Features:**

- Same prompt-based tools as `ollama-mcp` (greeting, code review, concept explanation)
- Includes demo/test scripts to showcase prompt execution
- Provides example configuration files for Claude Desktop integration

**How it works:**  
The server exposes prompts as MCP tools, renders templates with user arguments, sends them to Ollama, and returns the results. Demo scripts (`demo.js`, `comprehensive-demo.js`, etc.) show how to interact with the server programmatically.

**Setup:**

- Requires Ollama running locally
- Start with `node server.js`
- See [USAGE.md](ollamademo/USAGE.md) and [SETUP.md](ollamademo/SETUP.md) for integration instructions with Claude Desktop

---

## postman-mcp

**Purpose:**  
Auto-generated MCP servers using the [Postman MCP Generator](https://postman.com/explore/mcp-generator), exposing API requests as MCP tools.

**Key Features:**

- Each subdirectory (e.g., `postman-mcp-server`, `postman-mcp-server 2`) is a separate generated server
- Tools are generated from selected Postman API requests
- Supports environment variable configuration for API keys
- Docker support for deployment

**How it works:**  
Each server exposes API endpoints as MCP tools, allowing MCP clients to call external APIs via a standardized interface.

**Setup:**

- Install dependencies with `npm install`
- Run with `node mcpServer.js`
- Configure environment variables as needed
- See the respective [README.md](postman-mcp/postman-mcp-server/README.md) for full setup and usage

---

## Weather-MCP-Server

**Purpose:**  
An MCP server that provides weather data using the [Open-Meteo API](https://open-meteo.com/), allowing AI assistants to retrieve current weather and forecasts.

**Key Features:**

- Get current weather, hourly forecasts, and weather summaries
- Global coverage (any latitude/longitude)
- No API key required (uses free Open-Meteo API)
- Comprehensive error handling

**How it works:**  
The server exposes weather-related tools via MCP, fetching data from Open-Meteo and returning it in a structured format.

**Setup:**

- Install dependencies with `npm install`
- Start the server with `npm start`
- See [Weather-MCP-Server/README.md](Weather-MCP-Server/README.md) for details

---

## License

All code is provided under the MIT License unless otherwise specified in subdirectories.

---

## Contributing

Contributions and suggestions are welcome! Please open issues or pull requests for improvements or new examples.

---

If you need help with a specific example, refer to the README or documentation within each subdirectory.
