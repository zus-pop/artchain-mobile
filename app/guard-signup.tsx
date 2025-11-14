import { useSignInMutation } from "@/apis/auth";
import LoginField from "@/components/form/LoginField"; // ✅ dùng input component đã tạo
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const { mutate, isPending } = useSignInMutation();

  const guardForm = useForm<GuardForm>({
    mode: "all",
    resolver: zodResolver(guardSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = guardForm;

  const handleSignup = (data: GuardForm) => {
    mutate({
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      role: "GUARDIAN",
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
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
            Đăng ký Người đại diện
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
              fontSize: 14,
              color: C.mutedForeground,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Điền thông tin để trở thành người đại diện
          </Text>

          {/* Full name */}
          <LoginField
            control={control}
            name="fullName"
            placeholder="Họ và tên"
            icon="person-outline"
            autoCapitalize="words"
            errorText={errors.fullName?.message}
          />

          {/* Email */}
          <LoginField
            control={control}
            name="email"
            placeholder="Email"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            errorText={errors.email?.message}
          />

          {/* Username */}
          <LoginField
            control={control}
            name="username"
            placeholder="Tên đăng nhập"
            icon="at-outline"
            autoCapitalize="none"
            errorText={errors.username?.message}
          />

          {/* Password */}
          <LoginField
            control={control}
            name="password"
            placeholder="Mật khẩu"
            icon="lock-closed-outline"
            isPassword
            textContentType="oneTimeCode"
            autoCapitalize="none"
            errorText={errors.password?.message}
          />

          {/* Confirm Password */}
          <LoginField
            control={control}
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            icon="lock-closed-outline"
            isPassword
            textContentType="oneTimeCode"
            autoCapitalize="none"
            errorText={errors.confirmPassword?.message}
          />

          {/* Submit */}
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: isValid && !isPending ? C.primary : C.muted,
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
                    ? C.primaryForeground
                    : C.mutedForeground,
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
            <Text style={{ color: C.primary, fontSize: 15 }}>
              Đã có tài khoản? Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
