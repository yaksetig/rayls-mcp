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

export const compileSolidityHandler = async (
  input: { source: string; filename?: string }
): Promise<ToolResultSchema> => {
  const filename = input.filename || "Contract.sol";
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "solidity-"));
  const filePath = path.join(tmpDir, path.basename(filename));
  fs.writeFileSync(filePath, input.source);

  let stdout = "";
  let stderr = "";
  let success = false;
  const errors: string[] = [];
  const warnings: string[] = [];
  let contracts: any = null;

  try {
    // Prefer system solc, fallback to solcjs from node_modules
    let solcCmd = resolveCmd("solc", "SOLC_PATH");
    try {
      await exec(`${solcCmd} --version`);
    } catch {
      solcCmd = resolveCmd("solcjs", "SOLCJS_PATH");
    }

    try {
      const result = await exec(`${solcCmd} --combined-json abi,bin,metadata ${filePath}`);
      stdout = result.stdout;
      stderr = result.stderr;
      success = true;
    } catch (e: any) {
      stdout = e.stdout ?? "";
      stderr = e.stderr ?? "";
      success = false;
    }

    if (!success) {
      // Fallback to solc JS API
      const solcModule: any = await import("solc");
      const solc: any = solcModule.default || solcModule;
      const solInput = {
        language: "Solidity",
        sources: { [filename]: { content: fs.readFileSync(filePath, "utf8") } },
        settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"], "": ["ast"] } } }
      };
      const output = JSON.parse(solc.compile(JSON.stringify(solInput)));
      contracts = output.contracts || {};
      if (output.errors) {
        for (const e of output.errors) {
          if (e.severity === "error") errors.push(e.formattedMessage);
          else if (e.severity === "warning") warnings.push(e.formattedMessage);
        }
        success = !output.errors.some((e: any) => e.severity === "error");
      } else {
        success = true;
      }
    }
  } catch (e: any) {
    stderr = e.stderr ?? "";
    errors.push(e.message ?? String(e));
    success = false;
  } finally {
    fs.unlinkSync(filePath);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  if (stdout && success) {
    try {
      const output = JSON.parse(stdout);
      contracts = output.contracts || {};
    } catch {
      errors.push("Failed to parse compilation output");
      success = false;
    }
  }

  if (stderr && !stderr.includes("Warning:")) {
    const lines = stderr.trim().split("\n");
    for (const line of lines) {
      if (line.includes("Error:")) errors.push(line.trim());
      else if (line.includes("Warning:")) warnings.push(line.trim());
      else if (line) errors.push(line.trim());
    }
  } else if (stderr) {
    const lines = stderr.trim().split("\n");
    for (const line of lines) {
      if (line.includes("Warning:")) warnings.push(line.trim());
    }
  }

  const result = { success, errors, warnings, contracts, filename };
  return success
    ? createSuccessResponse(JSON.stringify(result))
    : createErrorResponse(JSON.stringify(result));
};

export const securityAuditHandler = async (
  input: { source: string; filename?: string }
): Promise<ToolResultSchema> => {
  const filename = input.filename || "Contract.sol";
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "slither-"));
  const filePath = path.join(tmpDir, path.basename(filename));
  fs.writeFileSync(filePath, input.source);

  let stdout = "";
  let stderr = "";
  let success = false;

  try {
    try {
      const result = await exec(`slither ${filePath} --json -`);
      stdout = result.stdout;
      stderr = result.stderr;
      success = true;
    } catch (e: any) {
      stdout = e.stdout ?? "";
      stderr = e.stderr ?? "";
      success = false;
    }
  } finally {
    fs.unlinkSync(filePath);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  let findings: any[] = [];
  let summary: any = {};
  const errors: string[] = [];

  if (stdout) {
    try {
      const output = JSON.parse(stdout);
      findings = output.results?.detectors || [];
      const severityCounts: Record<string, number> = {};
      for (const finding of findings) {
        const impact = finding.impact || "unknown";
        severityCounts[impact] = (severityCounts[impact] || 0) + 1;
      }
      summary = {
        total_findings: findings.length,
        severity_breakdown: severityCounts
      };
    } catch {
      errors.push("Failed to parse Slither output");
      success = false;
    }
  }

  if (stderr && !success) {
    errors.push(stderr.trim());
  }

  const result = { success, findings, summary, errors, filename };
  return success
    ? createSuccessResponse(JSON.stringify(result))
    : createErrorResponse(JSON.stringify(result));
};

export const compileCircomHandler = async (input: { source: string }): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
    const filePath = path.join(tmpDir, "circuit.circom");
    fs.writeFileSync(filePath, input.source);
    const circomCmd = resolveCmd("circom", "CIRCOM_PATH");
    try {
      await exec(`${circomCmd} ${filePath} --wasm --r1cs -o ${tmpDir}`);
    } catch (e) {
      const error: any = e;
      const stderr = error?.stderr?.toString() ?? "";
      const notFound = error?.code === 127 || /not found/i.test(stderr);
      const message = notFound
        ? "circom executable not found. Please install circom and ensure it is in your PATH."
        : error instanceof Error
          ? error.message
          : String(error);
      return createErrorResponse(`Circom compilation failed: ${message}`);
    }
    return createSuccessResponse(`Circuit compiled to ${tmpDir}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return createErrorResponse(`Circom compilation failed: ${message}`);
  }
};

export const auditCircomHandler = async (
  input: { source: string; filename: string }
): Promise<ToolResultSchema> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
    const filename = path.basename(input.filename);
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, input.source);

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
