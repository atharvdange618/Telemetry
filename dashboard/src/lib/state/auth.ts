import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
