# 🔌 Claude Code (VS Code) - MCP Setup Commands

## Quick Setup Commands

### Method 1: Command Palette (Recommended)

1. **Open Command Palette:**
   - Mac: `Cmd + Shift + P`
   - Windows/Linux: `Ctrl + Shift + P`

2. **Add MCP Server:**
   ```
   Type: Claude Code: Add MCP Server
   ```

3. **Enter Configuration:**
   - **Server Name:** `eyes`
   - **Command:** `node`
   - **Arguments:** `--experimental-modules /Users/YOUR_USERNAME/Downloads/eyes/dist/index.js`
   - **Working Directory:** `/Users/YOUR_USERNAME/Downloads/eyes`

### Method 2: Direct Settings Edit

1. **Open VS Code Settings:**
   ```bash
   # Mac/Linux
   code ~/.vscode/settings.json
   
   # Or via VS Code:
   Cmd+, (Mac) / Ctrl+, (Windows)
   # Then click the {} icon (Open Settings JSON)
   ```

2. **Add Configuration:**
   ```json
   {
     "claude-code.mcpServers": {
       "eyes": {
         "command": "node",
         "args": ["--experimental-modules", "/Users/YOUR_USERNAME/Downloads/eyes/dist/index.js"],
         "env": {
           "OLLAMA_HOST": "http://127.0.0.1:11434"
         }
       }
     }
   }
   ```

### Method 3: Workspace-Specific Configuration

For project-specific setup:

1. **Create workspace settings:**
   ```bash
   mkdir -p .vscode
   touch .vscode/settings.json
   ```

2. **Add configuration:**
   ```json
   {
     "claude-code.mcpServers": {
       "eyes": {
         "command": "node",
         "args": ["--experimental-modules", "${workspaceFolder}/eyes/dist/index.js"],
         "env": {
           "OLLAMA_HOST": "http://127.0.0.1:11434"
         }
       }
     }
   }
   ```

## Verify Connection

1. **Check MCP Panel:**
   - Open Claude Code sidebar
   - Look for "MCP Servers" section
   - "eyes" should show with green indicator

2. **Test in Claude Code:**
   ```
   Ask Claude: "List available MCP tools"
   
   Response should include:
   - generate_unit_tests
   - run_unit_tests
   - run_e2e
   - inspect_screenshots
   - consolidate_report
   ```

## Common Commands to Use

Once connected, use these in Claude Code:

### Basic Testing
```
"Generate unit tests for all files in src/"

"Run E2E test on localhost:8080 - test the login form"

"Take a screenshot and check if 'Welcome Back' text is visible"
```

### Advanced Testing
```
"Run the complete test suite from examples/test-scenarios.json"

"Compare current screenshots with baseline images for regression"

"Test Arabic language support - switch language and verify RTL layout"
```

### Reporting
```
"Generate a consolidated test report"

"Show me the test results summary"

"Check which tests failed and why"
```

## Troubleshooting

### "Server not found" Error
```bash
# Verify path exists
ls -la /Users/YOUR_USERNAME/Downloads/eyes/dist/index.js

# Rebuild if needed
cd /Users/YOUR_USERNAME/Downloads/eyes
pnpm build
```

### "Connection refused" Error
```bash
# Check Node version
node --version  # Should be v18+

# Test server directly
node --experimental-modules /path/to/eyes/dist/index.js
```

### Tools not appearing
1. Reload VS Code window: `Cmd+R` (Mac) / `Ctrl+R` (Windows)
2. Restart Claude Code extension
3. Check Output panel for errors: View → Output → Claude Code

## Alternative: Using NPX

If you published the package, you can use:

```json
{
  "claude-code.mcpServers": {
    "eyes": {
      "command": "npx",
      "args": ["-y", "eyes-mcp-server"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

## Tips

1. **Use absolute paths** for reliability
2. **Keep the server running** - it starts automatically when Claude Code connects
3. **Check .artifacts/** folder for test outputs
4. **Update baselines** when UI changes are intentional