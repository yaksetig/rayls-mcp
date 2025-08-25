import { getProtocolsHandler, getProtocolTvlHandler, getChainTvlHandler, getTokenPricesHandler, getHistoricalPricesHandler, getStablecoinsHandler, getStablecoinDataHandler } from "./handlers/defillama.js";
export const tools = [
    {
        name: "defillama_get_protocols",
        description: "List all protocols tracked by DefiLlama",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "defillama_get_protocol_tvl",
        description: "Get TVL data for a specific protocol",
        inputSchema: {
            type: "object",
            properties: {
                protocol: { type: "string" }
            },
            required: ["protocol"]
        }
    },
    {
        name: "defillama_get_chain_tvl",
        description: "Get TVL data for a specific chain",
        inputSchema: {
            type: "object",
            properties: {
                chain: { type: "string" }
            },
            required: ["chain"]
        }
    },
    {
        name: "defillama_get_token_prices",
        description: "Get current prices of tokens",
        inputSchema: {
            type: "object",
            properties: {
                coins: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["coins"]
        }
    },
    {
        name: "defillama_get_historical_prices",
        description: "Get historical prices of tokens",
        inputSchema: {
            type: "object",
            properties: {
                coins: {
                    type: "array",
                    items: { type: "string" }
                },
                timestamp: { type: "number" }
            },
            required: ["coins", "timestamp"]
        }
    },
    {
        name: "defillama_get_stablecoins",
        description: "List all stablecoins tracked by DefiLlama",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "defillama_get_stablecoin_data",
        description: "Get data for a specific stablecoin",
        inputSchema: {
            type: "object",
            properties: {
                asset: { type: "string" }
            },
            required: ["asset"]
        }
    }
];
export const handlers = {
    "defillama_get_protocols": getProtocolsHandler,
    "defillama_get_protocol_tvl": getProtocolTvlHandler,
    "defillama_get_chain_tvl": getChainTvlHandler,
    "defillama_get_token_prices": getTokenPricesHandler,
    "defillama_get_historical_prices": getHistoricalPricesHandler,
    "defillama_get_stablecoins": getStablecoinsHandler,
    "defillama_get_stablecoin_data": getStablecoinDataHandler
};
