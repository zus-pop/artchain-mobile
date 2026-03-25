import LoginField from "@/components/form/LoginField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useLoginMutation } from "../apis/auth";

const { height } = Dimensions.get("window");

const schema = z.object({
  username: z
    .string({ message: "Username is required" })
    .trim()
    .nonempty("Username is required"),
  password: z
    .string({ message: "Password is required" })
    .trim()
    .nonempty("Password is required"),
});
type Schema = z.infer<typeof schema>;

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Schema>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { mutate, isPending } = useLoginMutation();

  const handleLogin = (data: Schema) => {
    mutate({ username: data.username, password: data.password });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
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
            padding: 8,
            marginRight: 12,
            borderRadius: 10,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: C.primary,
            letterSpacing: 0.5,
          }}
        >
          Đăng nhập
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section - Reduced size */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <Image
              source={require("../assets/logo/Logo.png")}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: C.primary,
                marginTop: 14,
                letterSpacing: 0.5,
              }}
            >
              ARTCHAIN
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ gap: 4, marginBottom: 28 }}>
            <LoginField
              control={control}
              name="username"
              placeholder="Tên đăng nhập"
              icon="person-outline"
            />
            <LoginField
              control={control}
              name="password"
              placeholder="Mật khẩu"
              icon="lock-closed-outline"
              isPassword
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: isValid && !isPending ? C.primary : C.muted,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 16,
              opacity: isValid && !isPending ? 1 : 0.65,
              shadowColor: C.primary,
              shadowOpacity: isValid && !isPending ? 0.25 : 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              ...(Platform.OS === "android"
                ? { elevation: isValid && !isPending ? 4 : 1 }
                : null),
            }}
            onPress={handleSubmit(handleLogin)}
            disabled={!isValid || isPending}
            activeOpacity={0.92}
          >
            <Text
              style={{
                color:
                  isValid && !isPending
                    ? C.primaryForeground
                    : C.mutedForeground,
                fontWeight: "700",
                fontSize: 16,
                letterSpacing: 0.3,
              }}
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}
          >
            <Text
              style={{ color: C.foreground, fontSize: 15, fontWeight: "500" }}
            >
              Chưa có tài khoản?
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/signup")}
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
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
