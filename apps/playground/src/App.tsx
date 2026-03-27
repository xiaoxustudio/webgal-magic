import { DiffEditor, Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRef, useState } from "react";
import { parseScript, parseScriptForNew } from "./parser";
import "./App.css";
import "./init";
import textCode from "/start.txt?raw";

interface IDiffObject {
  original: string;
  modified: string;
}

function App() {
  const diffEditorRef = useRef<monaco.editor.IDiffEditor>(null);
  const [diffObject, setDiffObject] = useState<IDiffObject>({
    modified: "",
    original: "",
  });
  const handleEditorDidMount = (editor: monaco.editor.IDiffEditor) => {
    diffEditorRef.current = editor;
  };

  const onParsing = (value?: string) => {
    const parsed = parseScript(value ?? "");
    const parsedForNew = parseScriptForNew(value ?? "");
    setDiffObject({
      modified: JSON.stringify(parsed, null, 2),
      original: JSON.stringify(parsedForNew, null, 2),
    });
  };

  return (
    <>
      <Editor
        height="50vh"
        defaultLanguage="json"
        defaultValue={textCode}
        onChange={(v) => onParsing(v)}
      />
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
