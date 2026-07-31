import { create } from "zustand";
import type { UserResponse } from "../types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: UserResponse) => void;
  logout: () => void;
  updateUser: (user: UserResponse) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage
  const savedToken = localStorage.getItem("attrisense_token");
  const savedRefreshToken = localStorage.getItem("attrisense_refresh");
  const savedUserStr = localStorage.getItem("attrisense_user");
  let savedUser = null;
  
  try {
    if (savedUserStr) {
      savedUser = JSON.parse(savedUserStr);
    }
  } catch (e) {
    console.error("Failed to parse saved user state", e);
  }

  return {
    token: savedToken,
    refreshToken: savedRefreshToken,
    user: savedUser,
    isAuthenticated: !!savedToken,

    login: (token, refreshToken, user) => {
      localStorage.setItem("attrisense_token", token);
      localStorage.setItem("attrisense_refresh", refreshToken);
      localStorage.setItem("attrisense_user", JSON.stringify(user));
      set({ token, refreshToken, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem("attrisense_token");
      localStorage.removeItem("attrisense_refresh");
      localStorage.removeItem("attrisense_user");
      set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    },

    updateUser: (user) => {
      localStorage.setItem("attrisense_user", JSON.stringify(user));
      set({ user });
    }
  };
});
