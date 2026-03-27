import { describe, it, expect } from "vitest";
import SceneParser, { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "webgal-parser";
import { parseScript } from "../src/index.ts";
import { readFileSync } from "fs";

describe("Parser Comparison", () => {
  it("should produce the same AST as the original parser", () => {
    // 读取测试脚本
    const script = readFileSync(new URL("./start.txt", import.meta.url)).toString();

    // 使用旧版解析器
    const oldParser = new SceneParser(
      () => {},
      (f) => f,
      ADD_NEXT_ARG_LIST,
      SCRIPT_CONFIG,
    );
    const oldAst = oldParser.parse(script, "", "");

    // 使用新版解析器
    const newAst = parseScript(script, "", "");

    // 比较场景基本信息
    expect(newAst.sceneName).toBe(oldAst.sceneName);
    expect(newAst.sceneUrl).toBe(oldAst.sceneUrl);

    // 比较语句数量
    expect(newAst.sentenceList.length).toBe(oldAst.sentenceList.length);

    // 比较每个语句
    for (let i = 0; i < newAst.sentenceList.length; i++) {
      const newSentence = newAst.sentenceList[i];
      const oldSentence = oldAst.sentenceList[i];

      // 比较命令类型
      expect(newSentence.command).toBe(oldSentence.command);

      // 比较命令原始内容
      expect(newSentence.commandRaw).toBe(oldSentence.commandRaw);

      // 比较内容
      expect(newSentence.content).toBe(oldSentence.content);

      // 比较参数
      expect(newSentence.args.length).toBe(oldSentence.args.length);
      for (let j = 0; j < newSentence.args.length; j++) {
        expect(newSentence.args[j].key).toBe(oldSentence.args[j].key);
        expect(newSentence.args[j].value).toBe(oldSentence.args[j].value);
      }

      // 比较资源
      expect(newSentence.sentenceAssets.length).toBe(oldSentence.sentenceAssets.length);
      for (let j = 0; j < newSentence.sentenceAssets.length; j++) {
        expect(newSentence.sentenceAssets[j].name).toBe(oldSentence.sentenceAssets[j].name);
        expect(newSentence.sentenceAssets[j].url).toBe(oldSentence.sentenceAssets[j].url);
        expect(newSentence.sentenceAssets[j].type).toBe(oldSentence.sentenceAssets[j].type);
      }

      // 比较子场景
      expect(newSentence.subScene.length).toBe(oldSentence.subScene.length);
      for (let j = 0; j < newSentence.subScene.length; j++) {
        expect(newSentence.subScene[j]).toBe(oldSentence.subScene[j]);
      }

      // 比较行内注释
      expect(newSentence.inlineComment).toBe(oldSentence.inlineComment);
    }

    // 比较资源列表
    expect(newAst.assetsList.length).toBe(oldAst.assetsList.length);
    for (let i = 0; i < newAst.assetsList.length; i++) {
      expect(newAst.assetsList[i].name).toBe(oldAst.assetsList[i].name);
      expect(newAst.assetsList[i].url).toBe(oldAst.assetsList[i].url);
      expect(newAst.assetsList[i].type).toBe(oldAst.assetsList[i].type);
    }

    // 比较子场景列表
    expect(newAst.subSceneList.length).toBe(oldAst.subSceneList.length);
    for (let i = 0; i < newAst.subSceneList.length; i++) {
      expect(newAst.subSceneList[i]).toBe(oldAst.subSceneList[i]);
    }
  });
});
