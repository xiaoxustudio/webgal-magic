import { DiffEditor, Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRef, useState } from "react";
import { parseScript, parseScriptForNew } from "./parser";
import "./App.css";
import "./init";
import textCode from "/start.txt?raw";

interface IDiffObject {
  original: string;
  originalSpeed: number;
  modified: string;
  modifiedSpeed: number;
}

function App() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const diffEditorRef = useRef<monaco.editor.IDiffEditor>(null);
  const [diffObject, setDiffObject] = useState<IDiffObject>({
    modified: "",
    original: "",
    originalSpeed: 0,
    modifiedSpeed: 0,
  });
  const handleDiffEditorDidMount = (editor: monaco.editor.IDiffEditor) => {
    diffEditorRef.current = editor;
    editor.layout();
  };
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();
    onParsing(textCode);
  };

  const onParsing = (value?: string) => {
    const input = value ?? "";
    const runs = 50; // 测50次

    // 2. 正式测量 parseScript
    let total1 = 0;
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      parseScript(input);
      total1 += performance.now() - start;
    }

    // 3. 正式测量 parseScriptForNew
    let total2 = 0;
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      parseScriptForNew(input);
      total2 += performance.now() - start;
    }

    // 4. 只在最后做一次 JSON.stringify
    const modified = JSON.stringify(parseScript(input), null, 2);
    const original = JSON.stringify(parseScriptForNew(input), null, 2);

    setDiffObject({
      modified,
      original,
      modifiedSpeed: total1 / runs,
      originalSpeed: total2 / runs,
    });
  };

  return (
    <>
      <button onClick={() => onParsing(editorRef.current?.getValue())}>重新解析</button>
      <Editor
        height="50vh"
        defaultLanguage="json"
        defaultValue={textCode}
        onMount={handleEditorDidMount}
        onChange={(v) => onParsing(v)}
      />
      <hr />
      <p>
        webgal-parser speed: {diffObject.modifiedSpeed.toFixed(2)}ms
        <br />
        webgal-parser-new speed: {diffObject.originalSpeed.toFixed(2)}ms
      </p>
      <DiffEditor
        height="70vh"
        language="json"
        original={diffObject.original}
        modified={diffObject.modified}
        onMount={handleDiffEditorDidMount}
      />
    </>
  );
}

export default App;
