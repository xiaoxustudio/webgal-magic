import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { sceneTextPreProcess } from "./preprocess.ts";
import type { Arg, CommandPlugin, Scene } from "./types.ts";
import { DEFAULT_COMMAND_PLUGINS } from "./types.ts";
import { parsePrimitiveValue } from "./utils.ts";

export interface ParseOptions {
  plugins?: CommandPlugin[];
}

const buildCommandPlugins = (plugins?: CommandPlugin[]): CommandPlugin[] => {
  if (!plugins || plugins.length === 0) {
    return DEFAULT_COMMAND_PLUGINS;
  }
  const merged = new Map<string, CommandPlugin>(
    DEFAULT_COMMAND_PLUGINS.map((plugin) => [plugin.name, plugin]),
  );
  for (const plugin of plugins) {
    merged.set(plugin.name, plugin);
  }
  return Array.from(merged.values());
};

/**
 * 解析场景脚本
 * @param script 脚本文本
 * @param sceneName 场景名称
 * @param sceneUrl 场景URL
 * @returns 解析后的场景AST
 */
export function parseScript(
  script: string,
  sceneName: string = "",
  sceneUrl: string = "",
  options?: ParseOptions,
): Scene {
  const commandPlugins = buildCommandPlugins(options?.plugins);
  const commandKeywords = new Set(commandPlugins.map((plugin) => plugin.name));
  const lexer = new Lexer(script, commandKeywords);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, commandPlugins);
  return parser.parse(sceneName, sceneUrl);
}

export function parseScriptConfig(script: string): {
  command: string;
  args: string[];
  options: Arg[];
}[] {
  const lines = script.split("\n");
  const results: { command: string; args: string[]; options: Arg[] }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";")) {
      continue;
    }
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex < 0) {
      continue;
    }
    const command = trimmed.slice(0, colonIndex).trim();
    let rest = trimmed.slice(colonIndex + 1);
    const semicolonIndex = rest.indexOf(";");
    if (semicolonIndex >= 0) {
      rest = rest.slice(0, semicolonIndex);
    }
    rest = rest.trim();
    if (!rest) {
      results.push({ command, args: [], options: [] });
      continue;
    }

    const segments = rest
      .split("|")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const args: string[] = [];
    const options: Arg[] = [];
    const optionSegments: string[] = [];

    for (const segment of segments) {
      if (segment.startsWith("-") || optionSegments.length > 0) {
        optionSegments.push(segment);
      } else {
        args.push(segment);
      }
    }

    if (optionSegments.length > 0) {
      const optionTokens = optionSegments.join(" ").split(/\s+/).filter(Boolean);
      for (const token of optionTokens) {
        if (!token.startsWith("-")) {
          continue;
        }
        const optionBody = token.slice(1);
        if (!optionBody) {
          continue;
        }
        const equalsIndex = optionBody.indexOf("=");
        if (equalsIndex >= 0) {
          const key = optionBody.slice(0, equalsIndex);
          const value = optionBody.slice(equalsIndex + 1);
          options.push({ key, value: parsePrimitiveValue(value) });
        } else {
          options.push({ key: optionBody, value: true });
        }
      }
    }

    results.push({ command, args, options });
  }

  return results;
}

export * from "./types.ts";
export * from "./utils.ts";

export { Lexer, Parser, sceneTextPreProcess };
export { CommandType as commandType } from "./types.ts";
export { fileType } from "./types.ts";
