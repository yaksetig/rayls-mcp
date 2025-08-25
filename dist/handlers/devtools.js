import { promisify } from "util";
import { exec as execCallback } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createErrorResponse, createSuccessResponse } from "./utils.js";
const exec = promisify(execCallback);
const resolveCmd = (cmd, envVar) => {
    if (process.env[envVar])
        return process.env[envVar];
    const localPath = path.join(process.cwd(), "node_modules", ".bin", cmd);
    return fs.existsSync(localPath) ? localPath : cmd;
};
export const compileSolidityHandler = async (input) => {
    try {
        const solc = await import("solc");
        const solInput = {
            language: "Solidity",
            sources: { "Contract.sol": { content: input.source } },
            settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] }, "": ["ast"] } }
        };
        const output = JSON.parse(solc.compile(JSON.stringify(solInput)));
        if (output.errors && output.errors.some((e) => e.severity === "error")) {
            const messages = output.errors.map((e) => e.formattedMessage).join("\n");
            return createErrorResponse(`Compilation error: ${messages}`);
        }
        return createSuccessResponse(JSON.stringify(output.contracts, null, 2));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return createErrorResponse(`Compilation failed: ${message}`);
    }
};
export const securityAuditHandler = async (input) => {
    try {
        if (!input.file) {
            return createErrorResponse("No file path provided");
        }
        if (!fs.existsSync(input.file)) {
            return createErrorResponse(`File not found: ${input.file}`);
        }
        // Verify slither is available before attempting to run it
        try {
            await exec("command -v slither");
        }
        catch {
            return createErrorResponse("Slither is not installed or not found in PATH");
        }
        const { stdout, stderr } = await exec(`slither ${input.file}`);
        const output = stdout || stderr;
        return createSuccessResponse(output.trim());
    }
    catch (err) {
        const error = err;
        const stderr = error?.stderr?.toString().trim();
        const message = stderr || (err instanceof Error ? err.message : String(err));
        return createErrorResponse(`Slither failed: ${message}`);
    }
};
export const compileCircomHandler = async (input) => {
    try {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circom-"));
        const filePath = path.join(tmpDir, "circuit.circom");
        fs.writeFileSync(filePath, input.source);
        const circomCmd = resolveCmd("circom", "CIRCOM_PATH");
        await exec(`${circomCmd} ${filePath} --wasm --r1cs -o ${tmpDir}`);
        return createSuccessResponse(`Circuit compiled to ${tmpDir}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return createErrorResponse(`Circom compilation failed: ${message}`);
    }
};
export const auditCircomHandler = async (input) => {
    try {
        const circomspectCmd = resolveCmd("circomspect", "CIRCOMSPECT_PATH");
        const { stdout, stderr } = await exec(`${circomspectCmd} ${input.file}`);
        const output = stdout || stderr;
        return createSuccessResponse(output.trim());
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return createErrorResponse(`circomspect failed: ${message}`);
    }
};
