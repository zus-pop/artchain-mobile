import BrushButton from "@/components/buttons/BrushButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
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
  } = useForm({
    mode: "all",
    resolver: zodResolver(schema),
  });
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { mutate, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (data: Schema) => {
    // Placeholder: Implement login logic
    mutate({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].background}
      />
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors[colorScheme].card,
          paddingHorizontal: 12,
          paddingTop: 36,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme].border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].primary}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: Colors[colorScheme].primary,
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
            alignItems: "center",
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Image
              source={require("../assets/logo/Logo.png")}
              style={{ width: 300, height: 120, marginBottom: 16 }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: Colors[colorScheme].primary,
              marginBottom: 18,
            }}
          >
            ARTCHAIN
          </Text>

          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <TextInput
                placeholder="Tên đăng nhập"
                onChangeText={field.onChange}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
                {...field}
              />
            )}
          />
          {errors.username && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.username.message}
            </Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <View style={{ width: "100%", marginBottom: 18 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].input,
                    borderRadius: 12,
                  }}
                >
                  <TextInput
                    placeholder="Mật khẩu"
                    onChangeText={field.onChange}
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      color: Colors[colorScheme].foreground,
                      padding: 12,
                      fontSize: 16,
                    }}
                    placeholderTextColor={Colors[colorScheme].mutedForeground}
                    {...field}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{
                      padding: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={!showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={Colors[colorScheme].mutedForeground}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          {errors.password && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.password.message}
            </Text>
          )}

          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor:
                isValid && !isPending
                  ? Colors[colorScheme].primary
                  : Colors[colorScheme].muted,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 12,
              opacity: isValid && !isPending ? 1 : 0.7,
            }}
            onPress={handleSubmit(handleLogin)}
            disabled={!isValid || isPending}
          >
            <Text
              style={{
                color:
                  isValid && !isPending
                    ? Colors[colorScheme].primaryForeground
                    : Colors[colorScheme].mutedForeground,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          <BrushButton title="Đăng nhập" />

          <TouchableOpacity
            onPress={() => router.replace("/signup")}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: Colors[colorScheme].primary, fontSize: 15 }}>
              Chưa có tài khoản? Đăng ký
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
