# Contributing to Eyes MCP Server

Thank you for your interest in contributing to the Eyes MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the issue template when available
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (OS, Node version, etc.)
   - Error messages and logs

### Suggesting Features

1. Check if the feature has already been suggested
2. Open an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add/update tests as needed
5. Update documentation
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/eyes-mcp-server.git
cd eyes-mcp-server

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
src/
├── index.ts           # Main MCP server entry
├── tools/            # Individual testing tools
│   ├── generateUnitTests.ts
│   ├── runUnitTests.ts
│   ├── runE2E.ts
│   ├── inspectScreenshots.ts
│   ├── consolidateReport.ts
│   └── generateHTMLReport.ts
└── utils/            # Utility functions
    └── ollama.ts     # VLM integration
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide type definitions for all parameters and returns
- Avoid `any` type unless absolutely necessary
- Use interfaces for complex types

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add meaningful comments for complex logic
- Keep functions small and focused

### Error Handling

- Always handle errors gracefully
- Return structured error responses
- Include helpful error messages
- Log errors appropriately

### Testing

- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases
- Use descriptive test names

## Adding New Tools

To add a new MCP tool:

1. Create tool file in `src/tools/`
2. Export an async function that handles the tool logic
3. Register in `src/index.ts`:
   - Add to tool list in `ListToolsRequestSchema` handler
   - Add case in `CallToolRequestSchema` handler
4. Add TypeScript types
5. Update README with tool documentation
6. Add tests

### Tool Template

```typescript
// src/tools/myNewTool.ts
interface MyToolArgs {
  requiredParam: string;
  optionalParam?: boolean;
}

export async function myNewTool(args: MyToolArgs) {
  try {
    // Tool implementation
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            result: "data"
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ]
    };
  }
}
```

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { myNewTool } from '../src/tools/myNewTool';

describe('myNewTool', () => {
  it('should handle valid input', async () => {
    const result = await myNewTool({ requiredParam: 'test' });
    expect(result.content[0].text).toContain('"success": true');
  });
  
  it('should handle errors gracefully', async () => {
    const result = await myNewTool({ requiredParam: '' });
    expect(result.content[0].text).toContain('"success": false');
  });
});
```

### E2E Tests

Test the complete flow from MCP client to tool execution.

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for functions
- Include examples for new features
- Keep documentation in sync with code

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

Examples:
```
feat: add PDF support to OCR tool
fix: handle timeout in E2E runner
docs: update VLM setup instructions
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release PR
4. After merge, tag release
5. Publish to npm (if applicable)

## Getting Help

- Open an issue for questions
- Join discussions in issues/PRs
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.