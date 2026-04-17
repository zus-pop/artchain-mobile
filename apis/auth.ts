import myAxios from "@/constants/custom-axios";
import { useAuthStore } from "@/store";
import { AuthResponse, LoginRequest, RegisterRequest, WhoAmI } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Linking } from "react-native";
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
    onError: () => {
      toast.error(
        "Đăng nhập thất bại xin hãy kiểm tra lại thông tin đăng nhập",
      );
    },
  });
}

export function useSignInMutation() {
  const { setPendingEmail } = useAuthStore.getState();
  return useMutation({
    mutationFn: async (registerRequest: RegisterRequest) => {
      const response = await myAxios.post("/auth/register", registerRequest);
      return response.data;
    },
    onSuccess: (data: any, variables) => {
      // Save pending email for verify screen
      setPendingEmail(variables.email);
      toast.success(`Đăng ký thành công!`);
      // Navigate to verify email screen
      router.replace("/verify-email");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyEmailMutation() {
  const { setPendingEmail, setAccessToken, setIsAuthenticating } =
    useAuthStore.getState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await myAxios.post("/auth/verify-check");
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      // Email verified, clear pending email
      setPendingEmail(null);
      setIsAuthenticating(true);
      setAccessToken(result.access_token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/profile");
      toast.success("Email xác minh thành công!");
    },
    onError: (error) => {
      toast.error(
        error.message || "Email chưa được xác minh, vui lòng thử lại",
      );
    },
  });
}

export function useResendVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await myAxios.post("/auth/resend-verify-email", {
        email,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email xác minh đã được gửi lại!");
    },
    onError: (error) => {
      toast.error(error.message || "Gửi lại email thất bại");
    },
  });
}

export async function openGmail() {
  //   const scheme =  "googlegmail://";
  const scheme = "https://gmail.app.goo.gl";
  const fallback = "https://mail.google.com";
  try {
    // Try Gmail first
    if (await Linking.canOpenURL(scheme)) {
      await Linking.openURL(scheme);
    } else {
      // Fallback to browser
      await Linking.openURL(fallback);
    }
  } catch (error) {
    console.error("Failed to open Gmail:", error);
    await Linking.openURL(fallback);
  }
}
