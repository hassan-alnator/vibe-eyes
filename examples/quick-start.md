# 🚀 Quick Start Guide

## Step 1: Start the Example App

```bash
# In one terminal, start a simple HTTP server
cd example-app
python3 -m http.server 8080
# Or use Node.js: npx serve .
```

Visit http://localhost:8080/index.html to see the test app.

## Step 2: Build and Start MCP Server

```bash
# In another terminal
cd eyes
pnpm install
pnpm build
pnpm dev
```

## Step 3: Run Tests via MCP Client

### Option A: Using Claude Desktop

1. Configure Claude Desktop (see MCP_CLIENT_SETUP.md)
2. In Claude, say:
   ```
   Please run the E2E test scenario "login-validation" from 
   examples/test-scenarios.json on http://localhost:8080
   ```

### Option B: Direct Testing Commands

Use these commands in your MCP client:

#### 1. Test Form Validation
```json
{
  "tool": "run_e2e",
  "args": {
    "baseUrl": "http://localhost:8080",
    "steps": [
      {
        "action": "navigate",
        "value": "/index.html"
      },
      {
        "action": "click",
        "selector": "#login-button"
      },
      {
        "action": "screenshot",
        "name": "validation-errors",
        "assertions": [
          {
            "kind": "ocr",
            "expected": "Please enter a valid email"
          }
        ]
      }
    ]
  }
}
```

#### 2. Test Successful Login
```json
{
  "tool": "run_e2e",
  "args": {
    "baseUrl": "http://localhost:8080",
    "steps": [
      {
        "action": "navigate",
        "value": "/index.html"
      },
      {
        "action": "type",
        "selector": "#email",
        "value": "test@example.com"
      },
      {
        "action": "type",
        "selector": "#password",
        "value": "password123"
      },
      {
        "action": "click",
        "selector": "#login-button"
      },
      {
        "action": "wait",
        "value": "2500"
      },
      {
        "action": "screenshot",
        "name": "dashboard",
        "assertions": [
          {
            "kind": "ocr",
            "expected": "Dashboard"
          },
          {
            "kind": "vlm-eval",
            "prompt": "Is there a dashboard with 4 metric cards visible?",
            "passIf": "YES"
          }
        ]
      }
    ]
  }
}
```

#### 3. Inspect Screenshots
```json
{
  "tool": "inspect_screenshots",
  "args": {
    "screenshotDir": ".artifacts/screenshots",
    "ocrLanguages": ["eng"]
  }
}
```

#### 4. Get Report
```json
{
  "tool": "consolidate_report",
  "args": {
    "outputPath": "test-results.json"
  }
}
```

## Step 4: Review Results

Check the artifacts:
```bash
# View screenshots
ls -la .artifacts/screenshots/

# View test results
cat .artifacts/e2e-results.json | jq .

# View consolidated report
cat test-results.json | jq .
```

## Common Test Scenarios

### 1. Visual Regression Test
First run captures baseline, subsequent runs compare:
```bash
# First run - captures baseline
# Copy good screenshots to baselines/
cp .artifacts/screenshots/dashboard.png baselines/

# Second run - compares against baseline
# Will report pixel differences
```

### 2. Multi-language Test
```json
{
  "steps": [
    {
      "action": "click",
      "selector": "[data-lang='ar']"
    },
    {
      "action": "screenshot",
      "name": "arabic-ui",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "مرحبا",
          "languages": ["ara"]
        }
      ]
    }
  ]
}
```

### 3. Form Edge Cases
```json
{
  "steps": [
    {
      "action": "type",
      "selector": "#email",
      "value": "not@valid@email.com"
    },
    {
      "action": "screenshot",
      "name": "invalid-input",
      "assertions": [
        {
          "kind": "vlm-eval",
          "prompt": "Are form validation errors clearly visible?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

## Debugging Tips

1. **Screenshots not matching?**
   - Check `.artifacts/screenshots/` for actual images
   - Update baselines if UI changed intentionally

2. **OCR not finding text?**
   - Try different languages in `ocrLanguages`
   - Check screenshot quality
   - Text might be in an image/canvas element

3. **VLM checks failing?**
   - Ensure Ollama is running: `curl http://localhost:11434`
   - Try more specific prompts
   - Check if model is installed: `ollama list`

4. **E2E tests timing out?**
   - Increase wait times between actions
   - Check if selectors are correct
   - Ensure test app is running on correct port