import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";

interface ConsolidateArgs {
  outputPath?: string;
}

interface ConsolidatedReport {
  timestamp: string;
  summary: {
    unitTests?: TestSummary;
    e2eTests?: E2ESummary;
    visualTests?: VisualSummary;
    overallStatus: "passed" | "failed" | "partial";
  };
  details: {
    unitTests?: any;
    e2eTests?: any;
    visualInspection?: any;
  };
  artifacts: string[];
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
}

interface E2ESummary {
  totalSteps: number;
  executedSteps: number;
  passedSteps: number;
  screenshots: number;
}

interface VisualSummary {
  totalScreenshots: number;
  passedScreenshots: number;
  ocrChecks: number;
  visualDiffs: number;
  vlmChecks: number;
}

export async function consolidateReport(args: ConsolidateArgs) {
  const { outputPath = ".artifacts/consolidated-report.json" } = args;
  
  try {
    const report: ConsolidatedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        overallStatus: "passed"
      },
      details: {},
      artifacts: []
    };
    
    const unitTestResults = await loadJsonFile(".artifacts/unit-test-results.json");
    if (unitTestResults) {
      report.summary.unitTests = {
        total: unitTestResults.summary?.total || 0,
        passed: unitTestResults.summary?.passed || 0,
        failed: unitTestResults.summary?.failed || 0,
        skipped: unitTestResults.summary?.skipped || 0,
        coverage: extractCoveragePercentage(unitTestResults.coverage)
      };
      
      report.details.unitTests = {
        duration: unitTestResults.summary?.duration,
        timestamp: unitTestResults.timestamp,
        failedTests: extractFailedTests(unitTestResults.results)
      };
      
      report.artifacts.push(".artifacts/unit-test-results.json");
      
      if (unitTestResults.summary?.failed > 0) {
        report.summary.overallStatus = "failed";
      }
    }
    
    const e2eResults = await loadJsonFile(".artifacts/e2e-results.json");
    if (e2eResults) {
      const passedSteps = e2eResults.results?.filter((r: any) => r.success).length || 0;
      const screenshots = e2eResults.results?.filter((r: any) => r.screenshot).length || 0;
      
      report.summary.e2eTests = {
        totalSteps: e2eResults.totalSteps || 0,
        executedSteps: e2eResults.results?.length || 0,
        passedSteps,
        screenshots
      };
      
      report.details.e2eTests = {
        baseUrl: e2eResults.baseUrl,
        timestamp: e2eResults.timestamp,
        failedSteps: extractFailedSteps(e2eResults.results)
      };
      
      report.artifacts.push(".artifacts/e2e-results.json");
      
      if (passedSteps < e2eResults.totalSteps) {
        report.summary.overallStatus = report.summary.overallStatus === "failed" ? "failed" : "partial";
      }
    }
    
    const inspectionResults = await loadJsonFile(".artifacts/inspection-results.json");
    if (inspectionResults) {
      const passedScreenshots = inspectionResults.results?.filter((r: any) => r.passed).length || 0;
      const allChecks = inspectionResults.results?.flatMap((r: any) => r.checks || []) || [];
      
      report.summary.visualTests = {
        totalScreenshots: inspectionResults.totalScreenshots || 0,
        passedScreenshots,
        ocrChecks: allChecks.filter((c: any) => c.type === "ocr").length,
        visualDiffs: allChecks.filter((c: any) => c.type === "visual-diff").length,
        vlmChecks: allChecks.filter((c: any) => c.type === "vlm-eval").length
      };
      
      report.details.visualInspection = {
        timestamp: inspectionResults.timestamp,
        failedChecks: extractFailedChecks(inspectionResults.results)
      };
      
      report.artifacts.push(".artifacts/inspection-results.json");
      
      if (!inspectionResults.success) {
        report.summary.overallStatus = report.summary.overallStatus === "passed" ? "partial" : report.summary.overallStatus;
      }
    }
    
    const screenshotArtifacts = await findScreenshots();
    report.artifacts.push(...screenshotArtifacts);
    
    await writeFile(outputPath, JSON.stringify(report, null, 2));
    
    const summaryText = generateSummaryText(report);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            reportPath: outputPath,
            summary: summaryText,
            report
          }, null, 2)
        }
      ]
    };
    
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ]
    };
  }
}

