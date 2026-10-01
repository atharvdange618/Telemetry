import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Turns "example.com", "https://example.com/" or a full page URL into the bare
// origin a browser sends in its Origin header, which is what the tracking
// endpoint's allowlist compares against. Returns null if it can't be parsed.
export function normalizeOrigin(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;
  try {
    const { origin } = new URL(withScheme);
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

// Turns "pricing" or a full page URL into the pathname the tracker records.
export function normalizePath(input: string): string {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }
  return value.startsWith("/") ? value : `/${value}`;
}

// YYYY-MM-DD in local time, the format <input type="date"> expects.
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
