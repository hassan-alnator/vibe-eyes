# Eyes Testing Sub-Agent Setup Guide

## Quick Setup (Automatic)

The Eyes MCP Server comes with a pre-configured testing sub-agent located at `.claude/agents/eyes-tester.md`. This agent is automatically available when you use Claude Code in this project.

## How to Use the Sub-Agent

### 1. Automatic Invocation
After making code changes, Claude should automatically invoke the testing agent:

```markdown
Claude: "I'll now test these changes using the eyes-tester agent..."
[Launches Task with subagent_type="eyes-tester"]
```

### 2. Manual Invocation
You can explicitly request testing:

```markdown
You: "Test my recent changes"
Claude: Task(subagent_type="eyes-tester", prompt="Test the recent changes")
```

### 3. Direct Command
Use Claude's Task tool directly:

```javascript
Task({
  subagent_type: "eyes-tester",
  description: "Run comprehensive tests",
  prompt: "Test all components with visual regression"
})
```

## Default Settings

The eyes-tester sub-agent has these defaults:

- **Attended Mode**: `true` (browser attempts to open visibly)
- **Test Strategy**: Comprehensive (unit + E2E + visual)
- **Coverage Target**: 80% minimum
- **Visual Diff Threshold**: 5% maximum

## Customizing the Sub-Agent

### Option 1: Edit the Existing Agent

Edit `.claude/agents/eyes-tester.md` to modify behavior:

```yaml
---
name: eyes-tester
description: Your custom description
tools: mcp__eyes__generate_unit_tests, mcp__eyes__run_e2e, ...
model: sonnet  # or opus, haiku
---

Your custom system prompt here...
```

### Option 2: Create Additional Test Agents

Create specialized agents for different scenarios:

#### Quick Test Agent
`.claude/agents/quick-tester.md`:
```yaml
---
name: quick-tester
description: Fast smoke tests only
tools: mcp__eyes__run_unit_tests, Bash
model: haiku
---

You are a quick test runner. Only run essential smoke tests.
Always use headless mode for speed. Skip visual regression.
Target: Complete all tests in under 30 seconds.
```

#### Visual Test Agent
`.claude/agents/visual-tester.md`:
```yaml
---
name: visual-tester
description: Visual regression specialist
tools: mcp__eyes__run_e2e, mcp__eyes__inspect_screenshots
model: sonnet
---

You focus exclusively on visual testing and UI consistency.
Always use attended mode to show visual changes.
Capture screenshots of every view and compare with baselines.
```

## Testing Workflow Examples

### After UI Changes
```javascript
// Claude will automatically:
await Task({
  subagent_type: "eyes-tester",
  prompt: "Test the button component changes with visual regression"
})

// The agent will:
// 1. Generate unit tests for the button
// 2. Run E2E tests in attended mode (default)
// 3. Capture screenshots
// 4. Compare with baselines
// 5. Generate HTML report
```

### After Backend Changes
```javascript
// Claude will automatically:
await Task({
  subagent_type: "eyes-tester",
  prompt: "Test the API endpoint changes"
})

// The agent will:
// 1. Generate comprehensive unit tests
// 2. Run tests with coverage
// 3. Skip visual tests (no UI changes)
// 4. Report coverage metrics
```

### For Debugging
```javascript
// Explicitly request attended mode:
await Task({
  subagent_type: "eyes-tester",
  prompt: "Debug the failing login test in attended mode"
})

// The agent will:
// 1. Run tests with attendedMode: true
// 2. Slow down execution for visibility
// 3. Capture error screenshots
// 4. Provide detailed failure analysis
```

## Attended Mode Behavior

### Through MCP (Limited Visibility)
When the sub-agent runs E2E tests with `attendedMode: true`:
- Browser launches in non-headless mode
- Actions are slowed to 500ms intervals
- **BUT**: Browser may not appear on screen due to MCP service context

### Standalone Script (Full Visibility)
For guaranteed visible browser testing:
```bash
node run-attended-test.mjs
```
This bypasses MCP limitations and shows the browser window.

## Best Practices

### 1. Let Claude Be Proactive
Claude should automatically test after changes without being asked:
```markdown
Claude: "I've updated the login component. Let me test these changes..."
[Automatically invokes eyes-tester agent]
```

### 2. Use Attended Mode During Development
The default `attendedMode: true` helps with:
- Understanding test flow
- Debugging failures
- Demonstrating functionality

### 3. Switch to Headless for CI/CD
In production/CI environments, override the default:
```javascript
await mcp__eyes__run_e2e({
  attendedMode: false,  // Override default for CI/CD
  // ... rest of config
})
```

### 4. Chain Multiple Agents
For complex workflows:
```javascript
// First: Quick smoke test
await Task({ subagent_type: "quick-tester", prompt: "Run smoke tests" })

// Then: Full visual regression
await Task({ subagent_type: "visual-tester", prompt: "Check visual consistency" })

// Finally: Generate reports
await Task({ subagent_type: "eyes-tester", prompt: "Generate comprehensive report" })
```

## Troubleshooting

### Browser Doesn't Appear
- **Expected**: MCP servers run in background context
- **Solution**: Use `node run-attended-test.mjs` for visible browser

### Tests Run Too Slowly
- **Cause**: Attended mode adds 500ms delays
- **Solution**: Set `attendedMode: false` for faster execution

### Agent Not Found
- **Check**: File exists at `.claude/agents/eyes-tester.md`
- **Fix**: Restart Claude Code to reload agents

### Tests Not Running Automatically
- **Update CLAUDE.md**: Ensure it instructs Claude to be proactive
- **Explicit instruction**: Tell Claude to "always test after changes"

## Integration with Claude Code

### In Your CLAUDE.md File
Add these instructions for Claude:
```markdown
## Testing Requirements

IMPORTANT: After EVERY code change, automatically invoke the eyes-tester agent:

1. For UI changes: Test with visual regression
2. For logic changes: Test with unit tests and coverage
3. For config changes: Run smoke tests

Always use: Task(subagent_type="eyes-tester", prompt="Test [what changed]")

Default to attended mode for visibility during development.
```

### Project Structure
```
your-project/
├── .claude/
│   └── agents/
│       └── eyes-tester.md    # Main testing agent
├── .artifacts/               # Test results
│   ├── screenshots/
│   ├── baselines/
│   └── test-report.html
├── src/                     # Your source code
├── CLAUDE.md               # Instructions for Claude
└── run-attended-test.mjs   # Standalone visible test runner
```

## Summary

The Eyes testing sub-agent provides:
- ✅ **Automatic testing** after code changes
- ✅ **Attended mode by default** for better visibility
- ✅ **Comprehensive test coverage** (unit, E2E, visual)
- ✅ **Smart test selection** based on change type
- ✅ **HTML reports** with screenshots

Just make changes and watch Claude automatically test them!