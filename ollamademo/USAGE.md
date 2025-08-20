# How to Use Your MCP-Ollama Server

Your MCP server is now fully functional and connects your custom prompts with Ollama! Here's how to use it:

## 🔧 Setup

### 1. Configure Claude Desktop

Edit your Claude Desktop configuration file:
**File location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ollama-prompts": {
      "command": "node",
      "args": ["/Users/jeremy/demos/mcpstuff/ollamademo/server.js"],
      "env": {}
    }
  }
}
```

### 2. Restart Claude Desktop

After saving the configuration, restart Claude Desktop completely.

## 🚀 Available Prompts

Your server provides these prompts:

### 1. **Personalized Greeting** (`greeting`)
- **Purpose**: Creates personalized greetings
- **Arguments**: `name` (the person's name)
- **Example**: "Hello, Alice! Welcome to our MCP prompt demo."

### 2. **Code Review Assistant** (`code-review`) 
- **Purpose**: Reviews code and suggests improvements
- **Arguments**: 
  - `language` (programming language)
  - `code` (the code to review)
- **Focus**: Quality, performance, security, readability

### 3. **Concept Explainer** (`explain-concept`)
- **Purpose**: Explains complex topics simply
- **Arguments**:
  - `concept` (what to explain)
  - `audience` (target audience level)

## 💡 How to Use in Claude Desktop

Once configured, you'll see a **"Prompts"** section in Claude Desktop:

1. **Browse Available Prompts**: Click on the prompts icon to see your custom prompts
2. **Select a Prompt**: Choose from "Personalized Greeting", "Code Review Assistant", or "Concept Explainer"
3. **Fill in Arguments**: Claude will prompt you for the required fields
4. **Get Ollama Response**: The prompt gets sent to your local Ollama model and you get the response

## 🔄 What Happens Behind the Scenes

```
Claude Desktop → MCP Server → Render Template → Ollama → Response → Claude Desktop
```

1. You select a prompt in Claude Desktop
2. Claude sends the prompt name and arguments to your MCP server
3. Your server renders the template with your arguments
4. The rendered prompt is sent to Ollama (using llama3.2:3b)
5. Ollama's response is returned to Claude Desktop
6. You see both the rendered prompt and Ollama's response

## 📝 Example Usage

**Using the Code Review prompt:**
- Language: `javascript`
- Code: `function hello() { console.log("hi") }`

**Result**: Ollama will review your JavaScript code and provide suggestions for improvement.

## ⚙️ Customization

- **Change Ollama Model**: Edit `DEFAULT_MODEL` in `server.js`
- **Add New Prompts**: Create JSON files in the `prompts/` directory
- **Modify Existing Prompts**: Edit the JSON files in `prompts/`

## 🐛 Troubleshooting

- **Server not showing in Claude**: Check the file path in your configuration
- **Prompts not loading**: Ensure Ollama is running (`ollama serve`)
- **Slow responses**: Try a smaller model like `llama3.2:1b`

Your MCP server bridges Claude Desktop with your local Ollama models, giving you structured, reusable prompts powered by your own AI infrastructure!
