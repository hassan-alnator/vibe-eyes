# How Eyes MCP Server Works

## Overview

The Eyes MCP Server is a collection of testing tools that Claude (or other MCP clients) can call to perform automated testing. It does NOT generate test code for you to run later - instead, it directly executes tests and returns results.

## The MCP Tool Model

When you connect the Eyes MCP server to Claude, you're giving Claude access to these tools:

1. **generate_unit_tests** - Creates Vitest test files
2. **run_unit_tests** - Executes existing Vitest tests
3. **run_e2e** - Performs browser automation testing
4. **inspect_screenshots** - Analyzes images with OCR
5. **consolidate_report** - Combines all test results
6. **generate_html_report** - Creates visual reports

## How Claude Uses These Tools

### Example 1: Testing a Login Form

When you tell Claude: "Test my login form at localhost:3000"

Claude will:
```
1. Call the run_e2e tool with parameters:
   - baseUrl: "http://localhost:3000"
   - steps: [navigate, type email, type password, click submit, screenshot]

2. The MCP server executes these steps using Playwright

3. Returns results to Claude

4. Claude reports: "Login form tested successfully. Screenshot captured."
```

### Example 2: Generating Unit Tests

When you tell Claude: "Generate unit tests for my utils folder"

Claude will:
```
1. Call generate_unit_tests tool with:
   - targetPath: "./utils"
   - testStrategy: "comprehensive"

2. The MCP server creates test files in ./utils/__tests__/

3. Returns list of generated files

4. Claude reports: "Generated 5 test files with 32 test cases"
```

## What the MCP Server Actually Does

### It EXECUTES Tests
- Launches real browsers using Playwright
- Takes actual screenshots
- Runs OCR on real images
- Compares real pixels for visual regression

### It GENERATES Test Files
- Creates Vitest test files based on your code structure
- These are real files written to your disk
- You can run them later with `npm test`

### It Does NOT
- Generate test scripts for you to copy/paste
- Provide test code snippets
- Create abstract test plans

## Complete Testing Flow

Here's what happens when Claude runs a full test suite:

```mermaid
Claude receives request: "Test my app"
    ↓
Claude calls generate_unit_tests tool
    ↓
MCP server creates .test.ts files
    ↓
Claude calls run_unit_tests tool
    ↓
MCP server executes tests, returns results
    ↓
Claude calls run_e2e tool with test steps
    ↓
MCP server launches browser, performs actions
    ↓
Claude calls inspect_screenshots tool
    ↓
MCP server runs OCR and visual comparison
    ↓
Claude calls consolidate_report tool
    ↓
MCP server aggregates all results
    ↓
Claude reports final status to user
```

## Understanding Tool Parameters

### run_e2e Tool

This tool takes a complete test scenario as input:

```javascript
// What Claude sends to the MCP server:
{
  "tool": "run_e2e",
  "arguments": {
    "baseUrl": "http://localhost:3000",
    "steps": [
      {
        "action": "navigate",
        "value": "/login"
      },
      {
        "action": "type",
        "selector": "#email",
        "value": "test@example.com"
      },
      {
        "action": "click",
        "selector": "#submit"
      }
    ]
  }
}

// What the MCP server does:
1. Opens Chromium browser
2. Navigates to http://localhost:3000/login
3. Types "test@example.com" into #email field
4. Clicks the #submit button
5. Returns success/failure with screenshots
```

### generate_unit_tests Tool

```javascript
// What Claude sends:
{
  "tool": "generate_unit_tests",
  "arguments": {
    "targetPath": "./src/utils",
    "testStrategy": "comprehensive"
  }
}

// What happens:
1. MCP server reads all .ts/.js files in ./src/utils
2. Analyzes functions and classes
3. Creates test files in ./src/utils/__tests__/
4. Returns list of created files
```

## Real Execution, Real Results

When the MCP server runs tests, it's performing real actions:

### Real Browser Automation
```javascript
// This actually happens on your machine:
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'screenshot.png' });
```

### Real OCR Processing
```javascript
// Tesseract.js actually reads your screenshots:
const worker = await Tesseract.createWorker();
const { data: { text } } = await worker.recognize('screenshot.png');
// Returns: "Welcome to My App"
```

### Real File Generation
```javascript
// Files are actually written to disk:
await writeFile('./src/utils/__tests__/helper.test.ts', testContent);
// You can open and edit these files
```

## Common Misconceptions

### Misconception 1: "It generates test code to copy"
**Reality**: It executes tests directly and generates test files on disk.

### Misconception 2: "It just provides test templates"
**Reality**: It creates complete, runnable test files and executes actual browser tests.

### Misconception 3: "Claude writes the test code"
**Reality**: Claude calls MCP tools with parameters; the MCP server does the actual work.

## Practical Examples

### Testing a React Component

```
You: "Test my Button component"

Claude's Actions:
1. generate_unit_tests({ targetPath: "./src/components/Button.tsx" })
   → Creates Button.test.tsx with real test cases

2. run_unit_tests({ testPath: "./src/components/__tests__/Button.test.tsx" })
   → Executes the tests, returns pass/fail

3. run_e2e({ steps: [navigate, click button, screenshot] })
   → Opens browser, clicks actual button, takes screenshot
```

### Validating a Form

```
You: "Check if my contact form shows errors"

Claude's Actions:
1. run_e2e({
     baseUrl: "http://localhost:3000",
     steps: [
       { action: "navigate", value: "/contact" },
       { action: "click", selector: "#submit" },
       { action: "screenshot", name: "empty-form-errors" }
     ]
   })
   → Browser opens, clicks submit without filling form

2. inspect_screenshots({ screenshotDir: ".artifacts/screenshots" })
   → OCR reads error messages from screenshot
   → Returns: "Found text: 'Email is required'"
```

## The Power of MCP

The MCP architecture means:

1. **Claude doesn't need to know implementation details** - It just calls tools
2. **Tests run in your actual environment** - Real browsers, real files
3. **Results are immediate and real** - Not simulated or mocked
4. **Works with any application** - Framework agnostic

## Summary

The Eyes MCP Server is an execution engine, not a code generator. When Claude "tests your app", it's orchestrating real tools that perform real actions on your real application, returning real results that you can see in screenshots, test files, and reports.

Think of it as giving Claude the ability to be a QA engineer who can:
- Click through your app
- Take screenshots
- Read text from images
- Compare visual changes
- Write test files
- Run test suites

All automatically, based on your natural language requests.