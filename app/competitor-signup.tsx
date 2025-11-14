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
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
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

const { height: SCREEN_H } = Dimensions.get("window");
const grades = [6, 7, 8, 9]; // hoặc props/biến của bạn

// Tính chiều cao động
const HEADER_H = 64;
const PADDING_V = 20;
const ITEM_H = 66; // item dạng list
const CHIP_H = 48; // item dạng chip
const MAX_RATIO = 0.75; // tối đa 75% chiều cao màn hình
const GAP = 10;

// Chọn layout: ít item → list; nhiều item → grid
const USE_GRID = grades.length >= 7;
const NUM_COLS = 3;

const rows = USE_GRID ? Math.ceil(grades.length / NUM_COLS) : grades.length;
const contentH = USE_GRID
  ? rows * (CHIP_H + GAP) + PADDING_V * 2
  : rows * (ITEM_H + GAP) + PADDING_V * 2;

const SHEET_MAX_H = Math.min(HEADER_H + contentH, SCREEN_H * MAX_RATIO);

export default function CompetitorSignupScreen() {
  const [showWardPicker, setShowWardPicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [q, setQ] = useState("");

  const { data: wards = [], isLoading: wardsLoading } = useWards();

  const filteredWards = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return wards || [];
    return (wards || []).filter(
      (w: any) =>
        (w.name || "").toLowerCase().includes(key) ||
        (w.code || "").toLowerCase().includes(key)
    );
  }, [q, wards]);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { mutate, isPending } = useSignInMutation();

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
                autoCapitalize="none"
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
        animationType="fade"
        transparent
        onRequestClose={() => setShowWardPicker(false)}
      >
        {/* backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowWardPicker(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          {/* bottom sheet */}
          <View
            style={{
              maxHeight: SCREEN_H * MAX_RATIO,
              backgroundColor: C.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            {/* header + grabber */}
            <View
              style={{
                backgroundColor: C.card,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                paddingTop: 10,
                paddingBottom: 10,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: C.border,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  paddingHorizontal: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowWardPicker(false)}
                  style={{ padding: 8, marginRight: 8 }}
                >
                  <Ionicons name="close" size={22} color={C.primary} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: C.foreground,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  Chọn khu vực
                </Text>
              </View>
            </View>

            {/* body */}
            {wardsLoading ? (
              <View
                style={{
                  height: SCREEN_H * MAX_RATIO - HEADER_H,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: C.mutedForeground }}>
                  Đang tải danh sách khu vực...
                </Text>
              </View>
            ) : (
              <View style={{ padding: 12, paddingTop: 12 }}>
                {/* search box */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: C.border,
                    backgroundColor: C.card,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    height: 42,
                    marginBottom: 10,
                  }}
                >
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={C.mutedForeground}
                  />
                  <Text
                    style={{ color: C.mutedForeground, marginHorizontal: 6 }}
                  >
                    |
                  </Text>
                  <TextInput
                    placeholder="Tìm theo tên hoặc mã..."
                    placeholderTextColor={C.mutedForeground}
                    value={q}
                    onChangeText={setQ}
                    style={{
                      flex: 1,
                      color: C.foreground,
                      fontSize: 14,
                      paddingVertical: 0,
                    }}
                    autoCapitalize="none"
                  />
                  {q ? (
                    <TouchableOpacity
                      onPress={() => setQ("")}
                      style={{ padding: 6 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={C.mutedForeground}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* list (cuộn trong sheet) */}
                <FlatList
                  data={filteredWards}
                  keyExtractor={(item: any) => item.code}
                  keyboardShouldPersistTaps="handled"
                  style={{
                    maxHeight: SCREEN_H * MAX_RATIO - HEADER_H - 42 - 20,
                  }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        competitorForm.setValue("ward", item.name, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setShowWardPicker(false);
                        setQ("");
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: C.card,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{ fontSize: 15, color: C.foreground }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.mutedForeground,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {item.code}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={{ paddingVertical: 24, alignItems: "center" }}>
                      <Text style={{ color: C.mutedForeground }}>
                        Không có dữ liệu khu vực
                      </Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Grade Picker Modal */}
      <Modal
        visible={showGradePicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowGradePicker(false)}
      >
        {/* backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowGradePicker(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          {/* bottom sheet */}
          <View
            style={{
              maxHeight: SHEET_MAX_H,
              backgroundColor: C.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            {/* header + grabber */}
            <View
              style={{
                alignItems: "center",
                backgroundColor: C.card,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: C.border,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  paddingHorizontal: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowGradePicker(false)}
                  style={{ padding: 8, marginRight: 8 }}
                >
                  <Ionicons name="close" size={22} color={C.primary} />
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: C.foreground,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  Chọn lớp
                </Text>
              </View>
            </View>

            {/* content: auto change list/grid + tối đa chiều cao */}
            <View style={{ padding: PADDING_V, paddingTop: 16 }}>
              {USE_GRID ? (
                // GRID CHIP 3 cột
                <FlatList
                  data={grades}
                  numColumns={NUM_COLS}
                  keyExtractor={(g) => String(g)}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: GAP,
                  }}
                  renderItem={({ item: grade }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          competitorForm.setValue("grade", String(grade), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setShowGradePicker(false);
                        }}
                        style={{
                          width: `${100 / NUM_COLS - 2}%`,
                          paddingVertical: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: C.border,
                          backgroundColor: C.card,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: C.foreground,
                          }}
                        >
                          Lớp {grade}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  // Nếu quá nhiều, FlatList vẫn cuộn trong sheet
                  style={{ maxHeight: SCREEN_H * MAX_RATIO - HEADER_H }}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                // LIST ITEM GỌN
                <FlatList
                  data={grades}
                  keyExtractor={(g) => String(g)}
                  renderItem={({ item: grade, index }) => (
                    <TouchableOpacity
                      onPress={() => {
                        competitorForm.setValue("grade", String(grade), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setShowGradePicker(false);
                      }}
                      style={{
                        height: ITEM_H,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: C.card,
                        borderWidth: 1,
                        borderColor: C.border,
                        justifyContent: "center",
                        marginBottom: index === grades.length - 1 ? 0 : GAP,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: C.foreground }}>
                        Lớp {grade}
                      </Text>
                    </TouchableOpacity>
                  )}
                  getItemLayout={(_, i) => ({
                    length: ITEM_H + GAP,
                    offset: (ITEM_H + GAP) * i,
                    index: i,
                  })}
                  style={{ maxHeight: SCREEN_H * MAX_RATIO - HEADER_H }}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
