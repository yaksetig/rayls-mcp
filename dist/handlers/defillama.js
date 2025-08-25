import { createErrorResponse, createSuccessResponse } from "./utils.js";
const DEFILLAMA_API_BASE_URL = "https://api.llama.fi";
export const getProtocolsHandler = async (input) => {
    try {
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/protocols`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting protocols: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const protocolsData = await response.json();
        return createSuccessResponse(`Protocols: ${JSON.stringify(protocolsData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting protocols: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getProtocolTvlHandler = async (input) => {
    try {
        if (!input.protocol) {
            return createErrorResponse("Protocol name is required");
        }
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/protocol/${input.protocol}`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting protocol TVL: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const protocolData = await response.json();
        return createSuccessResponse(`Protocol TVL: ${JSON.stringify(protocolData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting protocol TVL: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getChainTvlHandler = async (input) => {
    try {
        if (!input.chain) {
            return createErrorResponse("Chain name is required");
        }
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/v2/historicalChainTvl/${input.chain}`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting chain TVL: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const chainData = await response.json();
        return createSuccessResponse(`Chain TVL: ${JSON.stringify(chainData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting chain TVL: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getTokenPricesHandler = async (input) => {
    try {
        if (!input.coins || input.coins.length === 0) {
            return createErrorResponse("At least one coin is required");
        }
        const coinsParam = input.coins.join(',');
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/prices/current/${coinsParam}`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting token prices: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const pricesData = await response.json();
        return createSuccessResponse(`Token prices: ${JSON.stringify(pricesData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting token prices: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getHistoricalPricesHandler = async (input) => {
    try {
        if (!input.coins || input.coins.length === 0) {
            return createErrorResponse("At least one coin is required");
        }
        if (!input.timestamp) {
            return createErrorResponse("Timestamp is required");
        }
        const coinsParam = input.coins.join(',');
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/prices/historical/${input.timestamp}/${coinsParam}`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting historical prices: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const historicalData = await response.json();
        return createSuccessResponse(`Historical prices: ${JSON.stringify(historicalData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting historical prices: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getStablecoinsHandler = async (input) => {
    try {
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/stablecoins`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting stablecoins: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const stablecoinsData = await response.json();
        return createSuccessResponse(`Stablecoins: ${JSON.stringify(stablecoinsData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting stablecoins: ${error instanceof Error ? error.message : String(error)}`);
    }
};
export const getStablecoinDataHandler = async (input) => {
    try {
        if (!input.asset) {
            return createErrorResponse("Asset name is required");
        }
        const response = await fetch(`${DEFILLAMA_API_BASE_URL}/stablecoin/${input.asset}`);
        if (!response.ok) {
            const errorText = await response.text();
            return createErrorResponse(`Error getting stablecoin data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const stablecoinData = await response.json();
        return createSuccessResponse(`Stablecoin data: ${JSON.stringify(stablecoinData, null, 2)}`);
    }
    catch (error) {
        return createErrorResponse(`Error getting stablecoin data: ${error instanceof Error ? error.message : String(error)}`);
    }
};
