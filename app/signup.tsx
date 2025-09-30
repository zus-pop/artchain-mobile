import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";
import { useSignInMutation } from "../apis/auth";
import BrushButton from "@/components/buttons/BrushButton";

const schema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .trim()
      .min(2, "Username is required"),
    password: z
      .string({ message: "Password is required" })
      .trim()
      .min(2, "Password is required"),
    confirmPassword: z
      .string({ message: "Confirmed Password is required" })
      .trim()
      .nonempty("Confirmed Password is required"),
    email: z
      .string({ message: "Email is required" })
      .email("Need the right format email"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

type Schema = z.infer<typeof schema>;

export default function SignupScreen() {
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
  const { mutate, isPending } = useSignInMutation();

  const handleSignup = (data: Schema) => {
    mutate({
      email: data.email,
      username: data.username,
      password: data.password,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            Đăng ký
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
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
            name="email"
            render={({ field }) => (
              <TextInput
                placeholder="Email"
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
          {errors.email && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.email.message}
            </Text>
          )}
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
              <TextInput
                placeholder="Mật khẩu"
                onChangeText={field.onChange}
                secureTextEntry
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextInput
                placeholder="Xác nhận mật khẩu"
                onChangeText={field.onChange}
                secureTextEntry
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 18,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
                {...field}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.confirmPassword.message}
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
            onPress={handleSubmit(handleSignup)}
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
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>
                 <BrushButton title="Đăng Ký" />
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: Colors[colorScheme].primary, fontSize: 15 }}>
              Đã có tài khoản? Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
