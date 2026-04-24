import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];

  // Prevent double tap
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleNavigation = (path: Href) => {
    if (isNavigating) return; // Ignore if already navigating

    setIsNavigating(true);

    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Reset after 600ms to allow normal navigation
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 600);

    router.push(path);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: C.background,
      }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.background}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.card,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: C.input,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: C.primary,
            marginLeft: 12,
            letterSpacing: 0.5,
          }}
        >
          Chọn loại tài khoản
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: C.primary,
              marginBottom: 12,
              letterSpacing: 0.3,
            }}
          >
            ARTCHAIN
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: C.foreground,
              textAlign: "center",
              letterSpacing: 0.2,
              lineHeight: 24,
            }}
          >
            Lựa chọn loại tài khoản phù hợp với bạn
          </Text>
        </View>

        {/* Competitor Button */}
        <Pressable
          disabled={isNavigating}
          onPress={() => handleNavigation("/competitor-signup")}
          style={({ pressed }) => [
            {
              backgroundColor: isNavigating ? C.muted : C.primary,
              borderRadius: 14,
              paddingVertical: 28,
              paddingHorizontal: 20,
              alignItems: "center",
              marginBottom: 16,
              shadowColor: C.primary,
              shadowOpacity: pressed && !isNavigating ? 0.35 : 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              ...(Platform.OS === "android"
                ? { elevation: pressed && !isNavigating ? 6 : 4 }
                : null),
              opacity: pressed && !isNavigating ? 0.95 : isNavigating ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name="trophy-outline"
            size={40}
            color={C.primaryForeground}
            style={{ marginBottom: 12 }}
          />
          <Text
            style={{
              color: C.primaryForeground,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
              letterSpacing: 0.3,
            }}
          >
            Tôi là Thí sinh
          </Text>
          <Text
            style={{
              color: C.primaryForeground,
              fontSize: 14,
              fontWeight: "500",
              opacity: 0.88,
              textAlign: "center",
              marginTop: 8,
              letterSpacing: 0.2,
              lineHeight: 20,
            }}
          >
            Tham gia các cuộc thi và showcase tác phẩm
          </Text>
        </Pressable>

        {/* Guardian Button */}
        <Pressable
          disabled={isNavigating}
          onPress={() => handleNavigation("/guard-signup")}
          style={({ pressed }) => [
            {
              backgroundColor: isNavigating ? C.muted : C.secondary,
              borderRadius: 14,
              paddingVertical: 28,
              paddingHorizontal: 20,
              alignItems: "center",
              marginBottom: 32,
              shadowColor: C.secondary,
              shadowOpacity: pressed && !isNavigating ? 0.3 : 0.15,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              ...(Platform.OS === "android"
                ? { elevation: pressed && !isNavigating ? 5 : 3 }
                : null),
              opacity: pressed && !isNavigating ? 0.95 : isNavigating ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={40}
            color={C.secondaryForeground}
            style={{ marginBottom: 12 }}
          />
          <Text
            style={{
              color: C.secondaryForeground,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
              letterSpacing: 0.3,
            }}
          >
            Tôi là Người đại diện
          </Text>
          <Text
            style={{
              color: C.secondaryForeground,
              fontSize: 14,
              fontWeight: "500",
              opacity: 0.88,
              textAlign: "center",
              marginTop: 8,
              letterSpacing: 0.2,
              lineHeight: 20,
            }}
          >
            Quản lý và hỗ trợ các thí sinh của bạn
          </Text>
        </Pressable>

        {/* Login Link */}
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}
        >
          <Text
            style={{ color: C.foreground, fontSize: 15, fontWeight: "500" }}
          >
            Đã có tài khoản?
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: C.primary,
                fontSize: 15,
                fontWeight: "700",
                textDecorationLine: "underline",
              }}
            >
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
