import { useWards } from "@/apis/wards";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RegisterRequest } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";

// Type for competitor registration data (subset of RegisterRequest)
type CompetitorFormData = Pick<
  RegisterRequest,
  | "username"
  | "password"
  | "email"
  | "fullName"
  | "schoolName"
  | "grade"
  | "ward"
  | "birthday"
  | "phone"
>;

// Child Schema (based on RegisterRequest fields for competitors)
const childSchema = z.object({
  fullName: z
    .string({ message: "Họ tên là bắt buộc" })
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z
    .string({ message: "Email là bắt buộc" })
    .email("Email không đúng định dạng"),
  username: z
    .string({ message: "Tên đăng nhập là bắt buộc" })
    .trim()
    .min(2, "Tên đăng nhập phải có ít nhất 2 ký tự"),
  password: z
    .string({ message: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  schoolName: z
    .string({ message: "Tên trường là bắt buộc" })
    .trim()
    .min(2, "Tên trường phải có ít nhất 2 ký tự"),
  grade: z
    .string({ message: "Lớp là bắt buộc" })
    .trim()
    .min(1, "Lớp là bắt buộc")
    .refine((val) => ["1", "2", "3", "4", "5"].includes(val), {
      message: "Lớp phải là từ 1 đến 5",
    }),
  ward: z
    .string({ message: "Khu vực là bắt buộc" })
    .trim()
    .min(2, "Khu vực phải có ít nhất 2 ký tự"),
  birthday: z
    .string({ message: "Ngày sinh là bắt buộc" })
    .min(1, "Ngày sinh là bắt buộc"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return /^(0|\+84)[3-9]\d{8}$/.test(val);
      },
      {
        message: "Số điện thoại không đúng định dạng",
      }
    ),
});

type ChildForm = z.infer<typeof childSchema>;

interface AddChildBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    data: CompetitorFormData | (CompetitorFormData & { localId: string })
  ) => void;
  editingChild: (CompetitorFormData & { localId: string }) | null;
}

