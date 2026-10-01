import { create } from "zustand";

interface DarkModeState {
  isDark: boolean;
  toggleDarkMode: () => void;
}

function initialIsDark(): boolean {
  const stored = localStorage.getItem("darkMode");
  if (stored !== null) {
    return stored === "true";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// One shared store, so every caller (the toggle, the Toaster) sees the same
// theme. Per-component useState gave each caller its own stale copy.
const useDarkModeStore = create<DarkModeState>((set) => ({
  isDark: initialIsDark(),
  toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),
}));

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("darkMode", isDark.toString());
}

applyTheme(useDarkModeStore.getState().isDark);
useDarkModeStore.subscribe((state) => applyTheme(state.isDark));

export function useDarkMode() {
  return useDarkModeStore();
}
