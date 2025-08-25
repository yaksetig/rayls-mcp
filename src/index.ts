#!/usr/bin/env node

import http from "http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";
import { handlers, tools } from "./tools.js";

const server = new Server({
  name: "mcp-server-devtools",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const handler = handlers[request.params.name];
  if (handler) {
    try {
      const input = request.params.arguments;
      return await handler(input);
    } catch (error) {
      return { toolResult: { error: (error as Error).message }, content: [], isError: true };
    }
  }
  return { toolResult: { error: "Method not found" }, content: [], isError: true };
});

const port = process.env.PORT;
if (port) {
  let transport: SSEServerTransport | undefined;
  const apiKey = process.env.MCP_API_KEY;
  const httpServer = http.createServer((req, res) => {
    (async () => {
      const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

      if (apiKey) {
        const auth = req.headers["authorization"];
        if (auth !== `Bearer ${apiKey}`) {
          res.writeHead(401).end("Unauthorized");
          return;
        }
      }

      if (req.method === "GET" && url.pathname === "/") {
        transport = new SSEServerTransport("/messages", res);
        transport.onclose = () => {
          transport = undefined;
        };
        await server.connect(transport);
      } else if (req.method === "POST" && url.pathname === "/messages") {
        if (!transport) {
          res.writeHead(503).end("No active session");
          return;
        }
        await transport.handlePostMessage(req, res);
      } else {
        res.writeHead(404).end();
      }
    })().catch(err => {
      console.error("Error handling request", err);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal Server Error");
      }
    });
  });

  httpServer.listen(Number(port), "0.0.0.0", () => {
    console.log(`MCP server listening on port ${port}`);
  });
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

