# CLAUDE.md Template for Your Projects

This template helps you create a CLAUDE.md file that instructs Claude Code how to use the Eyes MCP Server to test your application. Copy this template to your project root and customize it.

## Template Structure

```markdown
# Testing Configuration for Claude Code

This project uses the Eyes MCP Server for automated testing. Follow these guidelines when validating code changes.

## MCP Server Connection

Ensure the Eyes MCP server is connected:
- Check MCP panel shows "eyes" as connected
- If not connected, run: claude mcp add eyes node /path/to/eyes/dist/index.js

## Project-Specific Configuration

### Application Details
- **Development URL**: http://localhost:3000
- **Test Environment**: http://localhost:3001
- **Production URL**: https://your-app.com

### Key Selectors
Update these selectors based on your application:
- Login form: #login-form
- Email input: #email
- Password input: #password
- Submit button: .submit-btn
- Navigation menu: .nav-menu
- Main content: #main-content

## Automated Testing Protocol

### On Every Code Change

When files in src/ are modified, automatically:

1. **Generate and run unit tests**
   \`\`\`
   Tool: generate_unit_tests
   Args: {
     "targetPath": "./src",
     "testStrategy": "comprehensive"
   }
   
   Tool: run_unit_tests
   Args: {
     "coverage": true
   }
   \`\`\`
   
   Requirement: Coverage must be > 80%

2. **Run E2E tests for affected features**
   \`\`\`
   Tool: run_e2e
   Args: {
     "baseUrl": "http://localhost:3000",
     "steps": [
       {
         "action": "navigate",
         "value": "/"
       },
       {
         "action": "screenshot",
         "name": "homepage-current"
       }
     ]
   }
   \`\`\`

3. **Check for visual regressions**
   \`\`\`
   Tool: inspect_screenshots
   Args: {
     "screenshotDir": ".artifacts/screenshots",
     "baselineDir": "baselines"
   }
   \`\`\`

4. **Generate test report**
   \`\`\`
   Tool: consolidate_report
   Tool: generate_html_report
   \`\`\`

### Testing Specific Features

#### Authentication Flow
\`\`\`json
{
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "action": "navigate",
      "value": "/login"
    },
    {
      "action": "type",
      "selector": "#email",
      "value": "test@example.com"
    },
    {
      "action": "type",
      "selector": "#password",
      "value": "TestPassword123"
    },
    {
      "action": "click",
      "selector": ".submit-btn"
    },
    {
      "action": "wait",
      "value": "2000"
    },
    {
      "action": "screenshot",
      "name": "after-login",
      "assertions": [
        {
          "kind": "text",
          "expected": "Dashboard"
        }
      ]
    }
  ]
}
\`\`\`

#### Form Validation
\`\`\`json
{
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "action": "navigate",
      "value": "/contact"
    },
    {
      "action": "click",
      "selector": "#submit",
      "retries": 2
    },
    {
      "action": "screenshot",
      "name": "form-errors",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "required"
        }
      ]
    }
  ]
}
\`\`\`

#### Dropdown Interactions
\`\`\`json
{
  "action": "select",
  "selector": "#country-select",
  "value": "US"
}
\`\`\`

## Test Data

### Valid Test Accounts
- Email: test@example.com
- Password: TestPassword123

### Invalid Test Data
- Email: invalid-email
- Password: short

## Performance Benchmarks

These thresholds trigger test failures:
- Page load time: > 3 seconds
- API response time: > 1 second  
- Test suite execution: > 60 seconds
- Visual diff: > 5% pixel difference

## Critical Paths to Test

Always test these user journeys:

1. **New User Registration**
   - Navigate to signup
   - Fill form with valid data
   - Submit and verify success
   - Check welcome email (if applicable)

2. **Purchase Flow** (if e-commerce)
   - Add item to cart
   - Proceed to checkout
   - Enter payment details
   - Verify order confirmation

3. **Data Management**
   - Create new record
   - Edit existing record
   - Delete record
   - Verify data persistence

## Error Handling

When tests fail:

1. Check `.artifacts/screenshots/` for visual evidence
2. Review `.artifacts/e2e-results.json` for step details
3. If selector not found, verify element exists in current build
4. If timeout, increase timeout or add retry:
   \`\`\`json
   {
     "action": "click",
     "selector": ".dynamic-element",
     "retries": 3,
     "timeout": 10000
   }
   \`\`\`

## Baseline Management

### Creating New Baselines
When UI intentionally changes:
1. Run tests to capture new screenshots
2. Review screenshots in `.artifacts/screenshots/`
3. Copy approved screenshots to `baselines/`
4. Commit baseline changes with UI updates

### Ignoring Dynamic Content
For timestamps or random data:
- Use data-testid attributes for stable selectors
- Mock dynamic data in test environment
- Focus OCR checks on static text

## Reporting

After test execution, always:
1. Generate HTML report for visual review
2. Include test summary in PR/commit message
3. Flag any failures that need investigation

Example commit message:
\`\`\`
feat: Add user profile page

Tests: 98% pass rate (47/48 passed)
- Unit tests: 100% (20/20)
- E2E tests: 96% (27/28) 
- Visual regression: No changes detected
- Coverage: 85%

Failed: Timeout on profile image upload test
\`\`\`

## Continuous Testing

Enable continuous validation by:
1. Running tests before each commit
2. Validating all user-facing changes with screenshots
3. Maintaining > 80% code coverage
4. Updating baselines when UI changes are approved

## Debug Mode

For detailed test debugging:
\`\`\`json
{
  "action": "screenshot",
  "name": "debug-state-1"
}
\`\`\`

Add screenshots between steps to capture intermediate states.

## Contact

For testing issues or framework updates:
- Check `.artifacts/` directory for detailed logs
- Review error messages in consolidated report
- Ensure Eyes MCP server is running and connected
```

