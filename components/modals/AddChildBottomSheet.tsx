// components/modals/AddChildBottomSheet.tsx
import { useWards } from "@/apis/wards";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RegisterRequest } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as z from "zod";

/* =========================== Types =========================== */
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

export type AddChildBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    data: CompetitorFormData | (CompetitorFormData & { localId: string })
  ) => void;
  editingChild: (CompetitorFormData & { localId: string }) | null;
};

/* =========================== Schema =========================== */
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
      { message: "Số điện thoại không đúng định dạng" }
    ),
});
type ChildForm = z.infer<typeof childSchema>;

/* =========================== UI Tokens =========================== */
const GRAD = {
  header: ["#7C3AED", "#5BBAFF"] as const,
  chip: ["#EEF2FF", "#ECFEFF"] as const,
  accent: ["#34D399", "#06B6D4"] as const,
};

/* =========================== Component =========================== */
export default function AddChildBottomSheet({
  visible,
  onClose,
  onSubmit,
  editingChild,
}: AddChildBottomSheetProps) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [showWardPicker, setShowWardPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    data: wards = [],
    isLoading: wardsLoading,
    refetch: refetchWards,
  } = useWards();

  const form = useForm<ChildForm>({
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

  // Reset theo editingChild
  useEffect(() => {
    if (editingChild) {
      form.reset({
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
      form.reset();
    }
  }, [editingChild, form]);

  /* ===== Smooth Animations: backdrop (opacity) + sheet (translateY) ===== */
  const screenH = Dimensions.get("window").height;
  const sheetH = Math.round(screenH * 0.86);

  const anim = useRef(new Animated.Value(0)).current; // 0=hidden, 1=shown
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.72],
  });
  const sheetTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetH, 0],
  });

  const openAnim = () =>
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

  const closeAnim = (cb?: () => void) =>
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => cb?.());

  useEffect(() => {
    if (visible) openAnim();
    // khi ẩn sẽ để Modal tự đóng nhờ caller đổi "visible"
  }, [visible]);

  const handleRequestClose = () => {
    closeAnim(onClose);
  };

  const handlePrimarySubmit = (data: ChildForm) => {
    if (editingChild) onSubmit({ ...data, localId: editingChild.localId });
    else onSubmit(data);
    form.reset();
    closeAnim(onClose);
  };

  const {
    control,
    setValue,
    formState: { isValid, errors },
  } = form;

  // Header đẹp, cố định
  const Header = useMemo(
    () => (
      <View style={[styles.headerSticky, { backgroundColor: C.card }]}>
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: C.muted }]} />
          <TouchableOpacity
            onPress={handleRequestClose}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={C.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleWrap}>
          <LinearGradient
            colors={GRAD.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerPill}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.headerPillText}>
              {editingChild ? "Chỉnh sửa thông tin" : "Thêm con em"}
            </Text>
          </LinearGradient>
        </View>
      </View>
    ),
    [C, editingChild]
  );

  /* =========================== JSX =========================== */
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      {/* Backdrop xám mờ */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#111827" }, // gray-900
          { opacity: backdropOpacity },
        ]}
      />
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleRequestClose}
        style={StyleSheet.absoluteFill}
      />

      {/* SHEET trượt mượt */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex1}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetH,
              backgroundColor: C.card,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {/* Header fixed (zIndex) */}
          {Header}

          {/* Nội dung scroll, tránh chạm header */}
          <ScrollView
            contentContainerStyle={styles.contentPad}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* FULL NAME */}
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Field
                  label="Họ và tên"
                  placeholder="Nhập họ tên đầy đủ"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.fullName?.message}
                  C={C}
                  leftIcon="person-outline"
                />
              )}
            />

            {/* EMAIL */}
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field
                  label="Email"
                  placeholder="name@example.com"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  C={C}
                  leftIcon="mail-outline"
                />
              )}
            />

            {/* USERNAME */}
            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <Field
                  label="Tên đăng nhập"
                  placeholder="ten_dang_nhap"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="none"
                  error={errors.username?.message}
                  C={C}
                  leftIcon="at-outline"
                />
              )}
            />

            {/* PASSWORD */}
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Field
                  label="Mật khẩu"
                  placeholder="••••••••"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
                  C={C}
                  leftIcon="lock-closed-outline"
                />
              )}
            />

            {/* SCHOOL */}
            <Controller
              control={control}
              name="schoolName"
              render={({ field }) => (
                <Field
                  label="Trường học"
                  placeholder="VD: Tiểu học Nguyễn Du"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.schoolName?.message}
                  C={C}
                  leftIcon="school-outline"
                />
              )}
            />

            {/* GRADE + WARD */}
            <View style={styles.rowGap8}>
              <Controller
                control={control}
                name="grade"
                render={({ field }) => (
                  <PickerField
                    label="Lớp"
                    value={field.value ? `Lớp ${field.value}` : ""}
                    placeholder="Chọn lớp"
                    onPress={() => setShowGradePicker(true)}
                    error={errors.grade?.message}
                    C={C}
                    leftIcon="library-outline"
                  />
                )}
              />
              <Controller
                control={control}
                name="ward"
                render={({ field }) => (
                  <PickerField
                    label="Khu vực"
                    value={field.value}
                    placeholder="Chọn khu vực"
                    onPress={() => {
                      refetchWards();
                      setShowWardPicker(true);
                    }}
                    error={errors.ward?.message}
                    C={C}
                    leftIcon="location-outline"
                  />
                )}
              />
            </View>

            {/* BIRTHDAY */}
            <Controller
              control={control}
              name="birthday"
              render={({ field }) => (
                <PickerField
                  label="Ngày sinh"
                  value={field.value}
                  placeholder="Chọn ngày sinh"
                  onPress={() => {
                    setSelectedDate(new Date());
                    setShowDatePicker(true);
                  }}
                  error={errors.birthday?.message}
                  C={C}
                  leftIcon="calendar-outline"
                />
              )}
            />

            {/* PHONE */}
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Field
                  label="Số điện thoại (tùy chọn)"
                  placeholder="VD: 09xxxxxxxx"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                  C={C}
                  leftIcon="call-outline"
                />
              )}
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={form.handleSubmit(handlePrimarySubmit)}
              disabled={!isValid}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: isValid
                    ? C.primary
                    : withOpacity(C.muted, 0.6),
                },
              ]}
            >
              <LinearGradient
                colors={GRAD.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.submitGrad,
                  {
                    opacity: isValid ? 1 : 0.65,
                    borderColor: withOpacity("#fff", 0.25),
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={C.primaryForeground}
                />
                <Text
                  style={[styles.submitTxt, { color: C.primaryForeground }]}
                >
                  {editingChild ? "Lưu thay đổi" : "Thêm vào danh sách"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.helper, { color: C.mutedForeground }]}>
              Dữ liệu của bạn được bảo mật theo điều khoản của ArtChain.
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* ==== Ward Picker ==== */}
      <Modal
        visible={showWardPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWardPicker(false)}
      >
        <View style={[styles.flex1, { backgroundColor: C.background }]}>
          <HeaderBar
            C={C}
            title="Chọn khu vực"
            onClose={() => setShowWardPicker(false)}
          />
          {wardsLoading ? (
            <View style={styles.centerAll}>
              <Text style={{ color: C.mutedForeground }}>
                Đang tải danh sách khu vực...
              </Text>
            </View>
          ) : (
            <FlatList
              data={wards}
              keyExtractor={(item) => item.code}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: C.border }} />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setValue("ward", item.name, { shouldValidate: true });
                    setShowWardPicker(false);
                  }}
                  style={styles.rowItem}
                >
                  <Ionicons
                    name="navigate-outline"
                    size={16}
                    color={C.mutedForeground}
                  />
                  <Text
                    style={{ marginLeft: 8, fontSize: 16, color: C.foreground }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={[styles.centerAll, { padding: 32 }]}>
                  <Text style={{ color: C.mutedForeground }}>
                    Không có dữ liệu khu vực
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      {/* ==== Grade Picker ==== */}
      <Modal
        visible={showGradePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGradePicker(false)}
      >
        <View style={[styles.flex1, { backgroundColor: C.background }]}>
          <HeaderBar
            C={C}
            title="Chọn lớp"
            onClose={() => setShowGradePicker(false)}
          />
          <View style={{ flex: 1, padding: 16 }}>
            {[1, 2, 3, 4, 5].map((grade) => (
              <TouchableOpacity
                key={grade}
                onPress={() => {
                  setValue("grade", grade.toString(), { shouldValidate: true });
                  setShowGradePicker(false);
                }}
                style={[
                  styles.rowItem,
                  {
                    backgroundColor: C.card,
                    borderRadius: 10,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: C.border,
                  },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={18}
                  color={C.mutedForeground}
                />
                <Text
                  style={{ marginLeft: 10, color: C.foreground, fontSize: 16 }}
                >
                  Lớp {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ==== Date Picker (custom simple) ==== */}
      <DatePickerModal
        C={C}
        visible={showDatePicker}
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        onCancel={() => setShowDatePicker(false)}
        onDone={() => {
          const formatted = `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1
          ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
            2,
            "0"
          )}`;
          setValue("birthday", formatted, { shouldValidate: true });
          setShowDatePicker(false);
        }}
      />
    </Modal>
  );
}

/* =========================== Subcomponents =========================== */

function HeaderBar({
  C,
  title,
  onClose,
}: {
  C: any;
  title: string;
  onClose: () => void;
}) {
  return (
    <View
      style={[
        styles.headerBar,
        { backgroundColor: C.card, borderBottomColor: C.border },
      ]}
    >
      <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
        <Ionicons name="close" size={22} color={C.primary} />
      </TouchableOpacity>
      <Text style={[styles.headerText, { color: C.foreground }]}>{title}</Text>
      <View style={styles.headerIcon} />
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  C,
  leftIcon,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  C: any;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: C.mutedForeground }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: error ? C.destructive : C.border,
            backgroundColor: C.input,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={18}
            color={error ? C.destructive : C.mutedForeground}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={withOpacity(C.mutedForeground, 0.8)}
          style={[styles.input, { color: C.foreground }]}
        />
      </View>
      {error ? (
        <Text style={[styles.errTxt, { color: C.destructive }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function PickerField({
  label,
  value,
  placeholder,
  onPress,
  error,
  C,
  leftIcon,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  C: any;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ flex: 1, marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: C.mutedForeground }]}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.pickerWrap,
          {
            borderColor: error ? C.destructive : C.border,
            backgroundColor: C.input,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={18}
            color={error ? C.destructive : C.mutedForeground}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.pickerText,
            {
              color: value ? C.foreground : withOpacity(C.mutedForeground, 0.9),
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={C.mutedForeground} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errTxt, { color: C.destructive }]}>{error}</Text>
      ) : null}
    </View>
  );
}

/* --- Date Picker Modal (keep pretty) --- */
function DatePickerModal({
  C,
  visible,
  selectedDate,
  onChangeDate,
  onCancel,
  onDone,
}: {
  C: any;
  visible: boolean;
  selectedDate: Date;
  onChangeDate: (d: Date) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  const YEARS_WINDOW = 50;
  const yearScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && yearScrollRef.current) {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 40;
      const currentYearIndex = currentYear - startYear;
      const scrollPosition = Math.max(0, (currentYearIndex - 5) * 60);
      setTimeout(() => {
        yearScrollRef.current?.scrollTo({ x: scrollPosition, animated: false });
      }, 80);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[styles.flex1, { backgroundColor: C.background }]}>
        <View
          style={[
            styles.headerBar,
            { backgroundColor: C.card, borderBottomColor: C.border },
          ]}
        >
          <TouchableOpacity onPress={onCancel} style={styles.headerIcon}>
            <Ionicons name="close" size={22} color={C.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: C.foreground }]}>
            Chọn ngày sinh
          </Text>
          <TouchableOpacity onPress={onDone} style={styles.headerIcon}>
            <Text
              style={{ color: C.primary, fontWeight: "bold", fontSize: 16 }}
            >
              Xong
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.centerAll, { padding: 18 }]}>
          <View
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: C.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <LinearGradient
              colors={GRAD.chip}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 10,
                paddingVertical: 10,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "700",
                  color: C.foreground,
                }}
              >
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </LinearGradient>

            {/* Year */}
            <Text style={[styles.sectionTitle, { color: C.foreground }]}>
              Năm
            </Text>
            <ScrollView
              ref={yearScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              style={{ marginBottom: 12 }}
            >
              {Array.from({ length: YEARS_WINDOW }, (_, i) => {
                const year = new Date().getFullYear() - 40 + i;
                const sel = selectedDate.getFullYear() === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => {
                      const nd = new Date(selectedDate);
                      nd.setFullYear(year);
                      onChangeDate(nd);
                    }}
                    style={[
                      styles.yearChip,
                      {
                        backgroundColor: sel ? C.primary : C.muted,
                        borderColor: sel
                          ? withOpacity("#fff", 0.35)
                          : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: sel ? C.primaryForeground : C.foreground,
                        fontWeight: sel ? "800" : "500",
                      }}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Month */}
            <Text style={[styles.sectionTitle, { color: C.foreground }]}>
              Tháng
            </Text>
            <View style={styles.monthWrap}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const sel = selectedDate.getMonth() === i;
                return (
                  <TouchableOpacity
                    key={month}
                    onPress={() => {
                      const nd = new Date(selectedDate);
                      nd.setMonth(i);
                      onChangeDate(nd);
                    }}
                    style={[
                      styles.monthCell,
                      { backgroundColor: sel ? C.primary : C.muted },
                    ]}
                  >
                    <Text
                      style={{
                        color: sel ? C.primaryForeground : C.foreground,
                        fontWeight: sel ? "800" : "500",
                      }}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Day */}
            <Text style={[styles.sectionTitle, { color: C.foreground }]}>
              Ngày
            </Text>
            <View style={styles.daysWrap}>
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
                  const sel = selectedDate.getDate() === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        const nd = new Date(selectedDate);
                        nd.setDate(day);
                        onChangeDate(nd);
                      }}
                      style={[
                        styles.dayCell,
                        { backgroundColor: sel ? C.primary : C.muted },
                      ]}
                    >
                      <Text
                        style={{
                          color: sel ? C.primaryForeground : C.foreground,
                          fontWeight: sel ? "800" : "500",
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
    </Modal>
  );
}

/* =========================== Styles =========================== */
const styles = StyleSheet.create({
  flex1: { flex: 1 },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },

  /* Header cố định để scroll không “đè màu” */
  headerSticky: {
    zIndex: 5,
    paddingBottom: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  handleRow: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 6,
    padding: 8,
  },
  headerTitleWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerPillText: { color: "#FFFFFF", fontWeight: "700" },

  contentPad: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 6,
  },

  fieldLabel: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 16 },

  pickerWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  pickerText: { flex: 1, fontSize: 16 },

  errTxt: { fontSize: 12, marginTop: 6 },

  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  submitGrad: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitTxt: { fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },

  helper: { textAlign: "center", marginTop: 10, fontSize: 12 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerIcon: { padding: 8, width: 40, alignItems: "center" },
  headerText: { flex: 1, textAlign: "center", fontWeight: "800", fontSize: 18 },

  centerAll: { flex: 1, alignItems: "center", justifyContent: "center" },

  rowItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  rowGap8: { flexDirection: "row", gap: 8 },

  sectionTitle: { fontWeight: "800", marginBottom: 8 },

  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    minWidth: 56,
    alignItems: "center",
  },
  monthWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  monthCell: {
    width: "22%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  daysWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  dayCell: {
    width: "12%",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
});
