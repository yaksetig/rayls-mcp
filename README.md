# MCP Server for Smart Contract Tools

This repository contains a Model Context Protocol (MCP) server that enables Claude to compile and audit smart contract code. The server exposes tools for Solidity compilation, Slither analysis, Circom compilation, and Circomspect auditing.

## Available Tools

- `compile_solidity`: Compile Solidity contracts using solc
- `security_audit`: Run Slither static analysis on Solidity code
- `compile_circom`: Compile Circom circuits
- `audit_circom`: Audit Circom circuits with circomspect

## Running the Server

### Using npx
```bash
npx @mcp-dockmaster/mcp-server-devtools
```

### Manual Installation
```bash
git clone https://github.com/mcp-dockmaster/mcp-server-devtools.git
npm install
npm run build
```

## Claude Configuration
Add the server to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "mcp-server-devtools": {
      "command": "npx",
      "args": ["@mcp-dockmaster/mcp-server-devtools"]
    }
  }
}
```
Alternatively, reference a local build:
```json
{
  "mcpServers": {
    "mcp-server-devtools": {
      "command": "node",
      "args": ["/path/to/mcp-server-devtools/dist/index.js"]
    }
  }
}
```

When the `PORT` environment variable is set, the server listens for HTTP connections using Server Sent Events (SSE). If `MCP_API_KEY` is defined, clients must provide it via an `Authorization: Bearer` header.
