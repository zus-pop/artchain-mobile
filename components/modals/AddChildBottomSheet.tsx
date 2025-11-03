// components/modals/AddChildBottomSheet.tsx
import { useWards } from "@/apis/wards";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RegisterRequest } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
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
    .refine(
      (val) => ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(val),
      {
        message: "Lớp phải là từ 1 đến 9",
      }
    ),
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
  header: ["hsl(15 85% 55%)", "hsl(25 90% 60%)"] as const, // primary to chart2
  chip: ["hsl(15 60% 95%)", "hsl(15 50% 92%)"] as const, // accent colors
  accent: ["hsl(15 85% 55%)", "hsl(5 80% 55%)"] as const, // primary to chart4
};

/* =========================== Component =========================== */
export type AddChildBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

export default forwardRef<AddChildBottomSheetRef, AddChildBottomSheetProps>(
  function AddChildBottomSheet({ onSubmit, editingChild }, ref) {
    const scheme = useColorScheme() ?? "light";
    const C = Colors[scheme];
    const { dismiss } = useBottomSheetModal();

    const [showWardPicker, setShowWardPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGradePicker, setShowGradePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      },
    }));

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

    const handleSheetDismiss = useCallback(() => {
      dismiss();
    }, [dismiss]);

    const handlePrimarySubmit = (data: ChildForm) => {
      if (editingChild) onSubmit({ ...data, localId: editingChild.localId });
      else onSubmit(data);
      form.reset();
      dismiss();
    };

    const {
      control,
      setValue,
      formState: { isValid, errors },
    } = form;

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ["90%"], []);

    // Render backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.72}
        />
      ),
      []
    );

    // Header đẹp, cố định
    const Header = useMemo(
      () => (
        <View style={[styles.headerSticky, { backgroundColor: C.card }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: C.muted }]} />
            <TouchableOpacity onPress={() => dismiss()} style={styles.closeBtn}>
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
      [C, editingChild, dismiss]
    );

    /* =========================== JSX =========================== */
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={handleSheetDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: C.card }}
        handleIndicatorStyle={{ backgroundColor: C.muted }}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        {/* Header fixed (zIndex) */}
        {Header}

        {/* Nội dung scroll, tránh chạm header */}
        <BottomSheetScrollView
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
                  const currentDate = field.value
                    ? new Date(field.value)
                    : new Date();
                  setSelectedDate(currentDate);
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
              <Text style={[styles.submitTxt, { color: C.primaryForeground }]}>
                {editingChild ? "Lưu thay đổi" : "Thêm vào danh sách"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.helper, { color: C.mutedForeground }]}>
            Dữ liệu của bạn được bảo mật theo điều khoản của ArtChain.
          </Text>
        </BottomSheetScrollView>

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
                      style={{
                        marginLeft: 8,
                        fontSize: 16,
                        color: C.foreground,
                      }}
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                <TouchableOpacity
                  key={grade}
                  onPress={() => {
                    setValue("grade", grade.toString(), {
                      shouldValidate: true,
                    });
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
                    style={{
                      marginLeft: 10,
                      color: C.foreground,
                      fontSize: 16,
                    }}
                  >
                    Lớp {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* ==== Date Picker ==== */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                const formatted = `${date.getFullYear()}-${String(
                  date.getMonth() + 1
                ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                setValue("birthday", formatted, { shouldValidate: true });
              }
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
      </BottomSheetModal>
    );
  }
);

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
});
