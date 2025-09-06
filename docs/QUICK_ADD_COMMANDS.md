# 🚀 Quick Add Commands for Eyes MCP Server

## For Claude Desktop

### Using `claude` CLI (Working Command)

```bash
# 1. First, build the project
cd ~/Downloads/eyes
pnpm install
pnpm build

# 2. Add the MCP server to Claude Desktop
claude mcp add eyes node $(pwd)/dist/index.js

# Or with full absolute path:
claude mcp add eyes node /Users/$(whoami)/Downloads/eyes/dist/index.js

# With environment variables:
claude mcp add eyes node $(pwd)/dist/index.js \
  -e OLLAMA_HOST=http://127.0.0.1:11434

# 3. Restart Claude Desktop
```

### Alternative: Direct Node Execution

```bash
# If you prefer direct node execution:
claude mcp add eyes "node" "$(pwd)/dist/index.js"

# Or with tsx for TypeScript:
claude mcp add eyes "npx" "tsx" "$(pwd)/src/index.ts"
```

### One-Line Setup (macOS/Linux)

```bash
# Complete setup in one command:
cd ~/Downloads/eyes && \
pnpm install && \
pnpm build && \
claude mcp add eyes node $(pwd)/dist/index.js && \
echo "✅ Eyes MCP server added! Please restart Claude Desktop."
```

### One-Line Setup (Windows PowerShell)

```powershell
# Complete setup in one command:
cd $HOME\Downloads\eyes; `
pnpm install; `
pnpm build; `
claude mcp add "$PWD\dist\index.js" --name eyes; `
Write-Host "✅ Eyes MCP server added! Please restart Claude Desktop."
```

## For Claude Code (VS Code)

### Using Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Claude Code: Add MCP Server`
3. Fill in:
   ```
   Name: eyes
   Command: node
   Arguments: --experimental-modules /Users/YOUR_USERNAME/Downloads/eyes/dist/index.js
   ```

### Using CLI to Edit Settings

```bash
# macOS/Linux - Add to VS Code settings
echo '{
  "claude-code.mcpServers": {
    "eyes": {
      "command": "node",
      "args": ["--experimental-modules", "'$(pwd)'/dist/index.js"],
      "env": {"OLLAMA_HOST": "http://127.0.0.1:11434"}
    }
  }
}' >> ~/.vscode/settings.json
```

## Verify Installation

### Check if server was added:

```bash
# For Claude Desktop - Check config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | grep eyes

# For Windows
type %APPDATA%\Claude\claude_desktop_config.json | findstr eyes
```

### Test the connection:

1. Restart Claude Desktop or reload VS Code
2. In Claude, type: `"List available MCP tools"`
3. You should see:
   - generate_unit_tests
   - run_unit_tests
   - run_e2e
   - inspect_screenshots
   - consolidate_report

## Quick Test

After adding the server:

```bash
# 1. Start the example app
cd ~/Downloads/eyes
pnpm serve:example

# 2. In Claude, ask:
# "Run the login-validation test from examples/test-scenarios.json on localhost:8080"
```

## Remove/Update Server

### Remove server:
```bash
claude mcp remove eyes
```

### Update server:
```bash
claude mcp update eyes --path ~/Downloads/eyes/dist/index.js
```

### List all servers:
```bash
claude mcp list
```

## Troubleshooting

If `claude` command not found:

```bash
# Option 1: Install Claude CLI globally
npm install -g @claude/cli

# Option 2: Use npx instead
npx -y @claude/mcp-cli add ~/Downloads/eyes/dist/index.js --name eyes

# Option 3: Edit config manually
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add this JSON manually:
```json
{
  "mcpServers": {
    "eyes": {
      "command": "node",
      "args": ["--experimental-modules", "/absolute/path/to/eyes/dist/index.js"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

## Docker Alternative

```bash
# Build and run in Docker
docker build -t eyes-mcp .
docker run -d --name eyes-server -p 3000:3000 eyes-mcp

# Add to Claude
claude mcp add http://localhost:3000 --name eyes --type http
```