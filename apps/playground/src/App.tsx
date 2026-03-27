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
  const diffEditorRef = useRef<monaco.editor.IDiffEditor>(null);
  const [diffObject, setDiffObject] = useState<IDiffObject>({
    modified: "",
    original: "",
    originalSpeed: 0,
    modifiedSpeed: 0,
  });
  const handleEditorDidMount = (editor: monaco.editor.IDiffEditor) => {
    diffEditorRef.current = editor;
  };

  const onParsing = (value?: string) => {
    const time = {
      p1: performance.now(),
      p2: 0,
    };
    const parsed = parseScript(value ?? "");
    time.p1 = performance.now() - time.p1;
    time.p2 = performance.now();
    const parsedForNew = parseScriptForNew(value ?? "");
    time.p2 = performance.now() - time.p2;
    setDiffObject({
      modified: JSON.stringify(parsed, null, 2),
      original: JSON.stringify(parsedForNew, null, 2),
      modifiedSpeed: time.p1,
      originalSpeed: time.p2,
    });
  };

  return (
    <>
      <Editor
        height="50vh"
        defaultLanguage="json"
        defaultValue={textCode}
        onMount={(editor) => {
          editor.focus();
          onParsing(textCode);
        }}
        onChange={(v) => onParsing(v)}
      />
      <hr />
      <p>
        webgal-parser speed: {diffObject.modifiedSpeed.toFixed(2)}ms
        <br />
        webgal-parser-new speed: {diffObject.originalSpeed.toFixed(2)}ms
      </p>
      <DiffEditor
        height="90vh"
        language="json"
        original={diffObject.original}
        modified={diffObject.modified}
        onMount={handleEditorDidMount}
      />
    </>
  );
}

export default App;
