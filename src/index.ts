import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { generateUnitTests } from "./tools/generateUnitTests.js";
import { runUnitTests } from "./tools/runUnitTests.js";
import { runE2E } from "./tools/runE2E.js";
import { inspectScreenshots } from "./tools/inspectScreenshots.js";
import { consolidateReport } from "./tools/consolidateReport.js";
import { generateHTMLReport } from "./tools/generateHTMLReport.js";

const server = new Server(
  {
    name: "eyes-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_unit_tests",
        description: "Generate Vitest unit tests for specified components",
        inputSchema: {
          type: "object",
          properties: {
            targetPath: {
              type: "string",
              description: "Path to the file or directory to generate tests for",
            },
            testStrategy: {
              type: "string",
              enum: ["basic", "comprehensive", "edge-cases"],
              description: "Test generation strategy",
            },
          },
          required: ["targetPath"],
        },
      },
      {
        name: "run_unit_tests",
        description: "Run Vitest unit tests and parse results",
        inputSchema: {
          type: "object",
          properties: {
            testPath: {
              type: "string",
              description: "Path to test files (optional, runs all if not specified)",
            },
            coverage: {
              type: "boolean",
              description: "Include coverage report",
            },
          },
        },
      },
      {
        name: "run_e2e",
        description: "Run Playwright E2E tests with screenshot capture",
        inputSchema: {
          type: "object",
          properties: {
            baseUrl: {
              type: "string",
              description: "Base URL of the application to test",
            },
            attendedMode: {
              type: "boolean",
              description: "Run browser in attended mode (visible browser window) instead of headless",
            },
            steps: {
              type: "array",
              description: "Array of test steps to execute",
              items: {
                type: "object",
                properties: {
                  action: {
                    type: "string",
                    enum: ["navigate", "click", "type", "screenshot", "wait"],
                  },
                  selector: {
                    type: "string",
                    description: "CSS selector or text selector",
                  },
                  value: {
                    type: "string",
                    description: "Value for type action or URL for navigate",
                  },
                  name: {
                    type: "string",
                    description: "Name for screenshot",
                  },
                  assertions: {
                    type: "array",
                    description: "Assertions to check",
                    items: {
                      type: "object",
                      properties: {
                        kind: {
                          type: "string",
                          enum: ["text", "element", "ocr", "visual-diff", "vlm-eval"],
                        },
                        selector: {
                          type: "string",
                        },
                        expected: {
                          type: "string",
                        },
                        prompt: {
                          type: "string",
                          description: "Prompt for VLM evaluation",
                        },
                        passIf: {
                          type: "string",
                          description: "Pass condition for VLM",
                        },
                        model: {
                          type: "string",
                          description: "VLM model to use",
                        },
                      },
                    },
                  },
                },
                required: ["action"],
              },
            },
          },
          required: ["baseUrl", "steps"],
        },
      },
      {
        name: "inspect_screenshots",
        description: "Inspect screenshots with OCR and visual diff",
        inputSchema: {
          type: "object",
          properties: {
            screenshotDir: {
              type: "string",
              description: "Directory containing screenshots",
            },
            baselineDir: {
              type: "string",
              description: "Directory containing baseline images for comparison",
            },
            ocrLanguages: {
              type: "array",
              items: {
                type: "string",
              },
              description: "OCR language codes (e.g., ['eng', 'ara'])",
            },
          },
          required: ["screenshotDir"],
        },
      },
      {
        name: "consolidate_report",
        description: "Consolidate all test results into a single report",
        inputSchema: {
          type: "object",
          properties: {
            outputPath: {
              type: "string",
              description: "Path for the consolidated report",
            },
          },
        },
      },
      {
        name: "generate_html_report",
        description: "Generate an HTML report with embedded screenshots",
        inputSchema: {
          type: "object",
          properties: {
            reportPath: {
              type: "string",
              description: "Path to the JSON report (default: .artifacts/consolidated-report.json)",
            },
            outputPath: {
              type: "string",
              description: "Path for the HTML report (default: .artifacts/test-report.html)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "generate_unit_tests":
      return await generateUnitTests(args as any);
    
    case "run_unit_tests":
      return await runUnitTests(args as any);
    
    case "run_e2e":
      return await runE2E(args as any);
    
    case "inspect_screenshots":
      return await inspectScreenshots(args as any);
    
    case "consolidate_report":
      return await consolidateReport(args as any);
    
    case "generate_html_report":
      return await generateHTMLReport(args as any);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Eyes MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});