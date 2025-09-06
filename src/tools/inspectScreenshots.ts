import { readFile, readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import Tesseract from "tesseract.js";
import { vlmJudge } from "../utils/ollama.js";

interface InspectArgs {
  screenshotDir: string;
  baselineDir?: string;
  ocrLanguages?: string[];
}

interface InspectionResult {
  screenshot: string;
  checks: CheckResult[];
  passed: boolean;
}

interface CheckResult {
  type: string;
  passed: boolean;
  details: string;
  confidence?: number;
}

export async function inspectScreenshots(args: InspectArgs) {
  const { screenshotDir, baselineDir, ocrLanguages = ["eng"] } = args;
  
  try {
    const screenshots = await getScreenshots(screenshotDir);
    const results: InspectionResult[] = [];
    
    const stepsData = await loadE2ESteps();
    
    for (const screenshot of screenshots) {
      const result: InspectionResult = {
        screenshot,
        checks: [],
        passed: true
      };
      
      if (baselineDir) {
        const diffResult = await compareWithBaseline(screenshot, baselineDir);
        if (diffResult) {
          result.checks.push(diffResult);
          if (!diffResult.passed) result.passed = false;
        }
      }
      
      const stepAssertions = findAssertionsForScreenshot(screenshot, stepsData);
      
      for (const assertion of stepAssertions) {
        const check = await runDeferredAssertion(screenshot, assertion, ocrLanguages);
        result.checks.push(check);
        if (!check.passed) result.passed = false;
      }
      
      results.push(result);
    }
    
    const report = {
      success: results.every(r => r.passed),
      totalScreenshots: screenshots.length,
      results,
      timestamp: new Date().toISOString()
    };
    
    await saveInspectionResults(report);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report, null, 2)
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

async function getScreenshots(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  const screenshots: string[] = [];
  
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
      screenshots.push(join(dir, file));
    }
  }
  
  return screenshots;
}

async function compareWithBaseline(
  screenshotPath: string,
  baselineDir: string
): Promise<CheckResult | null> {
  try {
    const screenshotName = basename(screenshotPath);
    const baselinePath = join(baselineDir, screenshotName);
    
    const baselineStats = await stat(baselinePath).catch(() => null);
    if (!baselineStats) {
      // Auto-generate baseline on first run
      const { mkdir, copyFile } = await import("node:fs/promises");
      await mkdir(baselineDir, { recursive: true });
      await copyFile(screenshotPath, baselinePath);
      
      return {
        type: "visual-diff",
        passed: true,
        details: "Baseline image auto-generated for future comparisons"
      };
    }
    
    const img1 = PNG.sync.read(await readFile(screenshotPath));
    const img2 = PNG.sync.read(await readFile(baselinePath));
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const diffPercentage = (numDiffPixels / (width * height)) * 100;
    
    return {
      type: "visual-diff",
      passed: diffPercentage < 5, // Less than 5% difference
      details: `${diffPercentage.toFixed(2)}% pixels different`,
      confidence: 100 - diffPercentage
    };
  } catch (error) {
    return {
      type: "visual-diff",
      passed: false,
      details: error instanceof Error ? error.message : "Comparison failed"
    };
  }
}

async function runDeferredAssertion(
  screenshotPath: string,
  assertion: any,
  languages: string[]
): Promise<CheckResult> {
  switch (assertion.kind) {
    case "ocr":
      return await runOCRCheck(screenshotPath, assertion.expected, languages);
    
    case "vlm-eval":
      return await runVLMCheck(screenshotPath, assertion);
    
    default:
      return {
        type: assertion.kind,
        passed: true,
        details: "Already checked during E2E run"
      };
  }
}

async function runOCRCheck(
  screenshotPath: string,
  expectedText: string | undefined,
  languages: string[]
): Promise<CheckResult> {
  try {
    // Validate expectedText exists
    if (!expectedText || typeof expectedText !== 'string') {
      return {
        type: "ocr",
        passed: false,
        details: "No expected text provided for OCR check"
      };
    }
    
    const worker = await Tesseract.createWorker(languages.join('+'));
    const { data: { text, confidence } } = await worker.recognize(screenshotPath);
    await worker.terminate();
    
    // Safely normalize text
    const normalizedText = (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedExpected = expectedText.toLowerCase().replace(/\s+/g, ' ').trim();
    const found = normalizedText.includes(normalizedExpected);
    
    return {
      type: "ocr",
      passed: found,
      details: found ? `Text "${expectedText}" found` : `Text "${expectedText}" not found in OCR result: "${normalizedText.substring(0, 100)}..."`,
      confidence
    };
  } catch (error) {
    return {
      type: "ocr",
      passed: false,
      details: error instanceof Error ? error.message : "OCR failed"
    };
  }
}

async function runVLMCheck(screenshotPath: string, assertion: any): Promise<CheckResult> {
  try {
    const reply = await vlmJudge({
      model: assertion.model || "llava:13b",
      screenshotPath,
      prompt: assertion.prompt
    });
    
    const passIf = (assertion.passIf || "YES").toUpperCase();
    const passed = reply.toUpperCase().includes(passIf);
    
    return {
      type: "vlm-eval",
      passed,
      details: `VLM response: ${reply.slice(0, 200)}...`
    };
  } catch (error) {
    return {
      type: "vlm-eval",
      passed: false,
      details: error instanceof Error ? error.message : "VLM evaluation failed"
    };
  }
}

async function loadE2ESteps(): Promise<any> {
  try {
    const data = await readFile('.artifacts/e2e-steps.json', 'utf-8');
    return JSON.parse(data);
  } catch {
    return { steps: [] };
  }
}

function findAssertionsForScreenshot(screenshotPath: string, stepsData: any): any[] {
  const screenshotName = basename(screenshotPath);
  const assertions: any[] = [];
  
  for (const step of stepsData.steps || []) {
    if (step.screenshot && basename(step.screenshot) === screenshotName) {
      for (const assertion of step.assertions || []) {
        if (assertion.kind === "ocr" || assertion.kind === "vlm-eval") {
          assertions.push(assertion);
        }
      }
    }
  }
  
  return assertions;
}

async function saveInspectionResults(report: any) {
  const { writeFile } = await import("node:fs/promises");
  
  await writeFile(
    '.artifacts/inspection-results.json',
    JSON.stringify(report, null, 2)
  );
}