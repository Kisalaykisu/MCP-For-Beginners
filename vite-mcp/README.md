# Vite + MCP: GitHub Actions CI

This repo contains a Vite React app and an MCP server (`server/mcp-ci.js`) that can **trigger & monitor GitHub Actions workflows**.

## Tools (MCP)

- `ci/dispatch` — trigger `workflow_dispatch`
- `ci/runs` — list recent runs
- `ci/run` — get one run
- `ci/cancel` — cancel a run

## Setup

1. **Install**
   ```bash
   npm install
   npm i @modelcontextprotocol/sdk
   ```

2. **Create a GitHub token**
   - Fine-grained or classic PAT with `repo` and `workflow` scopes.

3. **Set env (Windows example)**
   ```powershell
   setx GITHUB_TOKEN "<YOUR_TOKEN>"
   setx GITHUB_OWNER "<YOUR_USER>"
   setx GITHUB_REPO  "vite-mcp-demo"
   setx GITHUB_WORKFLOW "build.yml"
   setx GITHUB_REF "main"
   ```

4. **Test with mcp-cli**
   ```bash
   npx -y mcp-cli interactive --server "node server/mcp-ci.js"
   ```
