import { useWhoAmI } from "@/apis/auth";
import ArtchainAnimation from "@/components/animations/ArtchainAnimation";
import CompetitorProfileComponent from "@/components/CompetitorProfile";
import ExaminerProfileComponent from "@/components/ExaminerProfile";
import GuardianProfileComponent from "@/components/GuardianProfile";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const setIsAuthenticating = useAuthStore(
    (state) => state.setIsAuthenticating,
  );

  const { data: user, isLoading } = useWhoAmI();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Clear the authenticating flag once user data has been fetched successfully
  useEffect(() => {
    if (!isLoading && user) {
      // User data is ready, stop showing loading
      setIsAuthenticating(false);
    }
  }, [isLoading, user, setIsAuthenticating]);

  // Show loading screen while waiting for user data OR during auth initialization
  if (isLoading || isAuthenticating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ArtchainAnimation />
        <Text style={{ color: colors.foreground, fontSize: 16 }}>
          Đang tải hồ sơ...
        </Text>
      </View>
    );
  }

  // Show login prompt only if user is truly not authenticated (no token)
  if (!accessToken) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
            color: colors.foreground,
          }}
        >
          Bạn chưa đăng nhập
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginBottom: 24,
            color: colors.mutedForeground,
          }}
        >
          Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc
          thi nghệ thuật hấp dẫn trên ArtChain.
        </Text>
        <Text
          style={{
            backgroundColor: colors.primary,
            color: colors.primaryForeground,
            width: "90%",
            paddingVertical: 12,
            borderRadius: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
          onPress={() => {
            router.push("/login");
          }}
        >
          Đăng nhập / Đăng ký
        </Text>
      </View>
    );
  }

  // Render appropriate profile component based on user role
  // At this point, we have both accessToken and user data
  switch (user?.role) {
    case "COMPETITOR":
      return <CompetitorProfileComponent />;
    case "GUARDIAN":
      return <GuardianProfileComponent />;
    case "EXAMINER":
      return <ExaminerProfileComponent />;
    default:
      // Fallback to competitor profile for unknown roles
      return <CompetitorProfileComponent />;
  }
}
