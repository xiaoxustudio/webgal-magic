/**
 * 场景文本预处理函数
 * 用于处理多行文本，将它们合并为一行，并添加特殊的行标记
 * @param sceneText 原始场景文本
 * @returns 预处理后的场景文本
 */
export function sceneTextPreProcess(sceneText: string): string {
  const lines = sceneText.split("\n");
  const result: string[] = [];
  let currentCommand: string[] = [];
  let inMultilineCommand = false;
  let rawLines: string[] = [];
  let previousLineForcedConcat = false;
  let multilineIndent = 0;

  const flushMultiline = () => {
    if (!inMultilineCommand) {
      return;
    }
    const mergedCommand = currentCommand.join(" ");
    result.push(mergedCommand);
    for (let j = 1; j < rawLines.length; j++) {
      result.push(`;_WEBGAL_LINE_BREAK_${rawLines[j]}`);
    }
    currentCommand = [];
    rawLines = [];
    inMultilineCommand = false;
    previousLineForcedConcat = false;
    multilineIndent = 0;
  };

  const appendLine = (lineText: string, appendWithoutSpace: boolean) => {
    const trimmed = lineText.trim();
    if (currentCommand.length === 0) {
      currentCommand.push(trimmed);
    } else if (appendWithoutSpace) {
      currentCommand[currentCommand.length - 1] += trimmed;
    } else {
      currentCommand.push(trimmed);
    }
    rawLines.push(lineText);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      flushMultiline();
      result.push("");
      continue;
    }

    const indent = line.match(/^\s*/)?.[0] || "";

    if (line.trim().startsWith(";")) {
      flushMultiline();
      result.push(line);
      continue;
    }

    const endsWithBackslash = line.endsWith("\\");
    const lineWithoutBackslash = endsWithBackslash ? line.slice(0, -1) : line;
    const trimmed = lineWithoutBackslash.trim();
    const hasConcat = trimmed.includes("-concat");
    const isConcatLine = trimmed.startsWith("|");
    const isForcedContinuation = previousLineForcedConcat;

    if (inMultilineCommand) {
      if (!isForcedContinuation && indent.length <= multilineIndent && !isConcatLine) {
        flushMultiline();
      }
    }

    if (inMultilineCommand) {
      if (hasConcat && !isForcedContinuation && !endsWithBackslash) {
        flushMultiline();
        result.push(lineWithoutBackslash);
        previousLineForcedConcat = false;
        continue;
      }
      appendLine(lineWithoutBackslash, isConcatLine || isForcedContinuation);
      previousLineForcedConcat = endsWithBackslash;
      continue;
    }

    if (hasConcat && !endsWithBackslash) {
      result.push(lineWithoutBackslash);
      previousLineForcedConcat = false;
      continue;
    }

    const nextLine = lines[i + 1];
    const nextLineTrimmed = nextLine?.trim() ?? "";
    const nextIndent = nextLine?.match(/^\s*/)?.[0] || "";
    const shouldStartMultiline =
      endsWithBackslash ||
      (nextLine &&
        nextLineTrimmed !== "" &&
        !nextLineTrimmed.startsWith(";") &&
        nextIndent.length > indent.length);

    if (shouldStartMultiline) {
      inMultilineCommand = true;
      multilineIndent = indent.length;
      appendLine(lineWithoutBackslash, false);
      previousLineForcedConcat = endsWithBackslash;
      continue;
    }

    result.push(lineWithoutBackslash);
    previousLineForcedConcat = false;
  }

  flushMultiline();
  return result.join("\n");
}
