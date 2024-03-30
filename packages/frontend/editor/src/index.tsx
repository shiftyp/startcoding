import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor, EditorProps } from "@monaco-editor/react";
import { Language } from "@startcoding/types";

const CodeEditor = (props: EditorProps) => {
  const {defaultValue} = props
  const [storedCode, setCode] = useState(defaultValue)

  return <Editor {...props} onChange={(newCode, ev) => {
    setCode(newCode)
    props.onChange?.(newCode, ev)
  }} />
}

export const renderEditor = ({
  container,
  language,
  code,
  updateCode,
}: {
  container: HTMLElement;
  language: Language;
  code: string;
  updateCode: (code: string) => Promise<void>;
}) => {
  const root = createRoot(container);

  root.render(<CodeEditor defaultLanguage={language} defaultValue={code} onChange={(newCode) => {
    updateCode(newCode!)
  }} />);
};
