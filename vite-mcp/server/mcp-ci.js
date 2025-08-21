// MCP server that triggers & monitors GitHub Actions via STDIO.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const GH_TOKEN   = process.env.GITHUB_TOKEN;
const OWNER      = process.env.GITHUB_OWNER  || "<YOUR_USER>";
const REPO       = process.env.GITHUB_REPO   || "vite-mcp-demo";
const WORKFLOW   = process.env.GITHUB_WORKFLOW || "build.yml";
const DEFAULT_REF= process.env.GITHUB_REF    || "main";

if (!GH_TOKEN) {
  console.error("Missing GITHUB_TOKEN in environment.");
  process.exit(1);
}

const API = `https://api.github.com`;

const ok  = (text) => ({ content: [{ type: "text", text }] });
const err = (text) => ({ content: [{ type: "text", text }], isError: true });
const json = (o) => JSON.stringify(o, null, 2);

async function gh(endpoint, method = "GET", body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${GH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${t}`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : {};
}

const server = new Server(
  { name: "mcp-ci-github", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ci/dispatch",
      description: "Trigger a GitHub Actions workflow_dispatch.",
      inputSchema: {
        type: "object",
        properties: {
          ref:      { type: "string" },
          inputs:   { type: "object" },
          workflow: { type: "string" }
        }
      }
    },
    {
      name: "ci/runs",
      description: "List recent workflow runs.",
      inputSchema: {
        type: "object",
        properties: {
          per_page: { type: "integer" },
          status:   { type: "string" },
          branch:   { type: "string" }
        }
      }
    },
    {
      name: "ci/run",
      description: "Get a single run's status.",
      inputSchema: {
        type: "object",
        properties: {
          run_id: { type: "integer" }
        },
        required: ["run_id"]
      }
    },
    {
      name: "ci/cancel",
      description: "Cancel a run.",
      inputSchema: {
        type: "object",
        properties: {
          run_id: { type: "integer" }
        },
        required: ["run_id"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    const name = req.params.name;
    const args = req.params.arguments || {};

    if (name === "ci/dispatch") {
      const ref = args.ref || DEFAULT_REF;
      const workflow = args.workflow || WORKFLOW;
      const inputs = args.inputs || {};
      await gh(`/repos/${OWNER}/${REPO}/actions/workflows/${workflow}/dispatches`, "POST", { ref, inputs });
      return ok(json({ triggered: true, workflow, ref, inputs }));
    }

    if (name === "ci/runs") {
      const per_page = args.per_page || 10;
      const status = args.status;
      const branch = args.branch;
      const qs = new URLSearchParams({ per_page: String(per_page) });
      if (status) qs.set("status", status);
      if (branch) qs.set("branch", branch);

      const data = await gh(`/repos/${OWNER}/${REPO}/actions/runs?${qs.toString()}`, "GET");
      const runs = (data.workflow_runs || []).map(r => ({
        id: r.id, name: r.name, event: r.event, status: r.status,
        conclusion: r.conclusion, head_branch: r.head_branch,
        url: r.html_url, created_at: r.created_at
      }));
      return ok(json({ count: runs.length, runs }));
    }

    if (name === "ci/run") {
      const { run_id } = args;
      const r = await gh(`/repos/${OWNER}/${REPO}/actions/runs/${run_id}`, "GET");
      const out = {
        id: r.id, name: r.name, event: r.event,
        status: r.status, conclusion: r.conclusion,
        head_branch: r.head_branch, url: r.html_url,
        created_at: r.created_at, updated_at: r.updated_at
      };
      return ok(json(out));
    }

    if (name === "ci/cancel") {
      const { run_id } = args;
      await gh(`/repos/${OWNER}/${REPO}/actions/runs/${run_id}/cancel`, "POST");
      return ok(json({ cancelled: true, run_id }));
    }

    return err(`Unknown tool: ${name}`);
  } catch (e) {
    return err(`CI error: ${e?.message || String(e)}`);
  }
});

await server.connect(new StdioServerTransport());
