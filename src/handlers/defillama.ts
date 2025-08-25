import { ToolResultSchema } from "../types.js";
import { createErrorResponse, createSuccessResponse } from "./utils.js";
import {
  GetProtocolsInput,
  GetProtocolTvlInput,
  GetChainTvlInput,
  GetTokenPricesInput,
  GetHistoricalPricesInput,
  GetStablecoinsInput,
  GetStablecoinDataInput
} from "./defillama.types.js";
import { getDefiLlamaClient } from "../clients/defillama.factory.js";

// Get the appropriate client (real or mock) based on TEST_MODE
const defiLlamaClient = getDefiLlamaClient();

export const getProtocolsHandler = async (input: GetProtocolsInput): Promise<ToolResultSchema> => {
  try {
    const protocolsData = await defiLlamaClient.getProtocols();
    return createSuccessResponse(`Protocols: ${JSON.stringify(protocolsData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting protocols: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getProtocolTvlHandler = async (input: GetProtocolTvlInput): Promise<ToolResultSchema> => {
  try {
    const protocolData = await defiLlamaClient.getProtocolTvl(input.protocol);
    return createSuccessResponse(`Protocol TVL: ${JSON.stringify(protocolData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting protocol TVL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getChainTvlHandler = async (input: GetChainTvlInput): Promise<ToolResultSchema> => {
  try {
    const chainData = await defiLlamaClient.getChainTvl(input.chain);
    return createSuccessResponse(`Chain TVL: ${JSON.stringify(chainData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting chain TVL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getTokenPricesHandler = async (input: GetTokenPricesInput): Promise<ToolResultSchema> => {
  try {
    const pricesData = await defiLlamaClient.getTokenPrices(input.coins);
    return createSuccessResponse(`Token prices: ${JSON.stringify(pricesData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting token prices: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getHistoricalPricesHandler = async (input: GetHistoricalPricesInput): Promise<ToolResultSchema> => {
  try {
    const historicalData = await defiLlamaClient.getHistoricalPrices(input.coins, input.timestamp);
    return createSuccessResponse(`Historical prices: ${JSON.stringify(historicalData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting historical prices: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getStablecoinsHandler = async (input: GetStablecoinsInput): Promise<ToolResultSchema> => {
  try {
    const stablecoinsData = await defiLlamaClient.getStablecoins();
    return createSuccessResponse(`Stablecoins: ${JSON.stringify(stablecoinsData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoins: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getStablecoinDataHandler = async (input: GetStablecoinDataInput): Promise<ToolResultSchema> => {
  try {
    const stablecoinData = await defiLlamaClient.getStablecoinData(input.asset);
    return createSuccessResponse(`Stablecoin data: ${JSON.stringify(stablecoinData, null, 2)}`);
  } catch (error) {
    return createErrorResponse(`Error getting stablecoin data: ${error instanceof Error ? error.message : String(error)}`);
  }
};
