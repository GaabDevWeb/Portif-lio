const EXPANDABLE_ALIASES: Record<string, string> = {
  ll: "ls -la",
  cls: "clear",
  h: "history",
  cv: "resume",
  mail: "contact",
  poweroff: "shutdown",
};

const SINGLE_TOKEN_ALIASES: Record<string, string> = {
  "..": "cd ..",
  "~": "cd ~",
};

export function expandAliases(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const firstToken = trimmed.split(/\s+/)[0];

  if (SINGLE_TOKEN_ALIASES[firstToken]) {
    return SINGLE_TOKEN_ALIASES[firstToken];
  }

  if (EXPANDABLE_ALIASES[firstToken]) {
    const rest = trimmed.slice(firstToken.length);
    return EXPANDABLE_ALIASES[firstToken] + rest;
  }

  return trimmed;
}

export function getAliasExpansions(): string[] {
  return [
    ...Object.keys(EXPANDABLE_ALIASES),
    ...Object.keys(SINGLE_TOKEN_ALIASES),
  ];
}
