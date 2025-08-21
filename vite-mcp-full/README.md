# Vite + MCP: GitHub Actions CI (Full Project)

This repository is a **complete, runnable Vite React app** plus an **MCP server** that can trigger & monitor **GitHub Actions** CI.

## Project Structure
```
vite-mcp-full/
├─ server/
│  └─ mcp-ci.js          # MCP server (STDIO) for GitHub Actions
├─ .github/workflows/
│  └─ build.yml          # CI workflow
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## Requirements
- Node.js 18+
- GitHub repository (push this project there)
- Personal Access Token with scopes: `repo`, `workflow`

## Install
```bash
npm install
```

## Local Dev (Vite)
```bash
npm run dev
```
Visit http://localhost:5173

## Configure MCP CI Server
Set environment variables (Windows PowerShell example):
```powershell
setx GITHUB_TOKEN "<YOUR_TOKEN>"
setx GITHUB_OWNER "<YOUR_GITHUB_USERNAME>"
setx GITHUB_REPO  "vite-mcp-demo"   # or your repo name
setx GITHUB_WORKFLOW "build.yml"
setx GITHUB_REF "main"
# reopen terminal to load setx vars
```

## Test with mcp-cli
```bash
npx -y mcp-cli interactive --server "node server/mcp-ci.js"
```
In the interactive shell:
```
tools/list
tools/call ci/dispatch --params '{"ref":"main","inputs":{"note":"kicked by MCP"}}'
tools/call ci/runs --params '{"per_page":5}'
# copy a run id
tools/call ci/run --params '{"run_id": 123456789}'
tools/call ci/cancel --params '{"run_id": 123456789}'
```

## Use with Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "GitHub CI": {
      "command": "node",
      "args": ["C:/path/to/vite-mcp-full/server/mcp-ci.js"],
      "env": {
        "GITHUB_TOKEN": "<YOUR_TOKEN>",
        "GITHUB_OWNER": "<YOUR_USER>",
        "GITHUB_REPO": "vite-mcp-demo",
        "GITHUB_WORKFLOW": "build.yml",
        "GITHUB_REF": "main",
        "NODE_ENV": "production"
      }
    }
  }
}
```
> On Windows paths, prefer forward slashes (`/`).

## CI Workflow
- Runs on `push` to `main` and manual `workflow_dispatch`.
- Builds the Vite app and uploads the artifact (`dist`).

## Notes
- Keep your token secret (do not commit it).
- The MCP server uses **STDIO** transport and GitHub REST API.
- If `mcp-cli` isn't installed, the `npx -y` command fetches it on the fly.
