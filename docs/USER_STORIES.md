# Eyes MCP Testing Framework - User Stories

## 🎯 Overview
A comprehensive testing framework that combines unit testing, E2E testing, visual regression, OCR text validation, and AI-powered visual quality assessment.

## 📚 User Stories

### Story 1: E-commerce Checkout Flow Validation
**As a** QA engineer  
**I want to** validate the complete checkout flow  
**So that** I can ensure customers can successfully purchase products

#### Test Scenario
```json
{
  "baseUrl": "https://shop.example.com",
  "steps": [
    {
      "action": "navigate",
      "value": "/products"
    },
    {
      "action": "click",
      "selector": "[data-product-id='12345'] .add-to-cart",
      "assertions": [
        {
          "kind": "text",
          "expected": "Added to cart"
        }
      ]
    },
    {
      "action": "navigate",
      "value": "/cart"
    },
    {
      "action": "screenshot",
      "name": "cart-view",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "Subtotal: $49.99"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Is the cart displaying exactly one item with a visible price and checkout button?",
          "passIf": "YES"
        }
      ]
    },
    {
      "action": "click",
      "selector": ".checkout-button"
    },
    {
      "action": "type",
      "selector": "#email",
      "value": "test@example.com"
    },
    {
      "action": "screenshot",
      "name": "checkout-form",
      "assertions": [
        {
          "kind": "vlm-eval",
          "prompt": "Is this a properly formatted checkout form with email, shipping, and payment sections clearly visible?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

---

### Story 2: Login Form Accessibility & Validation
**As a** developer  
**I want to** ensure the login form is accessible and properly validates input  
**So that** all users can successfully authenticate

#### Test Scenario
```json
{
  "baseUrl": "https://app.example.com",
  "steps": [
    {
      "action": "navigate",
      "value": "/login"
    },
    {
      "action": "screenshot",
      "name": "login-initial",
      "assertions": [
        {
          "kind": "element",
          "selector": "#username"
        },
        {
          "kind": "element",
          "selector": "#password"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Are the username and password fields clearly labeled and is there a visible login button?",
          "passIf": "YES"
        }
      ]
    },
    {
      "action": "click",
      "selector": ".login-submit",
      "assertions": [
        {
          "kind": "text",
          "expected": "Username is required"
        }
      ]
    },
    {
      "action": "type",
      "selector": "#username",
      "value": "invalid@user"
    },
    {
      "action": "type",
      "selector": "#password",
      "value": "wrongpass"
    },
    {
      "action": "click",
      "selector": ".login-submit"
    },
    {
      "action": "screenshot",
      "name": "login-error",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "Invalid credentials"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Is there a clear error message displayed near the form fields?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

---

### Story 3: Dashboard Visual Regression Testing
**As a** product owner  
**I want to** detect visual changes in the dashboard  
**So that** UI updates don't break existing functionality

#### Test Scenario
```json
{
  "baseUrl": "https://dashboard.example.com",
  "steps": [
    {
      "action": "navigate",
      "value": "/login"
    },
    {
      "action": "type",
      "selector": "#username",
      "value": "demo@example.com"
    },
    {
      "action": "type",
      "selector": "#password",
      "value": "demo123"
    },
    {
      "action": "click",
      "selector": ".login-button"
    },
    {
      "action": "wait",
      "value": "2000"
    },
    {
      "action": "screenshot",
      "name": "dashboard-main",
      "assertions": [
        {
          "kind": "visual-diff",
          "expected": "Less than 5% difference from baseline"
        },
        {
          "kind": "ocr",
          "expected": "Welcome back"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Does the dashboard show a header, navigation menu, and at least 3 data cards or widgets?",
          "passIf": "YES"
        }
      ]
    },
    {
      "action": "click",
      "selector": ".nav-analytics"
    },
    {
      "action": "screenshot",
      "name": "analytics-view",
      "assertions": [
        {
          "kind": "visual-diff"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Are there visible charts or graphs displaying data?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

---

### Story 4: Multi-language Support Verification
**As a** localization manager  
**I want to** verify Arabic and English text rendering  
**So that** users can use the app in their preferred language

#### Test Scenario
```json
{
  "baseUrl": "https://multilang.example.com",
  "steps": [
    {
      "action": "navigate",
      "value": "/?lang=en"
    },
    {
      "action": "screenshot",
      "name": "english-home",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "Welcome"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Is all text displayed in English with left-to-right alignment?",
          "passIf": "YES"
        }
      ]
    },
    {
      "action": "click",
      "selector": ".language-switcher"
    },
    {
      "action": "click",
      "selector": "[data-lang='ar']"
    },
    {
      "action": "wait",
      "value": "1000"
    },
    {
      "action": "screenshot",
      "name": "arabic-home",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "مرحبا",
          "languages": ["ara"]
        },
        {
          "kind": "vlm-eval",
          "prompt": "Is the layout now right-to-left with Arabic text properly displayed?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

---

### Story 5: Form Validation Edge Cases
**As a** QA engineer  
**I want to** test form validation with edge cases  
**So that** the application handles unusual input gracefully

#### Test Scenario
```json
{
  "baseUrl": "https://forms.example.com",
  "steps": [
    {
      "action": "navigate",
      "value": "/registration"
    },
    {
      "action": "type",
      "selector": "#email",
      "value": "test@test@test.com"
    },
    {
      "action": "type",
      "selector": "#age",
      "value": "-5"
    },
    {
      "action": "type",
      "selector": "#phone",
      "value": "123"
    },
    {
      "action": "screenshot",
      "name": "form-validation-errors",
      "assertions": [
        {
          "kind": "ocr",
          "expected": "Invalid email format"
        },
        {
          "kind": "ocr",
          "expected": "Age must be positive"
        },
        {
          "kind": "ocr",
          "expected": "Phone number incomplete"
        },
        {
          "kind": "vlm-eval",
          "prompt": "Are error messages displayed clearly next to or below each invalid field?",
          "passIf": "YES"
        }
      ]
    }
  ]
}
```

---

## 🚀 Quick Start Example

```typescript
// 1. Generate unit tests for your components
await mcp.call('generate_unit_tests', {
  targetPath: './src/components',
  testStrategy: 'comprehensive'
});

// 2. Run the unit tests
await mcp.call('run_unit_tests', {
  coverage: true
});

// 3. Run E2E tests with visual checks
await mcp.call('run_e2e', {
  baseUrl: 'http://localhost:3000',
  steps: [/* your test steps */]
});

// 4. Inspect screenshots with OCR and VLM
await mcp.call('inspect_screenshots', {
  screenshotDir: '.artifacts/screenshots',
  baselineDir: 'baselines',
  ocrLanguages: ['eng', 'ara']
});

// 5. Get consolidated report
await mcp.call('consolidate_report', {
  outputPath: 'test-report.json'
});
```

## 📋 Assertion Types

### 1. **DOM Assertions** (Real-time)
- `text`: Check if text exists in page
- `element`: Verify element exists

### 2. **Visual Assertions** (Deferred)
- `ocr`: Extract and validate text from screenshots
- `visual-diff`: Compare against baseline images
- `vlm-eval`: AI-powered visual quality checks

## 🔧 Configuration Tips

### OCR Languages
- `eng`: English
- `ara`: Arabic
- `fra`: French
- `deu`: German
- `spa`: Spanish

### VLM Models (via Ollama)
- `llava:13b`: General purpose vision model
- `bakllava`: Better for text-heavy images
- `moondream`: Lightweight, faster inference

### Visual Diff Thresholds
- `< 1%`: Strict pixel-perfect matching
- `< 5%`: Normal tolerance (default)
- `< 10%`: Loose matching for dynamic content

## 🎭 Testing Strategies

### Smoke Testing
Quick validation of critical paths with basic assertions.

### Regression Testing
Compare screenshots against baselines to catch unintended changes.

### Accessibility Testing
Use VLM to verify proper labeling, contrast, and layout.

### Localization Testing
OCR with language packs + VLM for layout direction validation.

### Performance Testing
Track screenshot file sizes and rendering completeness.

---

## 📊 Sample Consolidated Report Output

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "unitTests": {
      "total": 45,
      "passed": 43,
      "failed": 2,
      "coverage": 78.5
    },
    "e2eTests": {
      "totalSteps": 15,
      "passedSteps": 14,
      "screenshots": 8
    },
    "visualTests": {
      "totalScreenshots": 8,
      "passedScreenshots": 7,
      "ocrChecks": 12,
      "visualDiffs": 8,
      "vlmChecks": 6
    },
    "overallStatus": "partial"
  }
}
```