export interface GetProtocolsInput {
  // No input parameters needed
}

export interface GetProtocolTvlInput {
  protocol: string;
}

export interface GetChainTvlInput {
  chain: string;
}

export interface GetTokenPricesInput {
  coins: string[];
}

export interface GetHistoricalPricesInput {
  coins: string[];
  timestamp: number;
}

export interface GetStablecoinsInput {
  // No input parameters needed
}

export interface GetStablecoinDataInput {
  asset: string;
}
