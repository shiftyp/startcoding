import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor, EditorProps } from "@monaco-editor/react";
import { Language } from "@startcoding/types";

// @ts-ignore
import corelib from "@startcoding/types/lib?raw";

export const CodeEditor = (props: EditorProps) => {
  const { defaultValue } = props;
  const [storedCode, setCode] = useState(defaultValue);

  return (
    <Editor
      {...props}
      onChange={(newCode, ev) => {
        setCode(newCode);
        props.onChange?.(newCode, ev);
      }}
      beforeMount={(monaco) => {
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          module: monaco.languages.typescript.ModuleKind.None,
          noEmit: true,
          lib:["es2019"]
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