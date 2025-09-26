import myAxios from "@/constants/custom-axios";
import { LoginRequest, SignInRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (loginRequest: LoginRequest) => {
      const response = await myAxios.post("/login", loginRequest);
      return response.data;
    },
    onSuccess: (token) => {
      toast.success(`Success: [${token}]`);
      router.back(); // Go back to profile
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (loginRequest: SignInRequest) => {
      const response = await myAxios.post("/signin", loginRequest);
      return response.data;
    },
    onSuccess: (token) => {
      toast.success(`Success: [${token}]`);
      router.back(); // Go back to profile
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
