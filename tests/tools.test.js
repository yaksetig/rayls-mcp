import { describe, it } from 'node:test';
import assert from 'node:assert';
import { compileSolidityHandler, compileCircomHandler } from '../dist/handlers/devtools.js';

describe('Tool Handlers', () => {
  it('compileSolidityHandler returns result structure', async () => {
    const source = 'pragma solidity ^0.8.0; contract A { function f() public pure returns(uint){return 1;} }';
    const res = await compileSolidityHandler({ source });
    assert.ok(typeof res.isError === 'boolean');
  });

  it('compileCircomHandler returns result structure', async () => {
    const circuit = 'template Main() { signal output out; out <== 1; } component main = Main();';
    const res = await compileCircomHandler({ source: circuit });
    assert.ok(typeof res.isError === 'boolean');
  });
});
