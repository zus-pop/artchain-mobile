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
      const response = await myAxios.get<WhoAmI>("/users/me");
      return response.data;
    },
  });
}

export function useLoginMutation() {
  const { setAccessToken } = useAuthStore.getState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loginRequest: LoginRequest) => {
      const response = await myAxios.post("/auth/login", loginRequest);
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      setAccessToken(result.access_token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.back(); // Go back to profile
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
      toast.success(`Success: [${token}]`);
      router.replace("/login"); // Go back to profile
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
