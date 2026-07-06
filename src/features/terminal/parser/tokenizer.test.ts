import { describe, expect, it } from "vitest";

import { tokenize, parseInput, parsePipeline } from "@/features/terminal/parser/tokenizer";

describe("tokenizer", () => {
  it("tokenizes simple commands", () => {
    expect(tokenize("ls -la")).toEqual(["ls", "-la"]);
  });

  it("handles quoted strings", () => {
    expect(tokenize('echo "hello world"')).toEqual(["echo", "hello world"]);
  });

  it("parses pipelines", () => {
    expect(parsePipeline("ls | grep md")).toHaveLength(2);
  });

  it("parses redirects", () => {
    const parsed = parseInput("echo hi > out.txt");
    expect(parsed?.argv).toEqual(["echo", "hi"]);
    expect(parsed?.redirects[0]).toEqual({ type: "stdout", target: "out.txt" });
  });
});