export default function AddChildBottomSheet({
  visible,
  onClose,
  onSubmit,
  editingChild,
}: AddChildBottomSheetProps) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const [showWardPicker, setShowWardPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const yearScrollRef = useRef<ScrollView>(null);
  const { data: wards = [], isLoading: wardsLoading } = useWards();

  // Scroll to current year when date picker opens
  useEffect(() => {
    if (showDatePicker && yearScrollRef.current) {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 40;
      const currentYearIndex = currentYear - startYear;
      const scrollPosition = Math.max(0, (currentYearIndex - 5) * 60);
      setTimeout(() => {
        yearScrollRef.current?.scrollTo({ x: scrollPosition, animated: false });
      }, 100);
    }
  }, [showDatePicker]);

  // Child form
  const childForm = useForm<ChildForm>({
    mode: "all",
    resolver: zodResolver(childSchema),
    defaultValues: editingChild
      ? {
          fullName: editingChild.fullName,
          email: editingChild.email,
          username: editingChild.username,
          password: editingChild.password,
          schoolName: editingChild.schoolName,
          grade: editingChild.grade,
          ward: editingChild.ward,
          birthday: editingChild.birthday,
          phone: editingChild.phone,
        }
      : undefined,
  });

  // Reset form when editing child changes
  useEffect(() => {
    if (editingChild) {
      childForm.reset({
        fullName: editingChild.fullName,
        email: editingChild.email,
        username: editingChild.username,
        password: editingChild.password,
        schoolName: editingChild.schoolName,
        grade: editingChild.grade,
        ward: editingChild.ward,
        birthday: editingChild.birthday,
        phone: editingChild.phone,
      });
    } else {
      childForm.reset();
    }
  }, [editingChild, childForm]);

  const handleSubmit = (data: ChildForm) => {
    if (editingChild) {
      onSubmit({ ...data, localId: editingChild.localId });
    } else {
      onSubmit(data);
    }
    childForm.reset();
  };

  const handleClose = () => {
    childForm.reset();
    onClose();
  };

  const {
    control,
    formState: { errors },
  } = childForm;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: C.background,
        }}
      >
        {/* Header */}
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
            onPress={handleClose}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Ionicons name="close" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: C.foreground,
              flex: 1,
            }}
          >
            {editingChild ? "Chỉnh sửa thông tin" : "Thêm con em"}
          </Text>
          <TouchableOpacity
            onPress={childForm.handleSubmit(handleSubmit)}
            disabled={!childForm.formState.isValid}
            style={{
              padding: 8,
              opacity: childForm.formState.isValid ? 1 : 0.5,
            }}
          >
            <Text
              style={{
                color: childForm.formState.isValid
                  ? C.primary
                  : C.mutedForeground,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {editingChild ? "Lưu" : "Thêm"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
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
                  borderColor: errors.fullName ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.fullName && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
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
                  borderColor: errors.email ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.email && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
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
                  borderColor: errors.username ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.username && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
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
                autoCapitalize="none"
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.password ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.password && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              {errors.password.message}
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
                  borderColor: errors.schoolName ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.schoolName && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
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
                    borderColor: errors.grade ? C.destructive : C.border,
                    backgroundColor: C.input,
                    borderRadius: 12,
                    marginBottom: 14,
                    padding: 12,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: field.value ? C.foreground : C.mutedForeground,
                      fontSize: 16,
                    }}
                  >
                    {field.value ? `Lớp ${field.value}` : "Chọn lớp"}
                  </Text>
                  <View style={{ position: "absolute", right: 12 }}>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={C.mutedForeground}
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
                    borderColor: errors.ward ? C.destructive : C.border,
                    backgroundColor: C.input,
                    borderRadius: 12,
                    marginBottom: 14,
                    padding: 12,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: field.value ? C.foreground : C.mutedForeground,
                      fontSize: 16,
                    }}
                  >
                    {field.value || "Chọn khu vực"}
                  </Text>
                  <View style={{ position: "absolute", right: 12 }}>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={C.mutedForeground}
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
                    color: C.destructive,
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
                    color: C.destructive,
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
                  borderColor: errors.birthday ? C.destructive : C.border,
                  backgroundColor: C.input,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: field.value ? C.foreground : C.mutedForeground,
                    fontSize: 16,
                  }}
                >
                  {field.value || "Chọn ngày sinh"}
                </Text>
                <View style={{ position: "absolute", right: 12 }}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={C.mutedForeground}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
          {errors.birthday && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              {errors.birthday.message}
            </Text>
          )}

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextInput
                placeholder="Số điện thoại (tùy chọn)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="phone-pad"
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: errors.phone ? C.destructive : C.border,
                  backgroundColor: C.input,
                  color: C.foreground,
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={C.mutedForeground}
              />
            )}
          />
          {errors.phone && (
            <Text
              style={{
                color: C.destructive,
                fontSize: 14,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              {errors.phone.message}
            </Text>
          )}
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
              backgroundColor: C.background,
            }}
          >
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
                      childForm.setValue("ward", item.name, {
                        shouldValidate: true,
                      });
                      setShowWardPicker(false);
                    }}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: C.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: C.foreground,
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
          <View
            style={{
              flex: 1,
              backgroundColor: C.background,
            }}
          >
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

            <View
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {[1, 2, 3, 4, 5].map((grade) => (
                <TouchableOpacity
                  key={grade}
                  onPress={() => {
                    childForm.setValue("grade", grade.toString(), {
                      shouldValidate: true,
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
                  <Text
                    style={{
                      fontSize: 16,
                      color: C.foreground,
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
              backgroundColor: C.background,
            }}
          >
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
                onPress={() => setShowDatePicker(false)}
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
                  childForm.setValue("birthday", formattedDate, {
                    shouldValidate: true,
                  });
                  setShowDatePicker(false);
                }}
                style={{ padding: 8 }}
              >
                <Text
                  style={{
                    color: C.primary,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Xong
                </Text>
              </TouchableOpacity>
            </View>

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
                  backgroundColor: C.card,
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
                    color: C.foreground,
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

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: C.foreground,
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
                            backgroundColor: isSelected ? C.primary : C.muted,
                            minWidth: 50,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? C.primaryForeground
                                : C.foreground,
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

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: C.foreground,
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
                            backgroundColor: isSelected ? C.primary : C.muted,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? C.primaryForeground
                                : C.foreground,
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

                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: C.foreground,
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
                              backgroundColor: isSelected ? C.primary : C.muted,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: isSelected
                                  ? C.primaryForeground
                                  : C.foreground,
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
      </View>
    </Modal>
  );
}
