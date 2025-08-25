import {
  compileSolidityHandler,
  securityAuditHandler,
  compileCircomHandler,
  auditCircomHandler
} from "./handlers/devtools.js";

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
        file: { type: "string" }
      },
      required: ["file"]
    }
  }
];

type handlerDictionary = Record<typeof tools[number]["name"], (input: any) => Promise<any>>;

export const handlers: handlerDictionary = {
  compile_solidity: compileSolidityHandler,
  security_audit: securityAuditHandler,
  compile_circom: compileCircomHandler,
  audit_circom: auditCircomHandler
};
