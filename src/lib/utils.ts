import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPromptPath(cwd: string, homeDir: string): string {
  if (cwd === homeDir) return "~";
  if (cwd.startsWith(`${homeDir}/`)) {
    return `~${cwd.slice(homeDir.length)}`;
  }
  return cwd;
}

export function buildPrompt(
  user: string,
  hostname: string,
  cwd: string,
  homeDir: string,
  isRoot: boolean,
): string {
  const path = formatPromptPath(cwd, homeDir);
  const char = isRoot ? "#" : "$";
  return `${user}@${hostname}:${path}${char} `;
}

export function normalizePath(cwd: string, input: string, homeDir: string): string {
  let path = input.trim();
  if (path.startsWith("~")) {
    path = path === "~" ? homeDir : `${homeDir}${path.slice(1)}`;
  }
  if (!path.startsWith("/")) {
    path = cwd === "/" ? `/${path}` : `${cwd}/${path}`;
  }
  const parts = path.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return `/${resolved.join("/")}`.replace(/\/$/, "") || "/";
}

export function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function getBasename(path: string): string {
  const parts = splitPath(path);
  return parts[parts.length - 1] ?? "/";
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
