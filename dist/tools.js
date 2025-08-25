import { compileSolidityHandler, securityAuditHandler, compileCircomHandler, auditCircomHandler } from "./handlers/devtools.js";
export const tools = [
    {
        name: "compile_solidity",
        description: "Compile Solidity contracts using solc",
        inputSchema: {
            type: "object",
            properties: {
                source: { type: "string" }
            },
            required: ["source"]
        }
    },
    {
        name: "security_audit",
        description: "Run Slither static analysis on Solidity code",
        inputSchema: {
            type: "object",
            properties: {
                source: { type: "string" },
                file: { type: "string" }
            },
            anyOf: [
                { required: ["source"] },
                { required: ["file"] }
            ]
        }
    },
    {
        name: "compile_circom",
        description: "Compile Circom circuits using circom",
        inputSchema: {
            type: "object",
            properties: {
                source: { type: "string" }
            },
            required: ["source"]
        }
    },
    {
        name: "audit_circom",
        description: "Audit Circom circuits with circomspect",
        inputSchema: {
            type: "object",
            properties: {
                source: { type: "string" }
            },
            required: ["source"]
        }
    }
];
export const handlers = {
    compile_solidity: compileSolidityHandler,
    security_audit: securityAuditHandler,
    compile_circom: compileCircomHandler,
    audit_circom: auditCircomHandler
};