## How to Customize This Template

### 1. Update URLs
Replace all localhost URLs with your actual development and test environment URLs.

### 2. Define Your Selectors
List the CSS selectors for your application's key elements (forms, buttons, navigation).

### 3. Specify Test Data
Include valid and invalid test data specific to your application.

### 4. Set Performance Thresholds
Define acceptable performance metrics based on your application's requirements.

### 5. Document Critical Paths
List the most important user journeys that must always work.

### 6. Add Project-Specific Tests
Include test scenarios unique to your application's features.

## Using CLAUDE.md with Claude Code

Once you've created your CLAUDE.md file:

1. **Place it in your project root**
   ```
   your-project/
   ├── CLAUDE.md
   ├── src/
   ├── tests/
   └── package.json
   ```

2. **Claude Code will automatically read it**
   When you ask Claude to test your application, it will follow the instructions in CLAUDE.md.

3. **Example prompts that trigger testing:**
   - "Check if my login form works correctly"
   - "Validate the changes I just made"
   - "Run tests on the dashboard component"
   - "Make sure nothing broke after the refactor"

4. **Claude will automatically:**
   - Connect to the Eyes MCP server
   - Run the appropriate tests based on context
   - Generate reports
   - Provide feedback on test results

## Benefits of Using CLAUDE.md

### Consistency
Every test run follows the same protocol, ensuring reliable results.

### Automation
Claude automatically knows how to test your specific application without repeated instructions.

### Context Awareness
Claude understands your application's structure and can make intelligent testing decisions.

### Comprehensive Coverage
Combines unit tests, E2E tests, and visual regression in one workflow.

### Developer Productivity
Developers can focus on writing code while Claude handles test execution and validation.

## Example: Real Application CLAUDE.md

Here's a shortened example for a React e-commerce application:

```markdown
# E-Commerce Testing Protocol

## Quick Test Command
When asked to "test the app", run this sequence:
1. generate_unit_tests for "./src/components"
2. run_e2e for checkout flow
3. inspect_screenshots for visual regression
4. generate_html_report

## Checkout Flow Test
\`\`\`json
{
  "baseUrl": "http://localhost:3000",
  "steps": [
    {"action": "navigate", "value": "/products"},
    {"action": "click", "selector": ".product-card:first-child .add-to-cart"},
    {"action": "click", "selector": "#cart-icon"},
    {"action": "screenshot", "name": "cart-view"},
    {"action": "click", "selector": "#checkout-btn"},
    {"action": "type", "selector": "#card-number", "value": "4242424242424242"},
    {"action": "select", "selector": "#exp-month", "value": "12"},
    {"action": "click", "selector": "#place-order"},
    {"action": "wait", "value": "3000"},
    {"action": "screenshot", "name": "order-confirmation", 
     "assertions": [{"kind": "ocr", "expected": "Order confirmed"}]}
  ]
}
\`\`\`

## Required Coverage
- Unit tests: 85%
- E2E critical paths: 100%
- Visual regression: < 2% difference
```

This approach ensures Claude Code can effectively test your application without manual intervention, catching bugs before they reach production.