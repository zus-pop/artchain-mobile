import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  isAuthenticating: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticating: false,
      setAccessToken(accessToken) {
        set((state) => ({ accessToken: accessToken }));
      },
      setIsAuthenticating(isAuthenticating) {
        set((state) => ({ isAuthenticating: isAuthenticating }));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
