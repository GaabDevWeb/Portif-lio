export type AnsiColor =
  | "reset"
  | "dim"
  | "bold"
  | "green"
  | "red"
  | "yellow"
  | "cyan"
  | "magenta"
  | "blue"
  | "gray";

export type AsciiTextStyle = {
  color?: AnsiColor;
};

export type AsciiLine =
  | { kind: "text"; text: string; style?: AsciiTextStyle }
  | { kind: "raw"; text: string };

export type RenderedLines = string[];

