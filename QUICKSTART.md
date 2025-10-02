# Eyes MCP Server - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install
```bash
cd ~/Downloads/eyes
pnpm install
pnpm build
npx playwright install chromium
```

### Step 2: Add to Claude
```bash
claude mcp add eyes node $(pwd)/dist/index.js
```

### Step 3: Test It!
Open any project in Claude Code and say:
> "Test my application using the eyes-tester agent"

## 🎯 What You Get

### Automatic Testing Sub-Agent
- **Pre-configured** at `.claude/agents/eyes-tester.md`
- **Runs automatically** after you make code changes
- **Attended mode by default** - attempts to show browser window
- **Smart test selection** - picks appropriate tests based on changes

### Testing Capabilities
1. **Unit Tests** - Auto-generated with Vitest
2. **E2E Tests** - Browser automation with Playwright
3. **Visual Regression** - Screenshot comparison
4. **OCR Validation** - Text extraction from images
5. **HTML Reports** - Beautiful test results

## 💡 Common Usage Patterns

### After Making UI Changes
```markdown
You: "I updated the login button style"
Claude: "I'll test these changes with the eyes-tester agent..."
[Automatically runs visual regression tests]
```

### Testing a Specific Feature
```javascript
// Claude runs:
Task(subagent_type="eyes-tester", prompt="Test the shopping cart functionality")
```

### Debugging Failed Tests
```javascript
// Request attended mode explicitly:
Task(subagent_type="eyes-tester", prompt="Debug the checkout test with visible browser")
```

## 👁️ Attended Mode (See Tests Run!)

### Default Behavior
Tests run with `attendedMode: true` by default, which:
- Attempts to open a visible browser window
- Slows actions by 500ms for visibility
- Makes debugging much easier

### Important Note
Due to MCP server limitations, the browser may run in background. To guarantee a visible browser:

```bash
# Run this standalone script:
node run-attended-test.mjs
```

## 📊 Example Test Flow

```javascript
// 1. Generate tests for your components
await mcp__eyes__generate_unit_tests({
  targetPath: "./src/components",
  testStrategy: "comprehensive"
})

// 2. Run E2E tests with browser automation
await mcp__eyes__run_e2e({
  baseUrl: "http://localhost:3000",
  attendedMode: true,  // See the browser! (default)
  steps: [
    { action: "navigate", value: "/" },
    { action: "click", selector: "#login" },
    { action: "type", selector: "#email", value: "test@example.com" },
    { action: "screenshot", name: "login-form" }
  ]
})

// 3. Check visual regression
await mcp__eyes__inspect_screenshots({
  screenshotDir: ".artifacts/screenshots",
  baselineDir: ".artifacts/baselines"
})

// 4. Generate report
await mcp__eyes__generate_html_report()
```

## 🎨 Visual Testing Example

```javascript
// Take screenshots and compare with baselines
{
  action: "screenshot",
  name: "homepage",
  assertions: [
    { kind: "visual-diff" },        // Compare with baseline
    { kind: "ocr", expected: "Welcome" },  // Extract text
    { kind: "text", expected: "Login" }    // Check DOM text
  ]
}
```

## 🔧 Customization

### Change Default Behavior
Edit `.claude/agents/eyes-tester.md` to customize:
- Test strategies
- Attended mode settings
- Coverage thresholds
- Report formats

### Create Specialized Agents
Add custom agents in `.claude/agents/`:
- `quick-tester.md` - Fast smoke tests
- `visual-tester.md` - Visual regression focus
- `perf-tester.md` - Performance testing

## 📁 Project Structure After Setup

```
your-project/
├── .claude/
│   └── agents/
│       └── eyes-tester.md    # Auto-testing agent
├── .artifacts/
│   ├── screenshots/          # Captured screenshots
│   ├── baselines/           # Baseline images
│   └── test-report.html    # Test results
├── CLAUDE.md               # Instructions for Claude
└── run-attended-test.mjs  # Standalone browser test
```

## 🎯 Best Practices

1. **Let Claude be proactive** - It should test automatically
2. **Use attended mode during development** - Better visibility
3. **Switch to headless for CI/CD** - Faster execution
4. **Review HTML reports** - Comprehensive results with screenshots
5. **Update baselines carefully** - Only after visual changes are approved

## 🚨 Troubleshooting

### Browser doesn't appear?
- **Expected**: MCP runs in background
- **Fix**: Use `node run-attended-test.mjs`

### Tests running slowly?
- **Cause**: Attended mode adds delays
- **Fix**: Set `attendedMode: false`

### Agent not working?
- **Check**: `.claude/agents/eyes-tester.md` exists
- **Fix**: Restart Claude Code

## 🎉 Ready to Test!

You're all set! Just:
1. Make code changes
2. Watch Claude automatically test them
3. Review the beautiful HTML reports

The Eyes MCP Server makes testing visual, automatic, and enjoyable!