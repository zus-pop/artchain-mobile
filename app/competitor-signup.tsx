import { useSignInMutation } from "@/apis/auth";
import { useWards } from "@/apis/wards";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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

// Competitor Schema
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const yearScrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const { mutate, isPending } = useSignInMutation();
  const { data: wards = [], isLoading: wardsLoading } = useWards();

  // Scroll to current year when date picker opens
  useEffect(() => {
    if (showDatePicker && yearScrollRef.current) {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 40; // Show 40 years back
      const currentYearIndex = currentYear - startYear;
      // Scroll to position showing current year in the middle
      const scrollPosition = Math.max(0, (currentYearIndex - 5) * 60); // Approximate button width
      setTimeout(() => {
        yearScrollRef.current?.scrollTo({ x: scrollPosition, animated: false });
      }, 100);
    }
  }, [showDatePicker]);

  // Competitor form
  const competitorForm = useForm<CompetitorForm>({
    mode: "all",
    resolver: zodResolver(competitorSchema),
  });

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

  const {
    control,
    formState: { errors },
  } = competitorForm;

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
              fontSize: 20,
              fontWeight: "bold",
              color: Colors[colorScheme].foreground,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Đăng ký Người tham gia
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: Colors[colorScheme].mutedForeground,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Điền thông tin để tham gia các cuộc thi nghệ thuật
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
            name="schoolName"
            render={({ field }) => (
              <TextInput
                placeholder="Tên trường học"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.schoolName
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
          {errors.schoolName && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.schoolName.message}
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <TouchableOpacity
                  onPress={() => setShowGradePicker(true)}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: errors.grade
                      ? Colors[colorScheme].destructive
                      : Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].input,
                    borderRadius: 12,
                    marginBottom: 14,
                    padding: 12,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: field.value
                        ? Colors[colorScheme].foreground
                        : Colors[colorScheme].mutedForeground,
                      fontSize: 16,
                    }}
                  >
                    {field.value || "Chọn lớp"}
                  </Text>
                  <View style={{ position: "absolute", right: 12 }}>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={Colors[colorScheme].mutedForeground}
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
            <Controller
              control={control}
              name="ward"
              render={({ field }) => (
                <TouchableOpacity
                  onPress={() => setShowWardPicker(true)}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: errors.ward
                      ? Colors[colorScheme].destructive
                      : Colors[colorScheme].border,
                    backgroundColor: Colors[colorScheme].input,
                    borderRadius: 12,
                    marginBottom: 14,
                    padding: 12,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: field.value
                        ? Colors[colorScheme].foreground
                        : Colors[colorScheme].mutedForeground,
                      fontSize: 16,
                    }}
                  >
                    {field.value || "Chọn khu vực"}
                  </Text>
                  <View style={{ position: "absolute", right: 12 }}>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={Colors[colorScheme].mutedForeground}
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
          {(errors.grade || errors.ward) && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              {errors.grade && (
                <Text
                  style={{
                    color: Colors[colorScheme].destructive,
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {errors.grade.message}
                </Text>
              )}
              {errors.ward && (
                <Text
                  style={{
                    color: Colors[colorScheme].destructive,
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {errors.ward.message}
                </Text>
              )}
            </View>
          )}

          <Controller
            control={control}
            name="birthday"
            render={({ field }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(new Date());
                  setShowDatePicker(true);
                }}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.birthday
                    ? Colors[colorScheme].destructive
                    : Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].input,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: field.value
                      ? Colors[colorScheme].foreground
                      : Colors[colorScheme].mutedForeground,
                    fontSize: 16,
                  }}
                >
                  {field.value || "Chọn ngày sinh"}
                </Text>
                <View style={{ position: "absolute", right: 12 }}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={Colors[colorScheme].mutedForeground}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
          {errors.birthday && (
            <Text
              style={{
                color: Colors[colorScheme].destructive,
                fontSize: 14,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginLeft: 4,
              }}
            >
              {errors.birthday.message}
            </Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <View style={{ width: "100%", position: "relative" }}>
                <TextInput
                  placeholder="Mật khẩu"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry={!showPassword}
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
                    paddingRight: 50,
                    fontSize: 16,
                  }}
                  placeholderTextColor={Colors[colorScheme].mutedForeground}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: [{ translateY: -20 }],
                    padding: 4,
                  }}
                >
                  <Ionicons
                    name={!showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors[colorScheme].mutedForeground}
                  />
                </TouchableOpacity>
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <View style={{ width: "100%", position: "relative" }}>
                <TextInput
                  placeholder="Xác nhận mật khẩu"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry={!showConfirmPassword}
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
                    paddingRight: 50,
                    fontSize: 16,
                  }}
                  placeholderTextColor={Colors[colorScheme].mutedForeground}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: [{ translateY: -20 }],
                    padding: 4,
                  }}
                >
                  <Ionicons
                    name={!showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors[colorScheme].mutedForeground}
                  />
                </TouchableOpacity>
              </View>
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
                competitorForm.formState.isValid && !isPending
                  ? Colors[colorScheme].primary
                  : Colors[colorScheme].muted,
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

      {/* Ward Picker Modal */}
      <Modal
        visible={showWardPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWardPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors[colorScheme].card,
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors[colorScheme].border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowWardPicker(false)}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].primary}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors[colorScheme].foreground,
                flex: 1,
              }}
            >
              Chọn khu vực
            </Text>
          </View>

          {/* Ward List */}
          {wardsLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors[colorScheme].mutedForeground }}>
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
                    competitorForm.setValue("ward", item.name);
                    setShowWardPicker(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors[colorScheme].border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors[colorScheme].foreground,
                    }}
                  >
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
                  <Text style={{ color: Colors[colorScheme].mutedForeground }}>
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
        <View
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors[colorScheme].card,
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors[colorScheme].border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowGradePicker(false)}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].primary}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors[colorScheme].foreground,
                flex: 1,
              }}
            >
              Chọn lớp
            </Text>
          </View>

          {/* Grade List */}
          <View
            style={{
              flex: 1,
              padding: 20,
            }}
          >
            {[6, 7, 8, 9].map((grade) => (
              <TouchableOpacity
                key={grade}
                onPress={() => {
                  competitorForm.setValue("grade", grade.toString(), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setShowGradePicker(false);
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].card,
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors[colorScheme].foreground,
                  }}
                >
                  Lớp {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors[colorScheme].card,
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors[colorScheme].border,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].primary}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors[colorScheme].foreground,
                flex: 1,
              }}
            >
              Chọn ngày sinh
            </Text>
            <TouchableOpacity
              onPress={() => {
                const formattedDate = `${selectedDate.getFullYear()}-${String(
                  selectedDate.getMonth() + 1
                ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                  2,
                  "0"
                )}`;
                competitorForm.setValue("birthday", formattedDate);
                setShowDatePicker(false);
              }}
              style={{ padding: 8 }}
            >
              <Text
                style={{
                  color: Colors[colorScheme].primary,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Xong
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Content */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: Colors[colorScheme].card,
                borderRadius: 12,
                padding: 20,
                width: "100%",
                maxWidth: 300,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: Colors[colorScheme].foreground,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>

              {/* Year Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors[colorScheme].foreground,
                    marginBottom: 8,
                  }}
                >
                  Năm
                </Text>
                <ScrollView
                  ref={yearScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                >
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - 40 + i;
                    const isSelected = selectedDate.getFullYear() === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setFullYear(year);
                          setSelectedDate(newDate);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginHorizontal: 2,
                          borderRadius: 6,
                          backgroundColor: isSelected
                            ? Colors[colorScheme].primary
                            : Colors[colorScheme].muted,
                          minWidth: 50,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? Colors[colorScheme].primaryForeground
                              : Colors[colorScheme].foreground,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: 14,
                          }}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors[colorScheme].foreground,
                    marginBottom: 8,
                  }}
                >
                  Tháng
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const isSelected = selectedDate.getMonth() === i;
                    return (
                      <TouchableOpacity
                        key={month}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setMonth(i);
                          setSelectedDate(newDate);
                        }}
                        style={{
                          width: "22%",
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: isSelected
                            ? Colors[colorScheme].primary
                            : Colors[colorScheme].muted,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? Colors[colorScheme].primaryForeground
                              : Colors[colorScheme].foreground,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: 14,
                          }}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Day Picker */}
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors[colorScheme].foreground,
                    marginBottom: 8,
                  }}
                >
                  Ngày
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}
                >
                  {Array.from(
                    {
                      length: new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        0
                      ).getDate(),
                    },
                    (_, i) => {
                      const day = i + 1;
                      const isSelected = selectedDate.getDate() === day;
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setDate(day);
                            setSelectedDate(newDate);
                          }}
                          style={{
                            width: "12%",
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: isSelected
                              ? Colors[colorScheme].primary
                              : Colors[colorScheme].muted,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? Colors[colorScheme].primaryForeground
                                : Colors[colorScheme].foreground,
                              fontWeight: isSelected ? "bold" : "normal",
                              fontSize: 12,
                            }}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
