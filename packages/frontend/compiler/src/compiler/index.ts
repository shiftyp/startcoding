import ts from 'typescript'
// @ts-ignore
import lib from '../lib.d.ts?raw'

const createCompilerHost = (code: string, options: ts.CompilerOptions, moduleSearchLocations: string[]): ts.CompilerHost => {
  return {
    getSourceFile,
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: (fileName, content) => {},
    getCurrentDirectory: () => '/',
    getDirectories: path => [],
    getCanonicalFileName: fileName => fileName,
    getNewLine: () => '\r\n',
    useCaseSensitiveFileNames: () => true,
    fileExists,
    readFile,
    resolveModuleNames
  };

  function fileExists(fileName: string): boolean {
    return true
  }

  function readFile(fileName: string): string | undefined {
    if (fileName === 'index.js') {
      return code
    } else if (fileName === 'lib.d.ts') {
      return lib
    }
  }

  function getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
    if (fileName === 'index.js') {
      return ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2020);
    } else if (fileName === 'lib.d.ts') {
      return ts.createSourceFile(fileName, lib, ts.ScriptTarget.ES2020);
    }
  }

  function resolveModuleNames(
    moduleNames: string[],
    containingFile: string
  ): ts.ResolvedModule[] {
    const resolvedModules: ts.ResolvedModule[] = [];
    for (const moduleName of moduleNames) {
      // try to use standard resolution
      let result = ts.resolveModuleName(moduleName, containingFile, options, {
        fileExists,
        readFile
      });
      if (result.resolvedModule) {
        resolvedModules.push(result.resolvedModule);
      } else {
        // check fallback locations, for simplicity assume that module at location
        // should be represented by '.d.ts' file
        for (const location of moduleSearchLocations) {
          const modulePath = `${location}/${moduleName}.d.ts`;
          if (fileExists(modulePath)) {
            resolvedModules.push({ resolvedFileName: modulePath });
          }
        }
      }
    }
    return resolvedModules;
  }
}

export const compile = (code: string) => {
  const host = createCompilerHost(code, {}, [])
}