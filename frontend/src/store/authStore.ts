import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../lib/api";
import type { User } from "../lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          const { token, data } = response;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data.user));

          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          const { token, data: responseData } = response;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(responseData.user));

          set({
            user: responseData.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authAPI.logout().catch(() => {});
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (user: User) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });

            // Verify token is still valid
            const response = await authAPI.getMe();
            if (response.data?.user) {
              set({ user: response.data.user });
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          } catch (error) {
            // Token invalid, clear auth
            get().logout();
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
