import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor, EditorProps, Monaco, useMonaco } from "@monaco-editor/react";
import { Language } from "@startcoding/types";

// @ts-ignore
import corelib from "@startcoding/types/lib?raw";

export const CodeEditor = ({ file, code, readme, error, setCode, setReadme, setError }: {
  file: string,
  code: string,
  readme: string,
  setCode: (code: string) => void,
  setReadme: (readme: string) => void,
  error: {
    line: number,
    column: number,
    messages: string[]
  } | null,
  setError: (error: {
    line: number,
    column: number,
    messages: string[]
  } | null) => void
}) => {
  const monaco = useMonaco()

  const getErrorInfo = async (model: any, line: number, column: number) => {
    const createWorker = await monaco!.languages.typescript.getJavaScriptWorker()
    const worker = await createWorker(model.uri)
    console.log(await worker.getNavigationTree(model.uri._formatted))
  }

  useEffect(() => {
    if (error && monaco) {
      const model = monaco.editor.getModels()[0]
      if (model) {
        monaco.editor.getEditors()[0].createDecorationsCollection([{
          options: {
            linesDecorationsClassName: 'error-line',
            isWholeLine: true,
            blockClassName: 'error-line-background',
            hoverMessage: error.messages.map(message => ({ value: message }))
          },
          range: new monaco.Range(error.line, error.column, error.line, error.column)
        }])

        
      }
    }
  }, [error, monaco])

  return (
    <Editor
      value={file === "index.js" ? code! : readme!}
      onChange={(changed) => {
        if (changed) {
          file === "index.js"
            ? setCode(changed)
            : setReadme(changed)
        }
      }}
      language={
        file === "index.js" ? "javascript" : "markdown"
      }
      options={{
        minimap: {
          enabled: false,
        },
        wordWrap: file === 'index.js' ? 'off' : 'on'
      }}
      beforeMount={(monaco) => {
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          module: monaco.languages.typescript.ModuleKind.None,
          noEmit: true,
          lib: ["es2019"]
        });
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          corelib
        );

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
      }}
    />
  );
};