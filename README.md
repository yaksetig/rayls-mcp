# MCP Server for Smart Contract Tools

This repository contains a Model Context Protocol (MCP) server that enables Claude to compile and audit smart contract code. The server exposes tools for Solidity compilation, Slither analysis, Circom compilation, and Circomspect auditing. Each tool accepts source code as text, writes it to a temporary file, and then invokes the appropriate compiler or analyzer.

## Prerequisites

The server relies on external CLI tools:

- `circom` for compiling circuits
- `circomspect` for auditing Circom code
- `slither` for Solidity security analysis

Install them separately and ensure they are on your `PATH`. If they are installed elsewhere, set the `CIRCOM_PATH` and `CIRCOMSPECT_PATH` environment variables to point to the binaries. For example, Circom can be installed via Cargo:

```bash
cargo install --locked --git https://github.com/iden3/circom.git
```

## Available Tools

- `compile_solidity`: Compile Solidity contracts using solc
- `security_audit`: Run Slither static analysis on Solidity source code
- `compile_circom`: Compile Circom circuits
- `audit_circom`: Audit Circom source code with circomspect

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
