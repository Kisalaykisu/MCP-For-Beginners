# Basic MCP Server

A simple Model Context Protocol (MCP) server that provides an integer addition tool.

## Features

- **add-integers**: Adds two integers and returns the result
- STDIO transport for communication
- Proper input validation and error handling

## Usage

### Running the Server

```bash
node server.js
```

### Running Tests

```bash
npm test
```

## Testing

The test suite (`test.js`) provides comprehensive testing of the MCP server's STDIO input/output functionality:

### Test Coverage

1. **List Tools** - Verifies the server returns the correct tool definition
2. **Add Integers - Valid** - Tests normal integer addition (5 + 3 = 8)
3. **Add Integers - Negative Numbers** - Tests with negative numbers (-10 + 15 = 5)
4. **Add Integers - Zero** - Tests edge case with zeros (0 + 0 = 0)
5. **Add Integers - Float Error** - Validates rejection of floating point numbers
6. **Add Integers - String Error** - Validates rejection of string inputs
7. **Add Integers - Missing Parameter** - Tests error handling for missing parameters
8. **Unknown Tool Error** - Tests error handling for unknown tool names
9. **Large Numbers** - Tests with large integer values

### Test Protocol

The tests communicate with the server using proper JSON-RPC 2.0 messages over STDIO:

- **List Tools Request**: `{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}`
- **Call Tool Request**: `{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "add-integers", "arguments": {"a": 5, "b": 3}}}`

### Test Features

- Spawns actual server processes for realistic testing
- Validates JSON-RPC response format
- Tests both success and error scenarios
- Includes timeout handling for robustness
- Provides detailed test results and summary

## API

### tools/list

Returns available tools.

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "add-integers",
        "description": "Add two integers and return the result",
        "inputSchema": {
          "type": "object",
          "properties": {
            "a": {"type": "integer", "description": "First integer to add"},
            "b": {"type": "integer", "description": "Second integer to add"}
          },
          "required": ["a", "b"]
        }
      }
    ]
  }
}
```

### tools/call

Calls a specific tool.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "add-integers",
    "arguments": {
      "a": 5,
      "b": 3
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "8"
      }
    ]
  }
}
```

## Error Handling

The server validates inputs and returns appropriate errors:

- Non-integer inputs: "Both arguments must be integers"
- Non-numeric inputs: "Both arguments must be numbers"
- Unknown tools: "Unknown tool: {name}"
