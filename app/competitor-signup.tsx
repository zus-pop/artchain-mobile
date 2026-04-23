// app/.../CompetitorSignupScreen.tsx
import { useSignInMutation } from "@/apis/auth";
import { useWards } from "@/apis/wards";
import AuthInput from "@/components/form/AuthInput";
import PressDateField from "@/components/form/PressDateField";
import PressSelect from "@/components/form/PressSelect";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  KeyboardAvoidingView,
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
      .refine((val) => ["6", "7", "8", "9"].includes(val), {
        message: "Lớp phải là từ 6 đến 9",
      }),
    ward: z
      .string({ message: "Khu vực là bắt buộc" })
      .trim()
      .min(2, "Khu vực phải có ít nhất 2 ký tự"),
    birthday: z
      .string({ message: "Ngày sinh là bắt buộc" })
      .min(1, "Ngày sinh là bắt buộc"),
  })
  .superRefine(({ confirmPassword, password, birthday, grade }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
      });
    }

    // Cross-validate birthday with grade
    if (birthday && grade && !isValidBirthdayForGrade(birthday, grade)) {
      const range = GRADE_BIRTH_YEARS[grade as keyof typeof GRADE_BIRTH_YEARS];
      ctx.addIssue({
        code: "custom",
        message: `Ngày sinh không phù hợp với lớp ${grade}. Sinh năm ${range?.min}-${range?.max}`,
        path: ["birthday"],
      });
    }
  });

type CompetitorForm = z.infer<typeof competitorSchema>;

const grades = [6, 7, 8, 9]; // Grades 6-9 only

// Grade picker constants
const GRADE_CHIP_SIZE = 56;
const GRADE_GAP = 12;
const GRADE_NUM_COLS = 2;
const GRADE_ROWS = Math.ceil(grades.length / GRADE_NUM_COLS);

// Ward picker constants
const WARD_SNAP_POINTS = ["70%", "90%"];
const GRADE_SNAP_POINTS = ["40%"];

// ===== Helper Functions for Birthday-Grade Validation =====

// Grade-to-birth-year mapping (2026 năm hiện tại)
const GRADE_BIRTH_YEARS = {
  "6": { min: 2012, max: 2013 },
  "7": { min: 2011, max: 2012 },
  "8": { min: 2010, max: 2011 },
  "9": { min: 2009, max: 2010 },
};

const getMinBirthdayForGrade = (grade: string): Date => {
  const range = GRADE_BIRTH_YEARS[grade as keyof typeof GRADE_BIRTH_YEARS];
  if (!range) return new Date(1900, 0, 1);
  return new Date(range.min, 0, 1); // Tối sớm: 1/1/năm min
};

const getMaxBirthdayForGrade = (grade: string): Date => {
  const range = GRADE_BIRTH_YEARS[grade as keyof typeof GRADE_BIRTH_YEARS];
  if (!range) return new Date();
  return new Date(range.max, 11, 31); // Tối muộn: 31/12/năm max
};

