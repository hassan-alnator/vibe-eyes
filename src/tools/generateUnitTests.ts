import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, basename, dirname } from "node:path";

interface TestGenerationArgs {
  targetPath: string;
  testStrategy?: "basic" | "comprehensive" | "edge-cases";
}

export async function generateUnitTests(args: TestGenerationArgs) {
  const { targetPath, testStrategy = "basic" } = args;
  
  try {
    const stats = await stat(targetPath);
    const files: string[] = [];
    
    if (stats.isDirectory()) {
      const entries = await readdir(targetPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(join(targetPath, entry.name));
        }
      }
    } else if (stats.isFile()) {
      files.push(targetPath);
    }
    
    const generatedTests: string[] = [];
    
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      const testContent = await generateTestForFile(file, content, testStrategy);
      
      const testFileName = basename(file).replace(/\.(ts|tsx)$/, '.test.$1');
      const testPath = join(dirname(file), '__tests__', testFileName);
      
      await writeFile(testPath, testContent);
      generatedTests.push(testPath);
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            generatedTests,
            strategy: testStrategy,
            message: `Generated ${generatedTests.length} test file(s)`
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

async function generateTestForFile(
  filePath: string,
  content: string,
  strategy: "basic" | "comprehensive" | "edge-cases"
): Promise<string> {
  const functionMatches = content.matchAll(/export\s+(async\s+)?function\s+(\w+)/g);
  const classMatches = content.matchAll(/export\s+class\s+(\w+)/g);
  
  const functions = Array.from(functionMatches).map(m => m[2]);
  const classes = Array.from(classMatches).map(m => m[1]);
  
  const fileName = basename(filePath);
  const importPath = `../${fileName.replace(/\.(ts|tsx)$/, '')}`;
  
  let testContent = `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';\n`;
  testContent += `import { ${[...functions, ...classes].join(', ')} } from '${importPath}';\n\n`;
  
  testContent += `describe('${fileName}', () => {\n`;
  
  for (const func of functions) {
    testContent += generateFunctionTests(func, strategy);
  }
  
  for (const cls of classes) {
    testContent += generateClassTests(cls, strategy);
  }
  
  testContent += `});\n`;
  
  return testContent;
}

function generateFunctionTests(funcName: string, strategy: string): string {
  let tests = `  describe('${funcName}', () => {\n`;
  
  if (strategy === "basic" || strategy === "comprehensive") {
    tests += `    it('should be defined', () => {\n`;
    tests += `      expect(${funcName}).toBeDefined();\n`;
    tests += `    });\n\n`;
    
    tests += `    it('should execute without errors', async () => {\n`;
    tests += `      // TODO: Add proper test implementation\n`;
    tests += `      expect(() => ${funcName}()).not.toThrow();\n`;
    tests += `    });\n`;
  }
  
  if (strategy === "comprehensive" || strategy === "edge-cases") {
    tests += `\n    it('should handle null/undefined inputs', () => {\n`;
    tests += `      // TODO: Test with null/undefined\n`;
    tests += `    });\n`;
    
    tests += `\n    it('should handle edge cases', () => {\n`;
    tests += `      // TODO: Test edge cases\n`;
    tests += `    });\n`;
  }
  
  tests += `  });\n\n`;
  return tests;
}

function generateClassTests(className: string, strategy: string): string {
  let tests = `  describe('${className}', () => {\n`;
  tests += `    let instance: ${className};\n\n`;
  
  tests += `    beforeEach(() => {\n`;
  tests += `      instance = new ${className}();\n`;
  tests += `    });\n\n`;
  
  if (strategy === "basic" || strategy === "comprehensive") {
    tests += `    it('should create an instance', () => {\n`;
    tests += `      expect(instance).toBeDefined();\n`;
    tests += `      expect(instance).toBeInstanceOf(${className});\n`;
    tests += `    });\n`;
  }
  
  if (strategy === "comprehensive" || strategy === "edge-cases") {
    tests += `\n    it('should handle method calls', () => {\n`;
    tests += `      // TODO: Test class methods\n`;
    tests += `    });\n`;
  }
  
  tests += `  });\n\n`;
  return tests;
}