async function loadJsonFile(path: string): Promise<any | null> {
  try {
    await access(path, constants.F_OK);
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractCoveragePercentage(coverage: any): number | undefined {
  if (!coverage || !coverage.total) return undefined;
  
  const lines = coverage.total.lines;
  if (lines && lines.total > 0) {
    return (lines.covered / lines.total) * 100;
  }
  
  return undefined;
}

function extractFailedTests(results: any[]): any[] {
  if (!results) return [];
  
  return results
    .filter(r => r.status === "failed")
    .map(r => ({
      suite: r.suite,
      test: r.test,
      error: r.error
    }))
    .slice(0, 10);
}

function extractFailedSteps(results: any[]): any[] {
  if (!results) return [];
  
  return results
    .filter(r => !r.success)
    .map(r => ({
      step: r.step,
      action: r.action,
      error: r.error,
      screenshot: r.screenshot
    }))
    .slice(0, 10);
}

function extractFailedChecks(results: any[]): any[] {
  if (!results) return [];
  
  const failed: any[] = [];
  
  for (const result of results) {
    const failedChecks = (result.checks || []).filter((c: any) => !c.passed);
    
    for (const check of failedChecks) {
      failed.push({
        screenshot: result.screenshot,
        type: check.type,
        details: check.details
      });
    }
  }
  
  return failed.slice(0, 10);
}

async function findScreenshots(): Promise<string[]> {
  const screenshots: string[] = [];
  
  try {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(".artifacts/screenshots");
    
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        screenshots.push(`.artifacts/screenshots/${file}`);
      }
    }
  } catch {
    // Screenshots directory doesn't exist
  }
  
  return screenshots;
}

function generateSummaryText(report: ConsolidatedReport): string {
  const lines: string[] = [];
  
  lines.push(`🎯 Test Suite Consolidated Report`);
  lines.push(`📅 ${report.timestamp}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  if (report.summary.unitTests) {
    const ut = report.summary.unitTests;
    const passRate = ut.total > 0 ? ((ut.passed / ut.total) * 100).toFixed(1) : '0';
    lines.push(`\n📝 Unit Tests:`);
    lines.push(`   ✅ Passed: ${ut.passed}/${ut.total} (${passRate}%)`);
    if (ut.failed > 0) lines.push(`   ❌ Failed: ${ut.failed}`);
    if (ut.skipped > 0) lines.push(`   ⏭️  Skipped: ${ut.skipped}`);
    if (ut.coverage !== undefined) {
      lines.push(`   📊 Coverage: ${ut.coverage.toFixed(1)}%`);
    }
  }
  
  if (report.summary.e2eTests) {
    const e2e = report.summary.e2eTests;
    const passRate = e2e.totalSteps > 0 ? ((e2e.passedSteps / e2e.totalSteps) * 100).toFixed(1) : '0';
    lines.push(`\n🌐 E2E Tests:`);
    lines.push(`   ✅ Passed: ${e2e.passedSteps}/${e2e.totalSteps} steps (${passRate}%)`);
    lines.push(`   📸 Screenshots: ${e2e.screenshots}`);
  }
  
  if (report.summary.visualTests) {
    const vt = report.summary.visualTests;
    const passRate = vt.totalScreenshots > 0 ? ((vt.passedScreenshots / vt.totalScreenshots) * 100).toFixed(1) : '0';
    lines.push(`\n👁️  Visual Tests:`);
    lines.push(`   ✅ Passed: ${vt.passedScreenshots}/${vt.totalScreenshots} (${passRate}%)`);
    lines.push(`   🔤 OCR Checks: ${vt.ocrChecks}`);
    lines.push(`   🖼️  Visual Diffs: ${vt.visualDiffs}`);
    if (vt.vlmChecks > 0) {
      lines.push(`   🤖 VLM Checks: ${vt.vlmChecks}`);
    }
  }
  
  lines.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const statusEmoji = {
    passed: "✅",
    failed: "❌",
    partial: "⚠️"
  };
  
  lines.push(`Overall Status: ${statusEmoji[report.summary.overallStatus]} ${report.summary.overallStatus.toUpperCase()}`);
  lines.push(`Artifacts: ${report.artifacts.length} files`);
  
  return lines.join('\n');
}