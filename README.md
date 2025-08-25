# MCP Server for DefiLlama

This repository contains a Model Context Protocol (MCP) server that provides Claude with access to DeFi data via the DefiLlama API. The server enables Claude to perform operations like retrieving protocol TVL data, chain TVL data, token prices, and stablecoin information.

## Overview

The MCP server exposes the following tools to Claude:

### Protocol Data

- `defillama_get_protocols`: List all protocols tracked by DefiLlama
- `defillama_get_protocol_tvl`: Get TVL data for a specific protocol

### Chain Data

- `defillama_get_chain_tvl`: Get TVL data for a specific chain

### Token Data

- `defillama_get_token_prices`: Get current prices of tokens
- `defillama_get_historical_prices`: Get historical prices of tokens

### Stablecoin Data

- `defillama_get_stablecoins`: List all stablecoins tracked by DefiLlama
- `defillama_get_stablecoin_data`: Get data for a specific stablecoin

Prerequisites
- Node.js (v16 or higher)

## Running the server

### Option 1: Using npx (Recommended)
```npx @mcp-dockmaster/mcp-server-defillama```
You can run the MCP server directly without installation using npx:
This will download and execute the server directly from npm.

### Option 2: Manual Installation
Clone this repository:
```git clone https://github.com/mcp-dockmaster/mcp-server-defillama.git```
Install dependencies:
```npm install```
Build the project:
```npm run build```

## Claude Usage
To configure Claude Desktop to use this MCP server:

Open Claude Desktop, and navigate to Settings>Developer Settings>MCP Servers. There you'll encounter the button to open the configuration JSON file.

Add the MCP server configuration:
```json
{
  "mcpServers": {
    "mcp-server-defillama": {
      "command": "npx",
      "args": [
        "@mcp-dockmaster/mcp-server-defillama"
      ]
    }
  }
}
```
Alternatively, if you installed the package locally:
```json
{
  "mcpServers": {
    "mcp-server-defillama": {
      "command": "node",
      "args": [
        "/path/to/your/mcp-server-defillama/build/index.js"
      ]
    }
  }
}
```

### Deploying as a network service

When the `PORT` environment variable is set, the server will listen for HTTP
connections using Server Sent Events (SSE). The connection URL should point to
the root path of your deployment (for example, `https://your-app.onrailway.app/`).

If the `MCP_API_KEY` environment variable is defined, the server will require
clients to include an `Authorization: Bearer <MCP_API_KEY>` header on all
requests.


