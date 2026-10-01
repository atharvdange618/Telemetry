export const API_URL: string = import.meta.env.VITE_API_URL;

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return (await res.json()) as T;
}
