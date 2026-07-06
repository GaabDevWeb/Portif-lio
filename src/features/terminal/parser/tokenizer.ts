import type { ParsedPipeline, Redirect } from "@/types/root-os";

const QUOTE_PATTERN = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|[^\s|]+/g;

export function tokenize(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const tokens: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = QUOTE_PATTERN.exec(trimmed)) !== null) {
    let token = match[0];
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1);
    }
    tokens.push(token);
  }

  return tokens;
}

export function parseRedirects(tokens: string[]): {
  argv: string[];
  redirects: Redirect[];
} {
  const argv: string[] = [];
  const redirects: Redirect[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === ">" && tokens[i + 1]) {
      redirects.push({ type: "stdout", target: tokens[i + 1] });
      i += 1;
      continue;
    }

    if (token === ">>" && tokens[i + 1]) {
      redirects.push({ type: "append", target: tokens[i + 1] });
      i += 1;
      continue;
    }

    if (token === "2>" && tokens[i + 1]) {
      redirects.push({ type: "stderr", target: tokens[i + 1] });
      i += 1;
      continue;
    }

    argv.push(token);
  }

  return { argv, redirects };
}

export function parsePipeline(input: string): ParsedPipeline[] {
  const segments = input
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return [];

  return segments.map((segment) => {
    const tokens = tokenize(segment);
    const { argv, redirects } = parseRedirects(tokens);
    return { argv, redirects };
  });
}

export function parseInput(input: string): ParsedPipeline | null {
  const pipelines = parsePipeline(input);
  if (pipelines.length === 0) return null;
  return pipelines[0];
}
