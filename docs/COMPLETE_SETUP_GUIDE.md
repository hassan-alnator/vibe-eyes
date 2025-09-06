# 🎯 Eyes MCP Server - Complete Setup & Testing Guide

## 📦 Installation & Setup

### 1. Clone/Download the Project
```bash
cd ~/Downloads/eyes  # or your project directory
```

### 2. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 3. Build the Project
```bash
pnpm build
# This creates the dist/ folder with compiled JavaScript
```

### 4. (Optional) Install Ollama for AI Visual Testing
```bash
# macOS
brew install ollama
ollama serve  # Start Ollama server
ollama pull llava:13b  # Download vision model

# Linux/WSL
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
ollama pull llava:13b
```

---

## 🔌 Connect to MCP Clients

### Claude Desktop (macOS)

1. **Find config file:**
```bash
# Open in editor
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
# Or use nano/vim
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. **Add Eyes server configuration:**
```json
{
  "mcpServers": {
    "eyes": {
      "command": "node",
      "args": [
        "--experimental-modules",
        "/Users/YOUR_USERNAME/Downloads/eyes/dist/index.js"
      ],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

3. **Restart Claude Desktop**
   - Quit Claude completely (Cmd+Q)
   - Reopen Claude
   - Look for "eyes" in the server list (bottom of chat)

### Claude Desktop (Windows)

1. **Find config file:**
```powershell
notepad %APPDATA%\Claude\claude_desktop_config.json
```

2. **Add configuration:**
```json
{
  "mcpServers": {
    "eyes": {
      "command": "node",
      "args": [
        "--experimental-modules",
        "C:\\Users\\YOUR_USERNAME\\Downloads\\eyes\\dist\\index.js"
      ]
    }
  }
}
```

### VS Code - Claude Code Extension

1. **Open VS Code settings:**
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows)
   - Search for "claude code mcp"

2. **Edit settings.json:**
```json
{
  "claude-code.mcpServers": {
    "eyes": {
      "command": "node",
      "args": ["--experimental-modules", "./dist/index.js"],
      "cwd": "/path/to/eyes"
    }
  }
}
```

---

## 🧪 Test the Connection

### 1. Start Example App
```bash
# Terminal 1: Start the test application
cd ~/Downloads/eyes
pnpm serve:example
# Or manually: cd example-app && python3 -m http.server 8080
```

Visit http://localhost:8080 to verify it's running.

### 2. Test in Claude

Once connected, try these commands:

#### Simple Test
```
Can you test the login form at http://localhost:8080? 
Click the login button without filling fields and check 
if validation errors appear.
```

#### Full Test Suite
```
Please run the login-validation test scenario from 
examples/test-scenarios.json against http://localhost:8080
```

#### Visual Regression Test
```
Take a screenshot of http://localhost:8080, then compare 
it with the baseline image if one exists.
```

---

## 📝 Example Test Commands

### Direct Tool Usage

#### 1. Test Form Validation
```
Use the run_e2e tool with these parameters:
- baseUrl: "http://localhost:8080"
- steps: navigate to index.html, click #login-button, 
  screenshot with OCR check for "Please enter a valid email"
```

#### 2. Test Language Switching
```
Run E2E test: navigate to localhost:8080, click Arabic 
language button, verify "مرحبا بعودتك" appears using OCR
```

#### 3. Visual Regression
```
1. Take screenshots of the login and dashboard pages
2. Run inspect_screenshots to compare with baselines
3. Generate a consolidated report
```

---

## 🔍 Verify Installation

### Check Server is Working
```bash
# Test the server directly
node --experimental-modules dist/index.js
# Should output: "Eyes MCP Server running on stdio"
# Press Ctrl+C to stop
```

### Check Artifacts After Tests
```bash
# Screenshots captured
ls -la .artifacts/screenshots/

# Test results
cat .artifacts/e2e-results.json | head -20

# Consolidated report
cat .artifacts/consolidated-report.json | head -20
```

---

## 🐛 Troubleshooting

### "Server not connected" in Claude

1. **Check Node version:**
```bash
node --version  # Should be v18 or higher
```

2. **Verify build:**
```bash
ls dist/index.js  # File should exist
```

3. **Check path in config:**
```bash
# Get full path
pwd  # Copy this path
# Update claude_desktop_config.json with full path
```

4. **Restart Claude Desktop completely**

### "Tool not found" errors

1. **Rebuild:**
```bash
pnpm build
```

2. **Check tools are exported:**
```bash
grep "generate_unit_tests" dist/index.js
```

### Ollama connection issues

1. **Check Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

2. **Install vision model:**
```bash
ollama pull llava:13b
```

### Screenshots not working

1. **Install Playwright browsers:**
```bash
npx playwright install chromium
```

2. **Check permissions:**
```bash
# macOS may require screen recording permission
# System Preferences > Security & Privacy > Screen Recording
```

---

## 📂 Project Structure
```
eyes/
├── src/                    # TypeScript source
│   ├── index.ts           # MCP server entry
│   ├── tools/             # Testing tools
│   └── utils/             # Helper utilities
├── dist/                  # Compiled JavaScript
├── example-app/           # Test application
│   └── index.html        # Login/dashboard demo
├── examples/              # Test scenarios
│   └── test-scenarios.json
├── baselines/             # Baseline images
└── .artifacts/            # Test outputs
    ├── screenshots/
    └── *.json            # Test results
```

---

## 🎯 Quick Test Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Project built (`pnpm build`)
- [ ] Example app running (http://localhost:8080)
- [ ] MCP client configured (Claude/VS Code)
- [ ] Server shows as connected in client
- [ ] Can run a simple E2E test
- [ ] Screenshots are captured
- [ ] Reports are generated

---

## 💡 Pro Tips

1. **First Time Setup:**
   - Run a simple test first to verify connection
   - Create baselines from good screenshots
   - Test each tool individually before chaining

2. **Debugging:**
   - Check `.artifacts/` folder for outputs
   - Run server manually to see errors
   - Use simple selectors (#id, .class)

3. **Performance:**
   - Run Ollama locally for faster VLM checks
   - Use OCR for text, VLM for layout
   - Batch similar tests together

---

## 📚 Next Steps

1. **Create Custom Tests:**
   - Edit `examples/test-scenarios.json`
   - Add your own test steps
   - Define custom assertions

2. **Integrate with CI/CD:**
   - Use the server in GitHub Actions
   - Automate visual regression checks
   - Generate reports on PR

3. **Extend Functionality:**
   - Add new assertion types
   - Integrate other AI models
   - Create custom tools

---

## 🆘 Getting Help

- Check example scenarios in `examples/`
- Review test outputs in `.artifacts/`
- Run tools individually to isolate issues
- Ensure all prerequisites are installed

---

**Ready to test!** Start with the example app and try the test scenarios. The framework will capture screenshots, run OCR, compare with baselines, and generate comprehensive reports. 🚀