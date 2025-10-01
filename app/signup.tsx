import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: Colors[colorScheme].primary,
          marginBottom: 8,
        }}
      >
        ARTCHAIN
      </Text>
      <Text
        style={{
          fontSize: 18,
          color: Colors[colorScheme].foreground,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Chọn loại tài khoản để đăng ký
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/competitor-signup")}
        style={{
          width: "100%",
          backgroundColor: Colors[colorScheme].primary,
          borderRadius: 12,
          paddingVertical: 20,
          alignItems: "center",
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Ionicons
          name="trophy-outline"
          size={32}
          color={Colors[colorScheme].primaryForeground}
          style={{ marginBottom: 8 }}
        />
        <Text
          style={{
            color: Colors[colorScheme].primaryForeground,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Người tham gia
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].primaryForeground,
            fontSize: 14,
            opacity: 0.9,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Tham gia các cuộc thi nghệ thuật
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/guard-signup")}
        style={{
          width: "100%",
          backgroundColor: Colors[colorScheme].secondary,
          borderRadius: 12,
          paddingVertical: 20,
          alignItems: "center",
          marginBottom: 32,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={32}
          color={Colors[colorScheme].secondaryForeground}
          style={{ marginBottom: 8 }}
        />
        <Text
          style={{
            color: Colors[colorScheme].secondaryForeground,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Người giám sát
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryForeground,
            fontSize: 14,
            opacity: 0.9,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Giám sát và quản lý cuộc thi
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        style={{ marginTop: 8 }}
      >
        <Text style={{ color: Colors[colorScheme].primary, fontSize: 15 }}>
          Đã có tài khoản? Đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  );
}
