# Attended Mode Test Example

This example demonstrates how to use the attended mode feature with Eyes MCP Server.

## Setup

1. First, start a local web server to serve the test page:
```bash
cd example-app
python3 -m http.server 8080
```

2. Then run this test with attended mode enabled to see the browser in action:

## Test Script

```javascript
// Using Eyes MCP Server tools with attended mode
await mcp__eyes__run_e2e({
  baseUrl: "http://localhost:8080",
  attendedMode: true, // This makes the browser visible!
  steps: [
    // Navigate to the demo page
    {
      action: "navigate",
      value: "/test-attended.html"
    },

    // Take initial screenshot
    {
      action: "screenshot",
      name: "initial-page-load"
    },

    // Test button interaction
    {
      action: "click",
      selector: "#demo-button"
    },

    // Wait for animation
    {
      action: "wait",
      value: "1000"
    },

    // Capture the success message
    {
      action: "screenshot",
      name: "button-clicked",
      assertions: [
        {
          kind: "text",
          expected: "Button clicked successfully!"
        },
        {
          kind: "ocr",
          expected: "attended mode"
        }
      ]
    },

    // Test form validation
    {
      action: "type",
      selector: "#username",
      value: "testuser"
    },

    {
      action: "type",
      selector: "#email",
      value: "test@example.com"
    },

    {
      action: "click",
      selector: "button[type='submit']"
    },

    {
      action: "wait",
      value: "500"
    },

    {
      action: "screenshot",
      name: "form-submitted",
      assertions: [
        {
          kind: "text",
          expected: "Form submitted!"
        }
      ]
    },

    // Test dynamic content loading
    {
      action: "click",
      selector: "button[onclick='loadDynamicContent()']"
    },

    {
      action: "wait",
      value: "1000"
    },

    {
      action: "screenshot",
      name: "dynamic-content",
      assertions: [
        {
          kind: "ocr",
          expected: "Dynamic Content Loaded"
        },
        {
          kind: "visual-diff"
        }
      ]
    }
  ]
});

// After E2E tests, inspect the screenshots
await mcp__eyes__inspect_screenshots({
  screenshotDir: ".artifacts/screenshots",
  baselineDir: ".artifacts/baselines"
});

// Generate a comprehensive report
await mcp__eyes__consolidate_report();
await mcp__eyes__generate_html_report();
```

## What You'll See in Attended Mode

When you run this test with `attendedMode: true`, you'll see:

1. **Browser Window Opens**: A Chromium browser window appears on your screen
2. **Slowed Actions**: Each action has a 500ms delay so you can see what's happening
3. **Real-time Interaction**: Watch as the test:
   - Clicks buttons
   - Types in form fields
   - Takes screenshots
   - Navigates through the application
4. **Visual Feedback**: See the actual UI responses and animations

## Benefits of Attended Mode

1. **Debugging**: Easily identify why tests fail by watching them execute
2. **Demonstration**: Show stakeholders test coverage in real-time
3. **Development**: Verify test steps are correct during test creation
4. **Learning**: Understand what the automated tests are actually doing

## Switching Between Modes

### Development (Attended Mode)
```javascript
{
  attendedMode: true  // See everything
}
```

### CI/CD Pipeline (Headless Mode)
```javascript
{
  attendedMode: false  // Or omit the parameter
}
```

## Tips

- Use attended mode for the first run of new test suites
- Switch to headless mode once tests are stable
- Enable attended mode when debugging failures
- Keep attended mode off in CI/CD pipelines for better performance