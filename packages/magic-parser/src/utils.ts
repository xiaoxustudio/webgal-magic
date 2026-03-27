import type { Scene, Sentence, Visitor } from "./types.ts";

export const parsePrimitiveValue = (value: string): string | boolean | number => {
  const lowered = value.toLowerCase();
  if (lowered === "true" || lowered === "false") {
    return lowered === "true";
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  return value;
};

export const walkScene = (scene: Scene, visitor: Visitor): void => {
  visitor.onScene?.(scene);
  scene.sentenceList.forEach((sentence, index) => {
    visitor.onSentence?.(sentence, index, scene);
  });
  scene.assetsList.forEach((asset) => {
    visitor.onAsset?.(asset, scene);
  });
  scene.subSceneList.forEach((subScene) => {
    visitor.onSubScene?.(subScene, scene);
  });
};

export const walkSentences = (
  sentences: Sentence[],
  visitor: Omit<Visitor, "onScene" | "onAsset" | "onSubScene">,
): void => {
  sentences.forEach((sentence, index) => {
    visitor.onSentence?.(sentence, index, {
      sceneName: "",
      sceneUrl: "",
      sentenceList: sentences,
      assetsList: [],
      subSceneList: [],
    });
  });
};
