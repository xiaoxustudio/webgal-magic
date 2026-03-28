import { readFileSync } from "fs";
import { performance } from "perf_hooks";
import * as WebgalParser from "webgal-parser";
import { parseScript, parseScriptConfig } from "../src/index.ts";

const iterations = Number(process.argv[2] ?? "50");
const scriptUrl = new URL("../tests/test-resources/long-script.txt", import.meta.url);
const scriptText = readFileSync(scriptUrl).toString();
const configText = `Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.webp;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
`;

const SceneParserCtor =
  (WebgalParser as { default?: { default?: unknown } }).default?.default ??
  (WebgalParser as { default?: unknown }).default ??
  (WebgalParser as { SceneParser?: unknown }).SceneParser ??
  WebgalParser;
const ADD_NEXT_ARG_LIST =
  (WebgalParser as { ADD_NEXT_ARG_LIST?: unknown }).ADD_NEXT_ARG_LIST ??
  (WebgalParser as { default?: { ADD_NEXT_ARG_LIST?: unknown } }).default?.ADD_NEXT_ARG_LIST ??
  (WebgalParser as { "module.exports"?: { ADD_NEXT_ARG_LIST?: unknown } })["module.exports"]
    ?.ADD_NEXT_ARG_LIST ??
  [];
const SCRIPT_CONFIG =
  (WebgalParser as { SCRIPT_CONFIG?: unknown }).SCRIPT_CONFIG ??
  (WebgalParser as { default?: { SCRIPT_CONFIG?: unknown } }).default?.SCRIPT_CONFIG ??
  (WebgalParser as { "module.exports"?: { SCRIPT_CONFIG?: unknown } })["module.exports"]
    ?.SCRIPT_CONFIG ??
  {};

const runBenchmark = (label: string, fn: () => void) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const elapsed = performance.now() - start;
  const average = elapsed / iterations;
  console.log(`${label}: total ${elapsed.toFixed(2)}ms, avg ${average.toFixed(2)}ms`);
};
const ParserClass = SceneParserCtor as any;

const runWebgalParser = () => {
  const parser = new ParserClass(
    () => {},
    (url: string) => url,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );
  parser.parse(scriptText, "", "");
};

const runWebgalConfigParser = () => {
  const parser = new ParserClass(
    () => {},
    (url: string) => url,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );
  return parser.parseConfig(configText);
};

const runLocalParser = () => {
  parseScript(scriptText, "", "");
};

const runLocalConfigParser = () => {
  parseScriptConfig(configText);
};

console.log(`iterations=${iterations}`);
runBenchmark("webgal-parser", runWebgalParser);
runBenchmark("webgal-parser-config", runWebgalConfigParser);
runBenchmark("webgal-parser-new", runLocalParser);
runBenchmark("webgal-parser-config-new", runLocalConfigParser);
