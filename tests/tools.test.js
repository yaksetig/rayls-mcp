import { describe, it } from 'node:test';
import assert from 'node:assert';
import { compileSolidityHandler, compileCircomHandler, securityAuditHandler } from '../dist/handlers/devtools.js';

describe('Tool Handlers', () => {
  it('compileSolidityHandler compiles successfully', async () => {
    const source = 'pragma solidity ^0.8.0; contract A { function f() public pure returns(uint){return 1;} }';
    const res = await compileSolidityHandler({ source });
    assert.equal(res.isError, false, `unexpected error: ${res.content?.[0]?.text}`);
    // The Solidity compiler should return ABI data in the output JSON
    const output = res.content?.[0]?.text ?? '';
    assert.ok(output.includes('"abi"'));
  });

  it('compileCircomHandler returns result structure', async () => {
    const circuit = 'template Main() { signal output out; out <== 1; } component main = Main();';
    const res = await compileCircomHandler({ source: circuit });
    assert.ok(typeof res.isError === 'boolean');
  });

  it('securityAuditHandler returns error for missing file', async () => {
    const res = await securityAuditHandler({ file: 'nonexistent.sol' });
    assert.strictEqual(res.isError, true);
  });
});
