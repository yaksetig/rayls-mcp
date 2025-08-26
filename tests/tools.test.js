import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  compileSolidityHandler,
  compileCircomHandler,
  securityAuditHandler,
  auditCircomHandler
} from '../dist/handlers/devtools.js';

describe('Tool Handlers', () => {
  it('compileSolidityHandler compiles successfully', async () => {
    const source = 'pragma solidity ^0.8.0; contract A { function f() public pure returns(uint){return 1;} }';
    const res = await compileSolidityHandler({ source });
    assert.equal(res.isError, false, `unexpected error: ${res.content?.[0]?.text}`);
    const text = res.content?.[0]?.text ?? '';
    const output = JSON.parse(text);
    assert.equal(output.success, true);
    assert.ok(output.contracts);
  });

  it('compileCircomHandler returns result structure', async () => {
    const circuit = 'template Main() { signal output out; out <== 1; } component main = Main();';
    const res = await compileCircomHandler({ source: circuit });
    assert.ok(typeof res.isError === 'boolean');
  });

  it('securityAuditHandler returns result structure', async () => {
    const source = 'pragma solidity ^0.8.0; contract A { function f() public pure returns(uint){return 1;} }';
    const res = await securityAuditHandler({ source, filename: 'Contract.sol' });
    assert.ok(typeof res.isError === 'boolean');
    const text = res.content?.[0]?.text ?? '';
    const output = JSON.parse(text);
    assert.equal(output.filename, 'Contract.sol');
  });

  it('auditCircomHandler returns result structure', async () => {
    const circuit = 'template Main() { signal output out; out <== 1; } component main = Main();';
    const res = await auditCircomHandler({ source: circuit, filename: 'circuit.circom' });
    assert.ok(typeof res.isError === 'boolean');
  });
});
