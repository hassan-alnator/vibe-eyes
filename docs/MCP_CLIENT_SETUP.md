# 🔌 MCP Client Configuration Guide

This guide shows how to connect the Eyes MCP server to various MCP-compatible clients.

## 📋 Prerequisites

1. **Install dependencies:**
```bash
cd eyes
pnpm install
```

2. **Build the TypeScript code:**
```bash
pnpm build
```

3. **Ensure Ollama is running (optional, for VLM features):**
```bash
# Install Ollama from https://ollama.ai
ollama pull llava:13b
```

---

## 🤖 Claude Desktop App Configuration

### macOS

1. Open Claude Desktop settings
2. Navigate to: **Settings → Developer → MCP Servers**
3. Edit the configuration file at: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
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

### Windows

Configuration file location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "eyes": {
      "command": "node",
      "args": ["--experimental-modules", "C:\\Users\\YOUR_USERNAME\\Downloads\\eyes\\dist\\index.js"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

### Linux

Configuration file location: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "eyes": {
      "command": "node",
      "args": ["--experimental-modules", "/home/YOUR_USERNAME/eyes/dist/index.js"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

After adding the configuration:
1. Restart Claude Desktop
2. Look for "eyes" in the MCP servers list (bottom of chat)
3. The server icon should show as connected (green)

---

## 💻 Claude Code (VS Code Extension) Configuration

### Method 1: Using settings.json

1. Open VS Code settings: `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
2. Search for "Claude Code MCP"
3. Click "Edit in settings.json"
4. Add:

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

### Method 2: Using the UI

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Claude Code: Configure MCP Servers"
3. Add a new server with:
   - Name: `eyes`
   - Command: `node`
   - Arguments: `--experimental-modules ./dist/index.js`
   - Working Directory: (path to eyes folder)

---

## 🐳 Docker Setup (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "--experimental-modules", "dist/index.js"]
```

Build and run:

```bash
docker build -t eyes-mcp .
docker run -p 3000:3000 eyes-mcp
```

Then configure your MCP client to connect to `http://localhost:3000`.

---

## 🧪 Testing Your Connection

Once configured, test the connection in your MCP client:

1. **Check server status:**
   - In Claude Desktop: Look for the server icon at the bottom
   - In Claude Code: Check the MCP panel in the sidebar

2. **Test a simple command:**
   ```
   Run the generate_unit_tests tool with targetPath: "./src"
   ```

3. **Verify response:**
   You should see a JSON response indicating success or listing generated test files.

---

## 🔧 Troubleshooting

### Server not connecting

1. **Check Node.js version:**
```bash
node --version  # Should be 18+ 
```

2. **Verify build output exists:**
```bash
ls -la dist/index.js
```

3. **Check server logs:**
```bash
# Run manually to see errors
node --experimental-modules dist/index.js
```

### "Tool not found" errors

1. Rebuild the project:
```bash
pnpm build
```

2. Restart your MCP client

### Ollama connection issues

1. Verify Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

2. Check if model is installed:
```bash
ollama list
```

---

## 📡 Alternative Connection Methods

### Using npx (without installation)

```json
{
  "mcpServers": {
    "eyes": {
      "command": "npx",
      "args": ["-y", "@your-org/eyes-mcp-server"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

### Using tsx (TypeScript execution)

```json
{
  "mcpServers": {
    "eyes": {
      "command": "npx",
      "args": ["tsx", "/path/to/eyes/src/index.ts"],
      "env": {
        "NODE_ENV": "development",
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

---

## 🌐 Environment Variables

All configuration options can be set via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_HOST` | Ollama API endpoint | `http://127.0.0.1:11434` |
| `SCREENSHOT_DIR` | Default screenshot directory | `.artifacts/screenshots` |
| `BASELINE_DIR` | Default baseline directory | `baselines` |
| `OCR_LANGUAGES` | Default OCR languages | `eng` |
| `VLM_MODEL` | Default VLM model | `llava:13b` |

---

## 📝 Example Usage in Claude

Once connected, you can use natural language to interact with the testing tools:

```
User: "Generate comprehensive unit tests for my React components"
Claude: I'll generate unit tests for your React components...
[Calls generate_unit_tests tool]

User: "Run E2E tests on my login page at localhost:3000"
Claude: I'll run E2E tests on your login page...
[Calls run_e2e tool with appropriate steps]

User: "Check if the screenshots match the baselines"
Claude: I'll inspect the screenshots and compare them with baselines...
[Calls inspect_screenshots tool]
```

---

## 🔐 Security Notes

1. The MCP server runs with the same permissions as your user account
2. It can read/write files in the project directory
3. For production use, consider running in a sandboxed environment
4. Never expose the MCP server directly to the internet

---

## 📚 Further Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Docs](https://claude.ai/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [Playwright Documentation](https://playwright.dev)

---

## 💡 Tips

1. **Start simple:** Test with basic unit test generation first
2. **Use local servers:** Run your test app locally for faster E2E testing
3. **Batch operations:** Chain multiple tools for comprehensive testing
4. **Review artifacts:** Always check `.artifacts/` folder for detailed results
5. **Update baselines:** Regularly update baseline images as your UI evolves