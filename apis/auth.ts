import myAxios from "@/constants/custom-axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner-native";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (loginRequest: LoginRequest) => {
      const response = await myAxios.post("/auth/login", loginRequest);
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      toast.success(`Success: [${result.access_token}]`);
      //   router.back(); // Go back to profile
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
      //   router.back(); // Go back to profile
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
