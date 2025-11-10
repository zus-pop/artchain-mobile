import LoginField from "@/components/form/LoginField";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { useLoginMutation } from "../apis/auth";

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
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = (data: Schema) => {
    mutate({ username: data.username, password: data.password });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
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
          paddingHorizontal: 12,
          paddingTop: 36,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: C.primary }}>
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
            justifyContent: "flex-start",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Image
              source={require("../assets/logo/Logo.png")}
              style={{ width: 300, height: 300 , }} 
              resizeMode="contain"
            />

            <View style={{ marginTop: -34 , }}>
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
          </View>
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: isValid && !isPending ? C.primary : C.muted,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 12,
              opacity: isValid && !isPending ? 1 : 0.7,
              shadowColor: C.primary,
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              ...(Platform.OS === "android" ? { elevation: 2 } : null),
            }}
            onPress={handleSubmit(handleLogin)}
            disabled={!isValid || isPending}
          >
            <Text
              style={{
                color:
                  isValid && !isPending
                    ? C.primaryForeground
                    : C.mutedForeground,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/signup")}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: C.primary, fontSize: 15 }}>
              Chưa có tài khoản? Đăng ký
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
