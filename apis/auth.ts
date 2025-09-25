import myAxios from "@/constants/custom-axios";
import { LoginRequest, SignInRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (loginRequest: LoginRequest) => {
      const response = await myAxios.post("/login", loginRequest);
      return response.data;
    },
  });
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: async (loginRequest: SignInRequest) => {
      const response = await myAxios.post("/signin", loginRequest);
      return response.data;
    },
  });
}
