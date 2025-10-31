import { useWhoAmI } from "@/apis/auth";
import CompetitorProfileComponent from "@/components/CompetitorProfile";
import ExaminerProfileComponent from "@/components/ExaminerProfile";
import GuardianProfileComponent from "@/components/GuardianProfile";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function ProfileScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading } = useWhoAmI();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Show loading while determining user role
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.foreground }}>
          Đang tải hồ sơ...
        </Text>
      </View>
    );
  }

  // Show login prompt if not authenticated
  if (!accessToken || !user) {
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
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 16,
            fontWeight: "bold",
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
  switch (user.role) {
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
