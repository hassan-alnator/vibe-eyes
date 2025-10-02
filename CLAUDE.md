# Claude Code Testing Instructions with Eyes MCP Server

This project uses the Eyes MCP Server for automated testing with visual regression capabilities. A specialized sub-agent called `eyes-tester` is configured to automatically run tests after code changes.

## Automatic Testing with Sub-Agent

### IMPORTANT: Proactive Testing
After making any code changes, you should proactively launch the `eyes-tester` sub-agent to validate the changes:

```
Use the Task tool with subagent_type: "eyes-tester" to run comprehensive tests
```

The sub-agent will automatically:
1. Analyze what changed
2. Run appropriate tests (unit, E2E, visual)
3. Generate reports
4. Return a summary of results

### Example Usage After Code Changes

```markdown
After implementing a new feature or fixing a bug:
1. Complete the code changes
2. Launch the eyes-tester agent:
   Task(subagent_type="eyes-tester", description="Test recent changes",
        prompt="Test the changes made to [component/feature name]")
3. Review the test results
4. Fix any failing tests before marking the task complete
```

## Attended Mode (NEW!)

The E2E testing now supports **attended mode** where you can watch the browser perform tests in real-time. This is useful for:
- Debugging test failures
- Demonstrating functionality to stakeholders
- First-time test runs of new features
- Understanding test flow

### Using Attended Mode

```javascript
Tool: mcp__eyes__run_e2e
Arguments: {
  "baseUrl": "http://localhost:3000",
  "attendedMode": true,  // ← This shows the browser window
  "steps": [
    // Your test steps
  ]
}
```

When attended mode is active:
- Browser window opens visibly
- Actions are slowed down (500ms delay) for visibility
- You can watch each click, type, and navigation
- Screenshots are still captured normally

## Testing Strategies by Task Type

### 1. UI Component Changes
```
Always use the eyes-tester agent after UI changes:
- It will run tests in attended mode for first execution
- Visual regression tests will catch styling issues
- OCR validation ensures text is readable
```

### 2. Business Logic Changes
```
The eyes-tester agent will:
- Generate comprehensive unit tests
- Run tests with coverage reporting
- Skip visual tests unless UI is affected
```

### 3. Bug Fixes
```
After fixing a bug:
1. Write a test that reproduces the bug
2. Fix the bug
3. Launch eyes-tester to verify:
   - The specific test passes
   - No regression in other tests
```

## Quick Testing Commands

### Full Test Suite with Visual Feedback
```javascript
// Run this for comprehensive testing with browser visibility
Tool: mcp__eyes__run_e2e
Arguments: {
  "baseUrl": "http://localhost:3000",
  "attendedMode": true,
  "steps": [
    {"action": "navigate", "value": "/"},
    {"action": "screenshot", "name": "homepage"},
    {"action": "click", "selector": "#login"},
    {"action": "type", "selector": "#username", "value": "test@example.com"},
    {"action": "type", "selector": "#password", "value": "password123"},
    {"action": "click", "selector": "#submit"},
    {"action": "wait", "value": "2000"},
    {"action": "screenshot", "name": "dashboard",
     "assertions": [
       {"kind": "text", "expected": "Welcome"},
       {"kind": "ocr", "expected": "Dashboard"},
       {"kind": "visual-diff"}
     ]}
  ]
}
```

### Quick Unit Test Generation
```javascript
Tool: mcp__eyes__generate_unit_tests
Arguments: {
  "targetPath": "./src",
  "testStrategy": "comprehensive"
}
```

### Visual Regression Check
```javascript
Tool: mcp__eyes__inspect_screenshots
Arguments: {
  "screenshotDir": ".artifacts/screenshots",
  "baselineDir": ".artifacts/baselines",
  "ocrLanguages": ["eng"]
}
```

## Critical User Flows to Test

These should ALWAYS be tested after any significant change:

1. **Authentication Flow**
   - Login with valid credentials
   - Login with invalid credentials
   - Password reset
   - Logout

2. **Core Business Features**
   - Main user journey (specific to your app)
   - Data entry and validation
   - Search and filtering
   - Export/Import functionality

3. **Error Handling**
   - 404 pages
   - Network errors
   - Validation errors
   - Permission denied scenarios

## Performance Benchmarks

The eyes-tester agent enforces these standards:
- Page load: < 3 seconds
- Test execution: < 30 seconds for unit tests
- E2E test suite: < 2 minutes
- Visual diff: < 5% pixel difference
- Code coverage: > 80%

## Debugging Failed Tests

When tests fail in headless mode:

1. **Re-run in attended mode** to see what's happening:
```javascript
Tool: mcp__eyes__run_e2e
Arguments: {
  "baseUrl": "http://localhost:3000",
  "attendedMode": true,  // ← Enable visual debugging
  "steps": [/* failed test steps */]
}
```

2. **Check screenshots** in `.artifacts/screenshots/`
3. **Review HTML report** at `.artifacts/test-report.html`
4. **Examine error logs** in the test results

## Best Practices

### 1. Always Test After Changes
```
IMPORTANT: After ANY code change, use:
Task(subagent_type="eyes-tester", prompt="Test the recent changes to [specify what changed]")
```

### 2. Use Attended Mode Strategically
- First run of new features: `attendedMode: true`
- Debugging failures: `attendedMode: true`
- CI/CD pipeline: `attendedMode: false`
- Quick regression checks: `attendedMode: false`

### 3. Maintain Baselines
- Update baseline images only after visual changes are approved
- Keep baselines in version control
- Document when and why baselines change

### 4. Write Descriptive Test Names
```javascript
// Good
{"action": "screenshot", "name": "user-profile-after-edit"}

// Bad
{"action": "screenshot", "name": "screenshot1"}
```

## Integration with Development Workflow

### Pre-Commit Testing
Before committing code:
```
1. Save all changes
2. Launch: Task(subagent_type="eyes-tester", prompt="Run pre-commit tests")
3. Fix any failures
4. Commit only after all tests pass
```

### Post-Merge Testing
After merging branches:
```
1. Pull latest changes
2. Launch: Task(subagent_type="eyes-tester", prompt="Run full regression suite")
3. Update baselines if needed
```

## Environment Variables

For Ollama integration (optional AI vision testing):
```bash
export OLLAMA_HOST=http://127.0.0.1:11434
```

## Common Testing Patterns

### Form Validation Testing
```javascript
{
  "baseUrl": "http://localhost:3000",
  "attendedMode": true,
  "steps": [
    {"action": "navigate", "value": "/form"},
    {"action": "click", "selector": "#submit"},
    {"action": "screenshot", "name": "empty-form-errors",
     "assertions": [{"kind": "ocr", "expected": "Required field"}]},
    {"action": "type", "selector": "#email", "value": "invalid-email"},
    {"action": "click", "selector": "#submit"},
    {"action": "screenshot", "name": "invalid-email-error",
     "assertions": [{"kind": "ocr", "expected": "Valid email required"}]}
  ]
}
```

### Responsive Design Testing
```javascript
// Test at different viewport sizes
await page.setViewportSize({ width: 375, height: 667 });  // Mobile
await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
```

## Remember

**Every code change should trigger the eyes-tester agent.** This ensures:
- No regressions are introduced
- Visual consistency is maintained
- All user flows continue to work
- Performance benchmarks are met

Use attended mode liberally during development for better visibility into test execution!