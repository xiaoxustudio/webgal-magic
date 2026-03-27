/**
 * 语句类型枚举
 */
export enum CommandType {
  say = 0, // 对话
  changeBg = 1, // 更改背景
  changeFigure = 2, // 更改立绘
  bgm = 3, // 更改背景音乐
  video = 4, // 播放视频
  pixi = 5, // pixi演出
  pixiInit = 6, // pixi初始化
  intro = 7, // 黑屏文字演示
  miniAvatar = 8, // 小头像
  changeScene = 9, // 切换场景
  choose = 10, // 分支选择
  end = 11, // 结束游戏
  setComplexAnimation = 12, // 动画演出
  setFilter = 13, // 设置效果
  label = 14, // 标签
  jumpLabel = 15, // 跳转标签
  chooseLabel = 16, // 选择标签
  setVar = 17, // 设置变量
  if = 18, // 条件跳转
  callScene = 19, // 调用场景
  showVars = 20,
  unlockCg = 21,
  unlockBgm = 22,
  filmMode = 23,
  setTextbox = 24,
  setAnimation = 25,
  playEffect = 26,
  setTempAnimation = 27,
  comment = 28,
  setTransform = 29,
  setTransition = 30,
  getUserInput = 31,
  applyStyle = 32,
  wait = 33,
  callSteam = 34, // 调用Steam功能
}

export const COMMAND_KEYWORDS = new Set([
  "say",
  "changeBg",
  "changeFigure",
  "bgm",
  "playVideo",
  "pixiPerform",
  "pixiInit",
  "intro",
  "miniAvatar",
  "changeScene",
  "choose",
  "end",
  "setComplexAnimation",
  "setFilter",
  "label",
  "jumpLabel",
  "chooseLabel",
  "setVar",
  "if",
  "callScene",
  "showVars",
  "unlockCg",
  "unlockBgm",
  "filmMode",
  "setTextbox",
  "setAnimation",
  "playEffect",
  "setTempAnimation",
  "setTransform",
  "setTransition",
  "getUserInput",
  "applyStyle",
  "wait",
  "callSteam",
]);

export const COMMAND_MAP: Record<string, CommandType> = {
  say: CommandType.say,
  changeBg: CommandType.changeBg,
  changeFigure: CommandType.changeFigure,
  bgm: CommandType.bgm,
  playVideo: CommandType.video,
  pixiPerform: CommandType.pixi,
  pixiInit: CommandType.pixiInit,
  intro: CommandType.intro,
  miniAvatar: CommandType.miniAvatar,
  changeScene: CommandType.changeScene,
  choose: CommandType.choose,
  end: CommandType.end,
  setComplexAnimation: CommandType.setComplexAnimation,
  setFilter: CommandType.setFilter,
  label: CommandType.label,
  jumpLabel: CommandType.jumpLabel,
  chooseLabel: CommandType.chooseLabel,
  setVar: CommandType.setVar,
  if: CommandType.if,
  callScene: CommandType.callScene,
  showVars: CommandType.showVars,
  unlockCg: CommandType.unlockCg,
  unlockBgm: CommandType.unlockBgm,
  filmMode: CommandType.filmMode,
  setTextbox: CommandType.setTextbox,
  setAnimation: CommandType.setAnimation,
  playEffect: CommandType.playEffect,
  setTempAnimation: CommandType.setTempAnimation,
  setTransform: CommandType.setTransform,
  setTransition: CommandType.setTransition,
  getUserInput: CommandType.getUserInput,
  applyStyle: CommandType.applyStyle,
  wait: CommandType.wait,
  callSteam: CommandType.callSteam,
};

export const ADD_NEXT_ARG_LIST: CommandType[] = [
  CommandType.bgm,
  CommandType.pixi,
  CommandType.pixiInit,
  CommandType.miniAvatar,
  CommandType.label,
  CommandType.if,
  CommandType.setVar,
  CommandType.unlockCg,
  CommandType.unlockBgm,
  CommandType.filmMode,
  CommandType.playEffect,
  CommandType.setTransition,
  CommandType.applyStyle,
  CommandType.callSteam,
];

export type commandType = CommandType;

export type arg = Arg;
export type IAsset = Asset;
export type ISentence = Sentence;
export type IScene = Scene;

/**
 * 资源类型枚举
 */
export enum fileType {
  background = 0,
  bgm = 1,
  figure = 2,
  scene = 3,
  tex = 4,
  vocal = 5,
  video = 6,
}

/**
 * 参数接口
 */
export interface Arg {
  key: string;
  value: string | boolean | number;
}

export interface CommandPlugin {
  name: string;
  type: CommandType;
  addNext?: boolean;
  buildAdditionalArgs?: (commandRaw: string) => Arg[];
}

export const DEFAULT_COMMAND_PLUGINS: CommandPlugin[] = Object.entries(COMMAND_MAP).map(
  ([name, type]) => {
    const plugin: CommandPlugin = {
      name,
      type,
      addNext: ADD_NEXT_ARG_LIST.includes(type),
    };
    if (type === CommandType.say) {
      plugin.buildAdditionalArgs = (commandRaw) =>
        commandRaw && commandRaw !== "say" ? [{ key: "speaker", value: commandRaw }] : [];
    }
    return plugin;
  },
);

/**
 * 资源接口
 */
export interface Asset {
  name: string;
  url: string;
  lineNumber: number;
  type: fileType;
}

/**
 * 语句接口
 */
export interface Sentence {
  command: CommandType;
  commandRaw: string;
  content: string;
  args: Arg[];
  sentenceAssets: Asset[];
  subScene: string[];
  inlineComment: string;
}

/**
 * 场景接口
 */
export interface Scene {
  sceneName: string;
  sceneUrl: string;
  sentenceList: Sentence[];
  assetsList: Asset[];
  subSceneList: string[];
}

export interface Visitor {
  onScene?: (scene: Scene) => void;
  onSentence?: (sentence: Sentence, index: number, scene: Scene) => void;
  onAsset?: (asset: Asset, scene: Scene) => void;
  onSubScene?: (subScene: string, scene: Scene) => void;
}

/**
 * Token类型枚举
 */
export enum TokenType {
  Command,
  Content,
  ArgName,
  ArgValue,
  Colon, // 冒号
  Semicolon, // 分号
  Dash, // 横杠
  Equals, // 等号
  Comment,
  EOF,
}

/**
 * Token接口
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
}
