import SceneParser, { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "webgal-parser";
import { parseScript as _parseScript, parseScriptConfig } from "webgal-magic-parser";

const _parser = new SceneParser(
  () => {},
  (f) => f,
  ADD_NEXT_ARG_LIST,
  SCRIPT_CONFIG,
);
export function parseScript(script: string) {
  return _parser.parse(script, "", "");
}

export function parseConfig(script: string) {
  return _parser.parseConfig(script);
}

export function parseScriptForNew(script: string) {
  return _parseScript(script);
}
export function parseConfigForNew(script: string) {
  return parseScriptConfig(script);
}

export default {};
