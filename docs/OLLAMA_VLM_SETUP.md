# Ollama Vision Model Integration (Optional)

The Eyes MCP Server includes optional support for AI-powered visual evaluation using Ollama's vision models. This feature allows qualitative assessment of screenshots beyond simple text extraction or pixel comparison.

## What is VLM (Vision Language Model)?

VLMs can understand images and answer questions about them in natural language. This enables tests like:
- "Is the login button clearly visible?"
- "Does the dashboard look complete with all widgets?"
- "Is the error message prominently displayed?"
- "Are there any overlapping elements?"

## Current Status

**The VLM feature is implemented but OPTIONAL:**
- The code is present in `src/utils/ollama.ts`
- It's used when assertions include `kind: "vlm-eval"`
- If Ollama is not running, these assertions are skipped or fail gracefully
- All other testing features work without Ollama

## Setup Instructions

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

### 2. Start Ollama Server

```bash
ollama serve
# Runs on http://localhost:11434 by default
```

### 3. Download a Vision Model

```bash
# Recommended models for visual testing:
ollama pull llava:13b    # Best accuracy, 7.4GB
ollama pull llava:7b     # Faster, 4.5GB  
ollama pull bakllava     # Good for text-heavy UIs
ollama pull moondream    # Smallest, 1.6GB
```

### 4. Verify Installation

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# List installed models
ollama list
```

## Using VLM in Tests

### Example VLM Assertion

```javascript
{
  "action": "screenshot",
  "name": "dashboard-complete",
  "assertions": [
    {
      "kind": "vlm-eval",
      "prompt": "Does this dashboard show a header, navigation menu, and at least 3 data cards?",
      "passIf": "YES",
      "model": "llava:13b"  // Optional, defaults to llava:13b
    }
  ]
}
```

### How It Works

1. **Screenshot is captured** by Playwright
2. **Image is sent to Ollama** as base64
3. **Model evaluates the prompt** against the image
4. **Response is checked** against `passIf` condition
5. **Test passes or fails** based on match

### Available Models and Use Cases

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| llava:13b | 7.4GB | General UI testing, complex layouts | Slow |
| llava:7b | 4.5GB | Balanced performance | Medium |
| bakllava | 4.5GB | Text-heavy interfaces, forms | Medium |
| moondream | 1.6GB | Quick visual checks | Fast |

## Example Test Scenarios

### 1. Layout Completeness
```json
{
  "kind": "vlm-eval",
  "prompt": "Is there a navigation bar at the top with at least 4 menu items?",
  "passIf": "YES"
}
```

### 2. Visual Hierarchy
```json
{
  "kind": "vlm-eval",
  "prompt": "Is the 'Sign Up' button more prominent than the 'Sign In' link?",
  "passIf": "YES"
}
```

### 3. Error State Visibility
```json
{
  "kind": "vlm-eval",
  "prompt": "Are there red error messages visible on the form?",
  "passIf": "YES"
}
```

### 4. Content Presence
```json
{
  "kind": "vlm-eval",
  "prompt": "Does the page show a product grid with prices?",
  "passIf": "YES"
}
```

### 5. Responsive Design
```json
{
  "kind": "vlm-eval",
  "prompt": "Is the layout optimized for mobile with a hamburger menu?",
  "passIf": "YES"
}
```

## When to Use VLM vs OCR

### Use OCR When:
- You need to verify exact text ("Total: $99.99")
- Text must match precisely
- Testing data accuracy
- Checking form values
- Validating numbers/codes

### Use VLM When:
- Evaluating overall layout
- Checking visual design
- Assessing user experience
- Verifying element relationships
- Testing "looks good" criteria

### Use Both When:
- Complete UI validation
- Critical user flows
- Post-deployment verification

## Performance Considerations

### Resource Usage
- VLM models use significant RAM (2-8GB)
- GPU acceleration recommended for speed
- CPU-only mode works but is slower

### Execution Time
- llava:13b - 5-10 seconds per evaluation
- llava:7b - 3-5 seconds per evaluation
- moondream - 1-2 seconds per evaluation

### Best Practices
1. Use VLM sparingly for critical checks
2. Combine with faster OCR/DOM checks
3. Run VLM tests in separate suite
4. Cache model in memory between tests

## Troubleshooting

### "Cannot connect to Ollama"
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Check connection
curl http://localhost:11434/api/tags
```

### "Model not found"
```bash
# Install the model
ollama pull llava:13b

# Verify installation
ollama list
```

### Slow Performance
```bash
# Use smaller model
ollama pull moondream

# Or run Ollama with GPU
OLLAMA_CUDA_VISIBLE_DEVICES=0 ollama serve
```

## Environment Variables

```bash
# Custom Ollama host (default: http://127.0.0.1:11434)
export OLLAMA_HOST=http://192.168.1.100:11434

# When adding MCP server
claude mcp add eyes node $(pwd)/dist/index.js \
  -e OLLAMA_HOST=http://localhost:11434
```

## Without Ollama

**The Eyes MCP Server works perfectly without Ollama:**
- All other features remain functional
- OCR text extraction still works
- Visual regression testing still works
- Unit test generation still works
- E2E testing still works

VLM is an optional enhancement for teams that need qualitative visual assessment beyond pixel-perfect comparison and text extraction.

## Real-World Example

From actual test results, when VLM assertions are included but Ollama is not running:

```json
{
  "screenshot": "dashboard.png",
  "checks": [
    {
      "type": "ocr",
      "passed": true,
      "details": "Text 'Dashboard' found"
    },
    {
      "type": "vlm-eval",
      "passed": false,
      "details": "Cannot connect to Ollama. Please ensure Ollama is running at http://127.0.0.1:11434"
    }
  ]
}
```

The test continues and OCR checks still work, only the VLM evaluation fails gracefully.