// app/.../CompetitorSignupScreen.tsx
import { useSignInMutation } from "@/apis/auth";
import { useWards } from "@/apis/wards";
import AuthInput from "@/components/form/AuthInput";
import PressDateField from "@/components/form/PressDateField";
import PressSelect from "@/components/form/PressSelect";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";

// ===== Schema =====
const competitorSchema = z
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
    schoolName: z
      .string({ message: "Tên trường là bắt buộc" })
      .trim()
      .min(2, "Tên trường phải có ít nhất 2 ký tự"),
    grade: z
      .string({ message: "Lớp là bắt buộc" })
      .trim()
      .min(1, "Lớp là bắt buộc")
      .refine(
        (val) => ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(val),
        { message: "Lớp phải là từ 1 đến 9" }
      ),
    ward: z
      .string({ message: "Khu vực là bắt buộc" })
      .trim()
      .min(2, "Khu vực phải có ít nhất 2 ký tự"),
    birthday: z
      .string({ message: "Ngày sinh là bắt buộc" })
      .min(1, "Ngày sinh là bắt buộc"),
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

type CompetitorForm = z.infer<typeof competitorSchema>;

export default function CompetitorSignupScreen() {
  const [showWardPicker, setShowWardPicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { mutate, isPending } = useSignInMutation();
  const { data: wards = [], isLoading: wardsLoading } = useWards();

  const competitorForm = useForm<CompetitorForm>({
    mode: "all",
    resolver: zodResolver(competitorSchema),
  });

  const {
    control,
    formState: { errors },
  } = competitorForm;

  const handleSignup = (data: CompetitorForm) => {
    mutate({
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      role: "COMPETITOR",
      schoolName: data.schoolName,
      grade: data.grade,
      ward: data.ward,
      birthday: data.birthday,
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
            Đăng ký Người tham gia
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
            Điền thông tin để tham gia các cuộc thi nghệ thuật
          </Text>

          {/* 1. Họ và tên */}
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <AuthInput
                label="Họ và tên"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                leftIcon="person-outline"
                autoCapitalize="words"
                errorText={errors.fullName?.message}
              />
            )}
          />

          {/* 2. Email */}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AuthInput
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                errorText={errors.email?.message}
              />
            )}
          />

          {/* 3. Tên đăng nhập */}
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <AuthInput
                label="Tên đăng nhập"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="none"
                leftIcon="at-outline"
                errorText={errors.username?.message}
              />
            )}
          />

          {/* 4. Tên trường học */}
          <Controller
            control={control}
            name="schoolName"
            render={({ field }) => (
              <AuthInput
                label="Tên trường học"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                leftIcon="school-outline"
                errorText={errors.schoolName?.message}
              />
            )}
          />

          {/* 5. Grade + 6. Ward (cùng hàng như cũ) */}
          <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <View style={{ flex: 1 }}>
                  <PressSelect
                    label=" Chọn Lớp"
                    value={field.value}
                    
                    onPress={() => setShowGradePicker(true)}
                    leftIcon="layers-outline"
                    errorText={errors.grade?.message}
                  />
                </View>
              )}
            />
            <Controller
              control={control}
              name="ward"
              render={({ field }) => (
                <View style={{ flex: 1 }}>
                  <PressSelect
                    label="Khu vực"
                    value={field.value}
                    placeholder="Chọn khu vực"
                    onPress={() => setShowWardPicker(true)}
                    leftIcon="location-outline"
                    errorText={errors.ward?.message}
                  />
                </View>
              )}
            />
          </View>

          {/* 7. Ngày sinh */}
          <Controller
            control={control}
            name="birthday"
            render={({ field }) => (
              <PressDateField
                label="Ngày sinh"
                value={field.value}
                onChange={field.onChange}
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date()}
                leftIcon="calendar-outline"
                errorText={errors.birthday?.message}
              />
            )}
          />

          {/* 8. Mật khẩu */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthInput
                label="Mật khẩu"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye" : "eye-off"}
                onPressRightIcon={() => setShowPassword((v) => !v)}
                errorText={errors.password?.message}
              />
            )}
          />

          {/* 9. Xác nhận mật khẩu */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <AuthInput
                label="Xác nhận mật khẩu"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                secureTextEntry={!showConfirmPassword}
                leftIcon="checkmark-done-outline"
                rightIcon={showConfirmPassword ? "eye" : "eye-off"}
                onPressRightIcon={() => setShowConfirmPassword((v) => !v)}
                errorText={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Nút đăng ký */}
          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor:
                competitorForm.formState.isValid && !isPending
                  ? C.primary
                  : C.muted,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 12,
              opacity: competitorForm.formState.isValid && !isPending ? 1 : 0.7,
            }}
            onPress={competitorForm.handleSubmit(handleSignup)}
            disabled={!competitorForm.formState.isValid || isPending}
          >
            <Text
              style={{
                color:
                  competitorForm.formState.isValid && !isPending
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

      {/* Ward Picker Modal */}
      <Modal
        visible={showWardPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWardPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: C.background }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: C.card,
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowWardPicker(false)}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons name="close" size={24} color={C.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: C.foreground,
                flex: 1,
              }}
            >
              Chọn khu vực
            </Text>
          </View>

          {wardsLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: C.mutedForeground }}>
                Đang tải danh sách khu vực...
              </Text>
            </View>
          ) : (
            <FlatList
              data={wards}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    competitorForm.setValue("ward", item.name, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setShowWardPicker(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                  }}
                >
                  <Text style={{ fontSize: 16, color: C.foreground }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 32,
                  }}
                >
                  <Text style={{ color: C.mutedForeground }}>
                    Không có dữ liệu khu vực
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      {/* Grade Picker Modal */}
      <Modal
        visible={showGradePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGradePicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: C.background }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: C.card,
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowGradePicker(false)}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons name="close" size={24} color={C.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: C.foreground,
                flex: 1,
              }}
            >
              Chọn lớp
            </Text>
          </View>

          <View style={{ flex: 1, padding: 20 }}>
            {[6, 7, 8, 9].map((grade) => (
              <TouchableOpacity
                key={grade}
                onPress={() => {
                  competitorForm.setValue("grade", String(grade), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setShowGradePicker(false);
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                  backgroundColor: C.card,
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: C.foreground }}>
                  Lớp {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
