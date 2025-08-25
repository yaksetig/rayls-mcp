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
    const solc: any = await import("solc");
    const solInput = {
      language: "Solidity",
      sources: { "Contract.sol": { content: input.source } },
      settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] }, "": ["ast"] } }
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
