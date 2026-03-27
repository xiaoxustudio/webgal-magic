import { CommandType, DEFAULT_COMMAND_PLUGINS, fileType, TokenType } from "./types.ts";
import type { Arg, Asset, CommandPlugin, Scene, Sentence, Token } from "./types.ts";
import { parsePrimitiveValue } from "./utils.ts";

/**
 * 语法分析器，将Token流转换为AST
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private pluginMap: Map<string, CommandPlugin>;
  private sayPlugin: CommandPlugin;

  constructor(tokens: Token[], plugins: CommandPlugin[] = DEFAULT_COMMAND_PLUGINS) {
    this.tokens = tokens;
    this.pluginMap = new Map();
    for (const plugin of plugins) {
      this.pluginMap.set(plugin.name, plugin);
    }
    const fallbackSayPlugin =
      plugins.find((plugin) => plugin.name === "say") ??
      plugins.find((plugin) => plugin.type === CommandType.say) ??
      DEFAULT_COMMAND_PLUGINS.find((plugin) => plugin.name === "say");
    this.sayPlugin = fallbackSayPlugin ?? {
      name: "say",
      type: CommandType.say,
      buildAdditionalArgs: (commandRaw) =>
        commandRaw && commandRaw !== "say" ? [{ key: "speaker", value: commandRaw }] : [],
    };
  }

  /**
   * 获取当前Token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * 获取当前Token并向前移动一位
   */
  private advance(): Token {
    const token = this.peek();
    this.current++;
    return token;
  }

  /**
   * 检查当前Token类型是否匹配
   */
  private match(type: TokenType): boolean {
    return this.peek().type === type;
  }

  /**
   * 消耗指定类型的Token
   */
  private consume(type: TokenType, errorMessage: string): Token {
    if (this.match(type)) {
      return this.advance();
    }
    throw new Error(errorMessage);
  }

  /**
   * 解析命令
   */
  private parseCommand(): {
    type: CommandType;
    commandRaw: string;
    additionalArgs: Arg[];
  } {
    const commandToken = this.consume(TokenType.Command, "Expected command");
    const commandRaw = commandToken.value;

    const plugin = this.pluginMap.get(commandRaw) ?? this.sayPlugin;
    const type = plugin?.type ?? CommandType.say;
    const additionalArgs = plugin?.buildAdditionalArgs
      ? plugin.buildAdditionalArgs(commandRaw)
      : [];
    if (plugin?.addNext) {
      additionalArgs.push({
        key: "next",
        value: true,
      });
    }

    return { type, commandRaw, additionalArgs };
  }

  /**
   * 解析参数
   */
  private parseArgs(): Arg[] {
    const args: Arg[] = [];

    while (this.match(TokenType.Dash)) {
      this.advance(); // 消耗"-"
      const argNameToken = this.consume(TokenType.ArgName, "Expected argument name");
      const argName = argNameToken.value;

      let argValue: string | boolean | number = true;

      // 检查是否有参数值
      if (this.match(TokenType.Equals)) {
        this.advance(); // 消耗"="
        const argValueToken = this.consume(TokenType.ArgValue, "Expected argument value");
        const valueStr = argValueToken.value;

        // 判断参数值类型
        argValue = parsePrimitiveValue(valueStr);
      } else {
        // 判断argName是否是音频文件名（.ogg|.mp3|.wav）
        // 如果是，则将其作为vocal参数处理
        if (argName.toLowerCase().match(/\.(ogg|mp3|wav)$/)) {
          argValue = argName;
          args.push({
            key: "vocal",
            value: argValue,
          });
          continue;
        }
      }

      args.push({
        key: argName,
        value: argValue,
      });
    }

    return args;
  }

  /**
   * 解析内容
   */
  private parseContent(): string {
    if (this.match(TokenType.Content)) {
      const contentToken = this.advance();
      let content = contentToken.value;

      // 处理特殊内容
      if (content === "none") {
        content = "";
      }

      return content;
    }
    return "";
  }

  /**
   * 扫描语句携带的资源
   */
  private scanAssets(commandType: CommandType, content: string, args: Arg[]): Asset[] {
    const assets: Asset[] = [];

    // 处理语音参数
    if (commandType === CommandType.say) {
      const vocalArg = args.find((arg) => arg.key === "vocal");
      if (vocalArg && typeof vocalArg.value === "string") {
        assets.push({
          name: vocalArg.value,
          url: vocalArg.value,
          lineNumber: 0,
          type: fileType.vocal,
        });
      }
    }

    // 处理命令携带的资源
    switch (commandType) {
      case CommandType.changeBg:
        if (content) {
          assets.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.background,
          });
        }
        break;
      case CommandType.changeFigure:
      case CommandType.miniAvatar:
        if (content) {
          assets.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.figure,
          });
        }
        break;
      case CommandType.video:
        if (content) {
          assets.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.video,
          });
        }
        break;
      case CommandType.bgm:
        if (content) {
          assets.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.bgm,
          });
        }
        break;
    }

    return assets;
  }

  /**
   * 扫描语句携带的子场景
   */
  private scanSubScenes(commandType: CommandType, content: string): string[] {
    const subScenes: string[] = [];

    if (commandType === CommandType.changeScene || commandType === CommandType.callScene) {
      if (content) {
        subScenes.push(content);
      }
    }

    if (commandType === CommandType.choose) {
      const chooseList = content.split("|");
      chooseList.forEach((choose) => {
        const parts = choose.split(":");
        if (parts.length > 1 && parts[1].match(/\./)) {
          subScenes.push(parts[1]);
        }
      });
    }

    return subScenes;
  }

  private buildSayCommandRaw(content: string, args: Arg[]): string {
    const rawParts: string[] = [];
    if (content) {
      rawParts.push(content);
    }
    for (const arg of args) {
      if (arg.key === "speaker") {
        continue;
      }
      if (arg.key === "vocal" && typeof arg.value === "string") {
        rawParts.push(`-${arg.value}`);
        continue;
      }
      if (arg.value === true) {
        rawParts.push(`-${arg.key}`);
        continue;
      }
      rawParts.push(`-${arg.key}=${String(arg.value)}`);
    }
    return rawParts.join(" ").trim();
  }

  /**
   * 解析语句
   */
  private parseSentence(): Sentence {
    let command: CommandType;
    let commandRaw: string;
    let content: string;
    const args: Arg[] = [];
    let inlineComment: string = "";
    let isImplicitSay = false;

    // 检查是否是注释行
    if (this.match(TokenType.Comment)) {
      const commentToken = this.advance();
      return {
        command: CommandType.comment,
        commandRaw: "comment",
        content: commentToken.value,
        args: [{ key: "next", value: true }],
        sentenceAssets: [],
        subScene: [],
        inlineComment: "",
      };
    }

    // 解析命令
    if (this.match(TokenType.Command)) {
      const commandData = this.parseCommand();
      command = commandData.type;
      commandRaw = commandData.commandRaw;
      args.push(...commandData.additionalArgs);
    } else if (this.match(TokenType.Colon)) {
      // 没有命令但有冒号（:xxx格式），是对话
      command = CommandType.say;
      commandRaw = "";
      args.push({
        key: "speaker",
        value: "",
      });
    } else {
      // 没有命令也没有冒号，默认是对话
      command = CommandType.say;
      commandRaw = "";
      isImplicitSay = true;
    }

    // 消费冒号（如果有）
    let hasColon = false;
    if (this.match(TokenType.Colon)) {
      this.advance();
      hasColon = true;
    }

    // 解析内容
    content = this.parseContent();
    if (!hasColon && !content && commandRaw) {
      content = commandRaw;
    }

    // 解析参数
    if (this.match(TokenType.Dash)) {
      const parsedArgs = this.parseArgs();
      args.push(...parsedArgs);
    }

    // 检查是否有行内注释
    if (this.match(TokenType.Comment)) {
      const commentToken = this.peek();
      const nextToken = this.tokens[this.current + 1];
      const keepCommentForNextSentence =
        commentToken.value === "" && nextToken && nextToken.type === TokenType.EOF;
      if (!keepCommentForNextSentence) {
        this.advance();
        inlineComment = commentToken.value;
      }
    }

    if (isImplicitSay) {
      commandRaw = this.buildSayCommandRaw(content, args);
    }

    // 扫描资源和子场景
    const sentenceAssets = this.scanAssets(command, content, args);
    const subScene = this.scanSubScenes(command, content);

    return {
      command,
      commandRaw,
      content,
      args,
      sentenceAssets,
      subScene,
      inlineComment,
    };
  }

  /**
   * 解析场景
   */
  public parse(sceneName: string = "", sceneUrl: string = ""): Scene {
    const sentenceList: Sentence[] = [];
    const assetsList: Asset[] = [];
    const subSceneList: string[] = [];

    while (!this.match(TokenType.EOF)) {
      const sentence = this.parseSentence();
      sentenceList.push(sentence);

      // 收集资源和子场景
      assetsList.push(...sentence.sentenceAssets);
      subSceneList.push(...sentence.subScene);
    }

    return {
      sceneName,
      sceneUrl,
      sentenceList,
      assetsList,
      subSceneList,
    };
  }
}
