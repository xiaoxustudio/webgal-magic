import { COMMAND_KEYWORDS, TokenType } from "./types.ts";
import type { Token } from "./types.ts";

/**
 * 词法分析器
 */
export class Lexer {
  private position: number = 0;
  private input: string;
  private inputLength: number;
  private commandKeywords: Set<string>;

  constructor(input: string, commandKeywords: Set<string> = COMMAND_KEYWORDS) {
    this.input = input;
    this.inputLength = input.length;
    this.commandKeywords = commandKeywords;
  }

  /**
   * 获取当前位置的字符
   */
  private peek(): string {
    return this.input[this.position] || "";
  }

  private isSpaceCharCode(code: number): boolean {
    return code === 32 || code === 9 || code === 13;
  }

  private isWhitespaceCharCode(code: number): boolean {
    return this.isSpaceCharCode(code) || code === 10;
  }

  /**
   * 获取当前位置的字符并向前移动一位
   */
  private advance(): string {
    const char = this.peek();
    this.position++;
    return char;
  }

  private readUntilLineEnd(options: {
    stopOnWhitespace: boolean;
    stopOnDashAfterSpace: boolean;
  }): string {
    let value = "";
    while (this.position < this.inputLength) {
      const char = this.input[this.position];
      if (char === "\n") {
        break;
      }
      if (char === ";" && (this.position === 0 || this.input[this.position - 1] !== "\\")) {
        break;
      }
      if (
        options.stopOnWhitespace &&
        this.isWhitespaceCharCode(this.input.charCodeAt(this.position))
      ) {
        break;
      }
      if (
        options.stopOnDashAfterSpace &&
        char === "-" &&
        this.position > 0 &&
        this.input[this.position - 1] === " "
      ) {
        break;
      }
      value += char;
      this.position++;
    }
    return value;
  }

  private getPreviousNonCarriageReturnChar(): string {
    let index = this.position - 1;
    while (index >= 0 && this.input[index] === "\r") {
      index--;
    }
    return index >= 0 ? this.input[index] : "";
  }

  /**
   * 跳过空白字符
   */
  private skipWhitespace(): void {
    while (
      this.position < this.inputLength &&
      this.isSpaceCharCode(this.input.charCodeAt(this.position))
    ) {
      this.position++;
    }
  }

  /**
   * 解析命令
   */
  private parseCommand(): Token {
    const start = this.position;
    let current = this.position;
    while (
      current < this.inputLength &&
      this.input[current] !== ":" &&
      this.input[current] !== ";" &&
      this.input[current] !== "\n" &&
      !this.isWhitespaceCharCode(this.input.charCodeAt(current))
    ) {
      current++;
    }
    const value = this.input.slice(start, current);
    if (this.input[current] !== ":" && !this.commandKeywords.has(value)) {
      return this.parseContent();
    }
    this.position = current;
    return {
      type: TokenType.Command,
      value,
      position: start,
    };
  }

  /**
   * 解析内容
   */
  private parseContent(): Token {
    const value = this.readUntilLineEnd({
      stopOnWhitespace: false,
      stopOnDashAfterSpace: true,
    });
    return {
      type: TokenType.Content,
      value: value.trim().replace(/\\;/g, ";"),
      position: this.position - value.length,
    };
  }

  /**
   * 解析参数名
   */
  private parseArgName(): Token {
    let value = "";
    while (
      this.position < this.inputLength &&
      this.peek() !== "=" &&
      this.peek() !== "-" &&
      this.peek() !== ";" &&
      this.peek() !== "\n" &&
      !this.isWhitespaceCharCode(this.input.charCodeAt(this.position))
    ) {
      value += this.advance();
    }
    return {
      type: TokenType.ArgName,
      value,
      position: this.position - value.length,
    };
  }

  /**
   * 解析参数值
   */
  private parseArgValue(): Token {
    const value = this.readUntilLineEnd({
      stopOnWhitespace: true,
      stopOnDashAfterSpace: true,
    });
    return {
      type: TokenType.ArgValue,
      value: value.trim().replace(/\\;/g, ";"),
      position: this.position - value.length,
    };
  }

  /**
   * 解析注释
   */
  private parseComment(): Token {
    let value = "";
    while (this.position < this.inputLength && this.peek() !== "\n") {
      value += this.advance();
    }
    let commentValue = value.trim();
    if (commentValue.endsWith(";") && !commentValue.endsWith("\\;")) {
      commentValue = commentValue.slice(0, -1);
    }
    return {
      type: TokenType.Comment,
      value: commentValue.replace(/\\;/g, ";"),
      position: this.position - value.length,
    };
  }

  /**
   * 获取下一个Token
   */
  public getNextToken(): Token {
    while (true) {
      this.skipWhitespace();

      if (this.position >= this.inputLength) {
        return {
          type: TokenType.EOF,
          value: "",
          position: this.position,
        };
      }

      const char = this.peek();
      const prevChar = this.getPreviousNonCarriageReturnChar();

      if (char === "\n") {
        this.advance();
        if (prevChar === "\n") {
          return {
            type: TokenType.Comment,
            value: "",
            position: this.position - 1,
          };
        }
        continue;
      }

      if (char === ";") {
        this.advance();
        return this.parseComment();
      }

      switch (char) {
        case ":":
          this.advance();
          return {
            type: TokenType.Colon,
            value: ":",
            position: this.position - 1,
          };
        case "-":
          this.advance();
          return {
            type: TokenType.Dash,
            value: "-",
            position: this.position - 1,
          };
        case "=":
          this.advance();
          return {
            type: TokenType.Equals,
            value: "=",
            position: this.position - 1,
          };
      }

      if (
        this.position === 0 ||
        this.input[this.position - 1] === "\n" ||
        this.input[this.position - 1] === ";"
      ) {
        return this.parseCommand();
      }

      if (this.input[this.position - 1] === "-") {
        return this.parseArgName();
      }

      if (this.input[this.position - 1] === "=") {
        return this.parseArgValue();
      }

      return this.parseContent();
    }
  }

  /**
   * 将整个输入转换为Token列表
   */
  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.getNextToken();
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.getNextToken();
    }
    tokens.push(token); // 添加EOF标记
    return tokens;
  }
}
