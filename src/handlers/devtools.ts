import { promisify } from "util";
import { exec as execCallback } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorResponse, createSuccessResponse } from "./utils.js";
import { ToolResultSchema } from "../types.js";

const exec = promisify(execCallback);

const resolveCmd = (cmd: string, envVar: string) => {
  if (process.env[envVar]) return process.env[envVar] as string;
  const localPath = path.join(process.cwd(), "node_modules", ".bin", cmd);
  return fs.existsSync(localPath) ? localPath : cmd;
};

export const compileSolidityHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "solidity-"));
    const filePath = path.join(tmpDir, "Contract.sol");
    fs.writeFileSync(filePath, input.source);

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
      sources: { "Contract.sol": { content: fs.readFileSync(filePath, "utf8") } },
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

export const securityAuditHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "slither-"));
    const filePath = path.join(tmpDir, "Contract.sol");
    fs.writeFileSync(filePath, input.source);

    // Verify slither is available before attempting to run it
    try {
      await exec("command -v slither");
    } catch {
      return createErrorResponse("Slither is not installed or not found in PATH");
    }

    const { stdout, stderr } = await exec(`slither ${filePath}`);
    const output = stdout || stderr;
    return createSuccessResponse(output.trim());
  } catch (err) {
    const error: any = err;
    const stderr = error?.stderr?.toString().trim();
    const message = stderr || (err instanceof Error ? err.message : String(err));
    return createErrorResponse(`Slither failed: ${message}`);
  }
};

export const compileCircomHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
    const filePath = path.join(tmpDir, "circuit.circom");
    fs.writeFileSync(filePath, input.source);
    const circomCmd = resolveCmd("circom", "CIRCOM_PATH");
    await exec(`${circomCmd} ${filePath} --wasm --r1cs -o ${tmpDir}`);
    return createSuccessResponse(`Circuit compiled to ${tmpDir}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`Circom compilation failed: ${message}`);
  }
};

export const auditCircomHandler = async (
  input: { source?: string; file?: string }
): Promise<ToolResultSchema> => {
  try {
    const source = input.source ?? input.file;
    if (!source) {
      return createErrorResponse("No circuit source provided");
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
    const filePath = path.join(tmpDir, "circuit.circom");
    fs.writeFileSync(filePath, source);

    const circomspectCmd = resolveCmd("circomspect", "CIRCOMSPECT_PATH");
    const { stdout, stderr } = await exec(`${circomspectCmd} ${filePath}`);
    const output = stdout || stderr;
    return createSuccessResponse(output.trim());
  } catch (err) {
    const e = err as any;
    const stderr = e?.stderr?.toString() ?? "";
    const notFound = e?.code === 127 || /not found/i.test(stderr);
    const message = notFound
      ? "circomspect executable not found. Please install circomspect and ensure it is in your PATH."
      : e instanceof Error
        ? e.message
        : String(e);
    return createErrorResponse(`circomspect failed: ${message}`);
  }
};
