import { promisify } from "util";
import { exec as execCallback } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorResponse, createSuccessResponse } from "./utils.js";
import { ToolResultSchema } from "../types.js";

const exec = promisify(execCallback);

export const compileSolidityHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    // `solc` is published as a CommonJS module. When importing it using
    // dynamic `import()` in an ESM environment the actual module is
    // available on the `default` property. Accessing `compile` directly on
    // the imported object therefore results in `undefined` and calling it
    // throws `solc.compile is not a function`. Normalize the import so that
    // `solc` always references the compiler object regardless of how it is
    // exported.
    const solcModule: any = await import("solc");
    const solc: any = solcModule.default || solcModule;
    const solInput = {
      language: "Solidity",
      sources: { "Contract.sol": { content: input.source } },
      // The JSON standard input for solc expects the "ast" selection nested
      // under the wildcard file key. Without this nesting the compiler throws
      // a validation error ("settings.outputSelection." must be an object).
      settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"], "": ["ast"] } } }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(solInput)));
    if (output.errors && output.errors.some((e: any) => e.severity === "error")) {
      const messages = output.errors.map((e: any) => e.formattedMessage).join("\n");
      return createErrorResponse(`Compilation error: ${messages}`);
    }
    return createSuccessResponse(JSON.stringify(output.contracts, null, 2));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`Compilation failed: ${message}`);
  }
};

export const securityAuditHandler = async (input: { file: string }): Promise<ToolResultSchema> => {
  try {
    const { stdout, stderr } = await exec(`slither ${input.file}`);
    const output = stdout || stderr;
    return createSuccessResponse(output.trim());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`Slither failed: ${message}`);
  }
};

export const compileCircomHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
    const filePath = path.join(tmpDir, "circuit.circom");
    fs.writeFileSync(filePath, input.source);
    await exec(`circom ${filePath} --wasm --r1cs -o ${tmpDir}`);
    return createSuccessResponse(`Circuit compiled to ${tmpDir}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`Circom compilation failed: ${message}`);
  }
};

export const auditCircomHandler = async (input: { file: string }): Promise<ToolResultSchema> => {
  try {
    const { stdout, stderr } = await exec(`circomspect ${input.file}`);
    const output = stdout || stderr;
    return createSuccessResponse(output.trim());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`circomspect failed: ${message}`);
  }
};
