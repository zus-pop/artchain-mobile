import myAxios from "@/constants/custom-axios";
import { useAuthStore } from "@/store";
import { AuthResponse, LoginRequest, RegisterRequest, WhoAmI } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";

export function useWhoAmI() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await myAxios.get<WhoAmI>("/users/me");
        return response.data;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  });
}

export function useLoginMutation() {
  const { setAccessToken, setIsAuthenticating } = useAuthStore.getState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loginRequest: LoginRequest) => {
      const response = await myAxios.post("/auth/login", loginRequest);
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      // Set the authenticating flag BEFORE setting token and navigating
      // This prevents the profile screen from briefly showing "not logged in" state
      setIsAuthenticating(true);

      setAccessToken(result.access_token);

      // Invalidate queries to trigger re-fetch of user data
      queryClient.invalidateQueries({ queryKey: ["me"] });

      // Navigate to profile - profile screen will handle clearing the flag
      router.replace("/profile");

      toast.success("Đăng nhập thành công!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (registerRequest: RegisterRequest) => {
      const response = await myAxios.post("/auth/register", registerRequest);
      return response.data;
    },
    onSuccess: (token) => {
      toast.success(`Đăng ký thành công!`);
      router.replace("/login"); // Go back to profile
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