const getGradeFromBirthday = (birthdayStr: string): string | null => {
  if (!birthdayStr) return null;
  try {
    const date = new Date(birthdayStr);
    const birthYear = date.getFullYear();

    for (const [grade, range] of Object.entries(GRADE_BIRTH_YEARS)) {
      if (birthYear >= range.min && birthYear <= range.max) {
        return grade;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const isValidBirthdayForGrade = (
  birthdayStr: string,
  grade: string,
): boolean => {
  if (!birthdayStr || !grade) return true; // Allow empty
  try {
    const date = new Date(birthdayStr);
    const birthYear = date.getFullYear();
    const range = GRADE_BIRTH_YEARS[grade as keyof typeof GRADE_BIRTH_YEARS];

    if (!range) return false;
    return birthYear >= range.min && birthYear <= range.max;
  } catch {
    return false;
  }
};

export default function CompetitorSignupScreen() {
  const wardSheetRef = useRef<BottomSheet>(null);
  const gradeSheetRef = useRef<BottomSheet>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (isNavigating) return;

    setIsNavigating(true);
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 600);

    router.replace(path as any);
  };

  const [q, setQ] = useState("");
  const [suggestedGrade, setSuggestedGrade] = useState<string | null>(null);
  const [minBirthdayDate, setMinBirthdayDate] = useState(new Date(2009, 0, 1));
  const [maxBirthdayDate, setMaxBirthdayDate] = useState(
    new Date(2013, 11, 31),
  );
  const { data: wards = [], isLoading: wardsLoading } = useWards();

  const filteredWards = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return wards || [];
    return (wards || []).filter(
      (w: any) =>
        (w.name || "").toLowerCase().includes(key) ||
        (w.code || "").toLowerCase().includes(key),
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
    watch,
  } = competitorForm;

  // Watch birthday field to suggest grade
  const watchBirthday = watch("birthday");
  const watchGrade = watch("grade");

  // When birthday changes → suggest grade
  useMemo(() => {
    if (watchBirthday) {
      setSelectedBirthday(watchBirthday);
      const suggested = getGradeFromBirthday(watchBirthday);
      setSuggestedGrade(suggested);
    }
  }, [watchBirthday]);

  // When grade changes → update min/max dates for picker
  useMemo(() => {
    if (watchGrade) {
      setSelectedGrade(watchGrade);
      setMinBirthdayDate(getMinBirthdayForGrade(watchGrade));
      setMaxBirthdayDate(getMaxBirthdayForGrade(watchGrade));
    }
  }, [watchGrade]);

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
                    label="Chọn Lớp"
                    value={field.value}
                    onPress={() => gradeSheetRef.current?.expand()}
                    leftIcon="layers-outline"
                    errorText={errors.grade?.message}
                  />
                  {suggestedGrade && !field.value && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: C.primary,
                        marginTop: 4,
                        fontWeight: "500",
                      }}
                    >
                      💡 Gợi ý: Lớp {suggestedGrade}
                    </Text>
                  )}
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
                    onPress={() => wardSheetRef.current?.expand()}
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
                minDate={minBirthdayDate}
                maxDate={maxBirthdayDate}
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
            disabled={isNavigating}
            onPress={() => handleNavigation("/login")}
            style={{ marginTop: 8, opacity: isNavigating ? 0.5 : 1 }}
          >
            <Text style={{ color: C.primary, fontSize: 15 }}>
              Đã có tài khoản? Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Ward Picker Bottom Sheet */}
      <BottomSheet
        ref={wardSheetRef}
        snapPoints={WARD_SNAP_POINTS}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: C.background }}
        handleIndicatorStyle={{ backgroundColor: C.border }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 12 }}>
          {/* header + title */}
          <View
            style={{
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: C.foreground,
              }}
            >
              Chọn khu vực
            </Text>
          </View>
          {/* body */}
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
            <View style={{ padding: 12, paddingTop: 12, flex: 1 }}>
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
                <Text style={{ color: C.mutedForeground, marginHorizontal: 6 }}>
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      competitorForm.setValue("ward", item.name, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      wardSheetRef.current?.close();
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
        </BottomSheetView>
      </BottomSheet>
      {/* Grade Picker Bottom Sheet */}
      <BottomSheet
        ref={gradeSheetRef}
        snapPoints={GRADE_SNAP_POINTS}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: C.background }}
        handleIndicatorStyle={{ backgroundColor: C.border }}
      >
        <BottomSheetView
          style={{ paddingHorizontal: 16, paddingVertical: 12, flex: 1 }}
        >
          {/* header + title */}
          <View
            style={{
              alignItems: "center",
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: C.foreground,
              }}
            >
              Chọn lớp
            </Text>
          </View>

          {/* content: auto change list/grid + tối đa chiều cao */}
          <FlatList
            data={grades}
            numColumns={GRADE_NUM_COLS}
            keyExtractor={(g) => String(g)}
            scrollEnabled={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: GRADE_GAP,
            }}
            renderItem={({ item: grade }) => {
              const isSuggested = suggestedGrade === String(grade);
              return (
                <TouchableOpacity
                  onPress={() => {
                    competitorForm.setValue("grade", String(grade), {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    gradeSheetRef.current?.close();
                  }}
                  style={{
                    width: `${100 / GRADE_NUM_COLS - 2}%`,
                    height: GRADE_CHIP_SIZE,
                    borderRadius: 14,
                    backgroundColor: C.primary,
                    borderWidth: isSuggested ? 3 : 2,
                    borderColor: isSuggested ? C.accent : C.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOpacity: isSuggested ? 0.2 : 0.1,
                    shadowRadius: isSuggested ? 8 : 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: isSuggested ? 4 : 2,
                    opacity: isSuggested ? 1 : 0.8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "900",
                      color: C.primaryForeground,
                    }}
                  >
                    Lớp {grade}
                  </Text>
                  {isSuggested && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: C.primaryForeground,
                        fontWeight: "600",
                        marginTop: 2,
                      }}
                    >
                      ✓ Gợi ý
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
