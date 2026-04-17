import { openGmail } from "@/apis/auth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { pendingEmail } = useAuthStore();

  // Handle open Gmail
  const handleOpenGmail = async () => {
    await openGmail();
  };

  // Navigate to login
  const handleVerify = () => {
    router.replace("/login");
  };

  if (!pendingEmail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.newbackground }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: C.foreground,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Không tìm thấy email. Vui lòng đăng ký lại.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: C.primary,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: C.primaryForeground,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: C.newbackground,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: C.accent,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="mail" size={48} color={C.primary} />
          </View>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: C.foreground,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Đăng ký thành công
        </Text>

        {/* Subtitle with email */}
        <Text
          style={{
            fontSize: 14,
            color: C.foreground,
            opacity: 0.8,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: 24,
          }}
        >
          Chúng tôi đã gửi email xác minh đến{"\n"}
          <Text style={{ fontWeight: "600", color: C.foreground, opacity: 1 }}>
            {pendingEmail}
          </Text>
        </Text>

        {/* Main message box */}
        <View
          style={{
            backgroundColor: C.accent,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: C.primary,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: C.foreground,
              lineHeight: 20,
              opacity: 0.85,
            }}
          >
            Vui lòng mở Gmail và nhấn vào liên kết xác nhận để kích hoạt tài
            khoản trước khi đăng nhập.
          </Text>
        </View>

        {/* Spam notice */}
        <Text
          style={{
            fontSize: 12,
            color: C.foreground,
            opacity: 0.65,
            textAlign: "center",
            marginBottom: 40,
            fontStyle: "italic",
          }}
        >
          💡 Không thấy email? Hãy kiểm tra mục Spam/Thư rác.
        </Text>

        {/* Open Gmail Button */}
        <TouchableOpacity
          onPress={handleOpenGmail}
          activeOpacity={0.8}
          style={{
            backgroundColor: C.primary,
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            flexDirection: "row",
          }}
        >
          <Ionicons
            name="open-outline"
            size={20}
            color={C.primaryForeground}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: C.primaryForeground,
            }}
          >
            Mở Gmail
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          activeOpacity={0.8}
          style={{
            backgroundColor: C.primary,
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: C.primaryForeground,
            }}
          >
            Tôi đã xác minh
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
