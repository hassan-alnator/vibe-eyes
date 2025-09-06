import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";

const execAsync = promisify(exec);

interface RunUnitTestsArgs {
  testPath?: string;
  coverage?: boolean;
}

interface TestResult {
  suite: string;
  test: string;
  status: "passed" | "failed" | "skipped";
  duration?: number;
  error?: string;
}

export async function runUnitTests(args: RunUnitTestsArgs) {
  const { testPath, coverage = false } = args;
  
  try {
    let command = "npx vitest run --reporter=json";
    
    if (testPath) {
      command += ` ${testPath}`;
    }
    
    if (coverage) {
      command += " --coverage";
    }
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const results = parseVitestOutput(stdout);
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === "passed").length,
      failed: results.filter(r => r.status === "failed").length,
      skipped: results.filter(r => r.status === "skipped").length,
      duration: results.reduce((acc, r) => acc + (r.duration || 0), 0)
    };
    
    const report = {
      success: summary.failed === 0,
      summary,
      results: results.slice(0, 50), // Limit to first 50 results
      timestamp: new Date().toISOString(),
      coverage: coverage ? await getCoverageReport() : null
    };
    
    await saveTestResults(report);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            hint: "Tests may have failed. Check the error details above."
          }, null, 2)
        }
      ]
    };
  }
}

function parseVitestOutput(output: string): TestResult[] {
  try {
    const lines = output.split('\n');
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    
    if (!jsonLine) {
      return [];
    }
    
    const data = JSON.parse(jsonLine);
    const results: TestResult[] = [];
    
    if (data.testResults) {
      for (const file of data.testResults) {
        for (const test of file.assertionResults || []) {
          results.push({
            suite: file.name,
            test: test.title,
            status: test.status,
            duration: test.duration,
            error: test.failureMessages?.[0]
          });
        }
      }
    }
    
    return results;
  } catch {
    return [];
  }
}

async function getCoverageReport() {
  try {
    const coverageData = await readFile('coverage/coverage-summary.json', 'utf-8');
    return JSON.parse(coverageData);
  } catch {
    return null;
  }
}

async function saveTestResults(report: any) {
  const { writeFile, mkdir } = await import("node:fs/promises");
  
  await mkdir('.artifacts', { recursive: true });
  await writeFile(
    '.artifacts/unit-test-results.json',
    JSON.stringify(report, null, 2)
  );
}