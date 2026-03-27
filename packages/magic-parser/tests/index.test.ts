import { test } from "vitest";
import SceneParser, { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "webgal-parser";
import { readFileSync, writeFileSync } from "fs";
import { parseScript } from "../src/index.ts";

test("gen original ast", () => {
  const wp = new SceneParser(
    () => {},
    (f) => f,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );
  const ast = wp.parse(readFileSync(new URL("./start.txt", import.meta.url)).toString(), "", "");
  writeFileSync(new URL("./start.json", import.meta.url), JSON.stringify(ast, null, 2));
});

test("gen new ast", () => {
  const ast = parseScript(readFileSync(new URL("./start.txt", import.meta.url)).toString(), "", "");
  writeFileSync(new URL("./start_new.json", import.meta.url), JSON.stringify(ast, null, 2));
});
