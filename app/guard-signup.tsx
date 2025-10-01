import { useSignInMutation } from "@/apis/auth";
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

// Guard Schema
const guardSchema = z
  .object({
    username: z
      .string({ message: "Tên đăng nhập là bắt buộc" })
      .trim()
      .min(2, "Tên đăng nhập phải có ít nhất 2 ký tự"),
    password: z
      .string({ message: "Mật khẩu là bắt buộc" })
      .trim()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string({ message: "Xác nhận mật khẩu là bắt buộc" })
      .trim()
      .nonempty("Xác nhận mật khẩu là bắt buộc"),
    email: z
      .string({ message: "Email là bắt buộc" })
      .email("Email không đúng định dạng"),
    fullName: z
      .string({ message: "Họ tên là bắt buộc" })
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
      });
    }
  });

type GuardForm = z.infer<typeof guardSchema>;

export default function GuardSignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { mutate, isPending } = useSignInMutation();

  // Guard form
  const guardForm = useForm<GuardForm>({
    mode: "all",
    resolver: zodResolver(guardSchema),
  });

  const handleSignup = (data: GuardForm) => {
    mutate({
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      role: "GUARDIAN",
    });
  };

  const {
    control,
    formState: { errors },
  } = guardForm;

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
            Đăng ký Người giám sát
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
              fontSize: 20,
              fontWeight: "bold",
              color: Colors[colorScheme].foreground,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Đăng ký Người giám sát
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: Colors[colorScheme].mutedForeground,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Điền thông tin để trở thành người giám sát
          </Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <TextInput
                placeholder="Họ và tên"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.fullName
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
              />
            )}
          />
          {errors.fullName && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.fullName.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                placeholder="Email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.email
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
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
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.username
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
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
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                secureTextEntry
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.password
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
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
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                secureTextEntry
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.confirmPassword
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  color: Colors[colorScheme].foreground,
                  borderRadius: 12,
                  marginBottom: 18,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={Colors[colorScheme].mutedForeground}
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
                guardForm.formState.isValid && !isPending
                  ? Colors[colorScheme].primary
                  : Colors[colorScheme].muted,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 12,
              opacity: guardForm.formState.isValid && !isPending ? 1 : 0.7,
            }}
            onPress={guardForm.handleSubmit(handleSignup)}
            disabled={!guardForm.formState.isValid || isPending}
          >
            <Text
              style={{
                color:
                  guardForm.formState.isValid && !isPending
                    ? Colors[colorScheme].primaryForeground
                    : Colors[colorScheme].mutedForeground,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
