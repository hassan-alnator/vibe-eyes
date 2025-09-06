import { chromium, Page, Browser } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface E2EArgs {
  baseUrl: string;
  steps: TestStep[];
}

interface TestStep {
  action: "navigate" | "click" | "type" | "screenshot" | "wait" | "select" | "hover" | "scroll";
  selector?: string;
  value?: string;
  name?: string;
  assertions?: Assertion[];
  retries?: number;
  timeout?: number;
}

interface Assertion {
  kind: "text" | "element" | "ocr" | "visual-diff" | "vlm-eval";
  selector?: string;
  expected?: string;
  prompt?: string;
  passIf?: string;
  model?: string;
}

interface StepResult {
  step: number;
  action: string;
  success: boolean;
  screenshot?: string;
  assertions?: AssertionResult[];
  error?: string;
}

interface AssertionResult {
  kind: string;
  passed: boolean;
  details?: string;
}

export async function runE2E(args: E2EArgs) {
  const { baseUrl, steps } = args;
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    await mkdir('.artifacts/screenshots', { recursive: true });
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const results: StepResult[] = [];
    let stepIndex = 0;
    
    for (const step of steps) {
      const result: StepResult = {
        step: stepIndex++,
        action: step.action,
        success: false
      };
      
      try {
        // Add retry logic
        const maxRetries = step.retries || 0;
        let attempt = 0;
        let actionSuccess = false;
        
        while (attempt <= maxRetries && !actionSuccess) {
          try {
            const startTime = Date.now();
            
            switch (step.action) {
              case "navigate":
                await page.goto(step.value || baseUrl, { 
                  waitUntil: 'networkidle',
                  timeout: step.timeout || 30000 
                });
                actionSuccess = true;
                break;
                
              case "click":
                if (step.selector) {
                  await page.click(step.selector, { timeout: step.timeout || 5000 });
                  actionSuccess = true;
                }
                break;
                
              case "type":
                if (step.selector && step.value) {
                  await page.fill(step.selector, step.value, { timeout: step.timeout || 5000 });
                  actionSuccess = true;
                }
                break;
                
              case "select":
                if (step.selector && step.value) {
                  await page.selectOption(step.selector, step.value, { timeout: step.timeout || 5000 });
                  actionSuccess = true;
                }
                break;
                
              case "hover":
                if (step.selector) {
                  await page.hover(step.selector, { timeout: step.timeout || 5000 });
                  actionSuccess = true;
                }
                break;
                
              case "scroll":
                if (step.value) {
                  await page.evaluate(`window.scrollTo(0, ${parseInt(step.value)})`);
                } else if (step.selector) {
                  await page.locator(step.selector).scrollIntoViewIfNeeded();
                }
                actionSuccess = true;
                break;
                
              case "screenshot":
                const screenshotName = step.name || `step-${stepIndex}`;
                const screenshotPath = join('.artifacts/screenshots', `${screenshotName}.png`);
                await page.screenshot({ path: screenshotPath, fullPage: false });
                result.screenshot = screenshotPath;
                actionSuccess = true;
                break;
                
              case "wait":
                const timeout = parseInt(step.value || "1000");
                await page.waitForTimeout(timeout);
                actionSuccess = true;
                break;
                
              default:
                actionSuccess = true;
                break;
            }
            
            // Track performance
            const duration = Date.now() - startTime;
            (result as any).duration = duration;
            
          } catch (retryError) {
            if (attempt < maxRetries) {
              attempt++;
              await page.waitForTimeout(1000); // Wait 1s before retry
            } else {
              throw retryError;
            }
          }
        }
        
        result.success = actionSuccess;
        
        if (step.assertions && step.assertions.length > 0) {
          result.assertions = await runAssertions(page, step.assertions);
          
          const allPassed = result.assertions.every(a => a.passed);
          if (!allPassed) {
            result.success = false;
          }
        }
        
        if (step.action !== "screenshot" && result.success) {
          const autoScreenshotPath = join('.artifacts/screenshots', `auto-step-${stepIndex}.png`);
          await page.screenshot({ path: autoScreenshotPath });
          result.screenshot = autoScreenshotPath;
        }
        
      } catch (error) {
        result.success = false;
        result.error = error instanceof Error ? error.message : String(error);
        
        const errorScreenshotPath = join('.artifacts/screenshots', `error-step-${stepIndex}.png`);
        await page.screenshot({ path: errorScreenshotPath });
        result.screenshot = errorScreenshotPath;
      }
      
      results.push(result);
      
      if (!result.success && !step.assertions) {
        break;
      }
    }
    
    const report = {
      success: results.every(r => r.success),
      baseUrl,
      totalSteps: steps.length,
      executedSteps: results.length,
      results,
      timestamp: new Date().toISOString()
    };
    
    await saveE2EResults(report);
    
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
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

async function runAssertions(page: Page, assertions: Assertion[]): Promise<AssertionResult[]> {
  const results: AssertionResult[] = [];
  
  for (const assertion of assertions) {
    let result: AssertionResult = {
      kind: assertion.kind,
      passed: false
    };
    
    try {
      switch (assertion.kind) {
        case "text":
          if (assertion.expected) {
            const content = await page.content();
            result.passed = content.includes(assertion.expected);
            result.details = result.passed ? "Text found" : "Text not found";
          }
          break;
          
        case "element":
          if (assertion.selector) {
            const element = await page.$(assertion.selector);
            result.passed = element !== null;
            result.details = result.passed ? "Element exists" : "Element not found";
          }
          break;
          
        case "ocr":
        case "visual-diff":
        case "vlm-eval":
          result.details = "Deferred for inspection phase";
          result.passed = true;
          break;
      }
    } catch (error) {
      result.passed = false;
      result.details = error instanceof Error ? error.message : String(error);
    }
    
    results.push(result);
  }
  
  return results;
}

async function saveE2EResults(report: any) {
  await writeFile(
    '.artifacts/e2e-results.json',
    JSON.stringify(report, null, 2)
  );
  
  const stepsFile = {
    steps: report.results.map((r: StepResult) => ({
      ...r,
      assertions: r.assertions || []
    }))
  };
  
  await writeFile(
    '.artifacts/e2e-steps.json',
    JSON.stringify(stepsFile, null, 2)
  );
}