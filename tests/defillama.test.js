import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';

// Import the clients and factory
import { getDefiLlamaClient } from '../dist/clients/defillama.factory.js';

describe('DefiLlama Client Tests', async () => {
  let originalTestMode;
  
  before(() => {
    // Save original TEST_MODE value
    originalTestMode = process.env.TEST_MODE;
  });
  
  after(() => {
    // Restore original TEST_MODE value
    process.env.TEST_MODE = originalTestMode;
  });
  
  describe('Factory Tests', () => {
    it('should return mock client when TEST_MODE is true', () => {
      process.env.TEST_MODE = 'true';
      const client = getDefiLlamaClient();
      assert.strictEqual(client.constructor.name, 'MockDefiLlamaClient');
    });

    it('should return real client when TEST_MODE is not true', () => {
      process.env.TEST_MODE = 'false';
      const client = getDefiLlamaClient();
      assert.strictEqual(client.constructor.name, 'DefiLlamaClient');
    });
  });

  describe('DefiLlama Client API Tests', () => {
    // Set to true to use mock client, false to use real client
    const useMockClient = (process.env.TEST_MODE === 'true');
    let client;
    
    beforeEach(() => {
      process.env.TEST_MODE = useMockClient ? 'true' : 'false';
      client = getDefiLlamaClient();
    });
    
    it('should get protocols', async () => {
      const protocols = await client.getProtocols();
      assert.ok(Array.isArray(protocols));
      assert.ok(protocols.length > 0);
      assert.ok(protocols[0].name);
      assert.ok(protocols[0].tvl);
    });

    it('should get protocol TVL', async () => {
      // Use 'aave' for real client, any string for mock
      const protocolName = useMockClient ? 'test-protocol' : 'aave';
      const tvlData = await client.getProtocolTvl(protocolName);
      assert.strictEqual(typeof tvlData, 'object');
      assert.ok(tvlData.tvl);
      assert.ok(tvlData.tvlList);
      assert.ok(Array.isArray(tvlData.tvlList));
    });

    it('should throw error when protocol name is missing for getProtocolTvl', async () => {
      await assert.rejects(
        async () => await client.getProtocolTvl(''),
        { message: 'Protocol name is required' }
      );
    });

    it('should get chain TVL', async () => {
      const chainTvl = await client.getChainTvl('ethereum');
      assert.ok(Array.isArray(chainTvl));
      assert.ok(chainTvl.length > 0);
      assert.ok(chainTvl[0].date);
      assert.ok(chainTvl[0].totalLiquidityUSD);
    });

    it('should throw error when chain name is missing for getChainTvl', async () => {
      await assert.rejects(
        async () => await client.getChainTvl(''),
        { message: 'Chain name is required' }
      );
    });

    it('should get token prices', async () => {
      // Use real token address for real client, any string for mock
      const tokenAddress = useMockClient ? 
        'ethereum:0x1234' : 
        'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      
      const prices = await client.getTokenPrices([tokenAddress]);
      assert.strictEqual(typeof prices, 'object');
      assert.ok(prices.coins);
      assert.ok(prices.coins[tokenAddress]);
      assert.ok(prices.coins[tokenAddress].price);
    });

    it('should throw error when coins are missing for getTokenPrices', async () => {
      await assert.rejects(
        async () => await client.getTokenPrices([]),
        { message: 'At least one coin is required' }
      );
    });

    it('should get historical prices', async () => {
      const timestamp = Math.floor(Date.now() / 1000);
      // Use real token address for real client, any string for mock
      const tokenAddress = useMockClient ? 
        'ethereum:0x1234' : 
        'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      
      const prices = await client.getHistoricalPrices([tokenAddress], timestamp);
      assert.strictEqual(typeof prices, 'object');
      assert.ok(prices.coins);
      assert.ok(prices.coins[tokenAddress]);
      assert.ok(prices.coins[tokenAddress].price);
    });

    it('should throw error when timestamp is missing for getHistoricalPrices', async () => {
      await assert.rejects(
        async () => await client.getHistoricalPrices(['ethereum:0x1234'], 0),
        { message: 'Timestamp is required' }
      );
    });

    it('should get stablecoins', async () => {
      const stablecoins = await client.getStablecoins();
      assert.strictEqual(typeof stablecoins, 'object');
      assert.ok(stablecoins.peggedAssets);
      assert.ok(Array.isArray(stablecoins.peggedAssets));
      assert.ok(stablecoins.peggedAssets.length > 0);
    });

    it('should get stablecoin data', async () => {
      // Use 'USDC' for both real and mock client
      const stablecoinData = await client.getStablecoinData('USDC');
      assert.strictEqual(typeof stablecoinData, 'object');
      assert.ok(stablecoinData.circulating);
      assert.ok(stablecoinData.chainCirculating);
    });

    it('should throw error when asset name is missing for getStablecoinData', async () => {
      await assert.rejects(
        async () => await client.getStablecoinData(''),
        { message: 'Asset name is required' }
      );
    });
  });
});
