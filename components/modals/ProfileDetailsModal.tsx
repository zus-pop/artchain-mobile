import { useUpdateUserById } from "@/apis/user";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import styles from "./style";

type Scheme = "light" | "dark";

/* ===== Helpers convert date ===== */
const toDisplayDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const toISOFromDisplay = (v?: string) => {
  if (!v) return "";
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  if (
    isNaN(d.getTime()) ||
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  )
    return "";
  return d.toISOString();
};
const toDateFromDisplay = (v?: string): Date | undefined => {
  const iso = toISOFromDisplay(v);
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
};

type UserShape = {
  userId: string;
  fullname: string;
  email: string;
  phone: string;
  avatar?: string;
  birthday?: string; // ISO từ BE
  schoolName?: string;
  ward?: string;
  grade?: string;
};

const phoneRegex = /^(?:$|(0|\+84)[3-9]\d{8})$/;
const displayDateRegex = /^(?:$|\d{2}\/\d{2}\/\d{4})$/;

const userSchema = z.object({
  fullname: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || phoneRegex.test(val),
      "Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)",
    ),
  //   avatar: z.string().optional(),
  //   birthday: z
  //     .string()
  //     .optional()
  //     .refine((v) => !v || displayDateRegex.test(v), "Ngày sinh dạng DD/MM/YYYY"),
  //   schoolName: z.string().optional(),
  //   ward: z.string().optional(),
  //   grade: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  user: UserShape;
};

const ProfileDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  user,
}) => {
  const C = Colors[scheme];
  const s = styles(C);

  // Bottom sheet ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Snap points for the bottom sheet - use percentage
  const snapPoints = useMemo(() => ["80%"], []);

  // Control modal visibility with useEffect
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  // ---------- FORM ----------
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: user.fullname,
      email: user.email,
      phone: user.phone ?? "",
      //   avatar: user.avatar,
      //   birthday: toDisplayDate(user.birthday),
      //   schoolName: user.schoolName ?? "",
      //   ward: user.ward ?? "",
      //   grade: user.grade ?? "",
    },
    mode: "all",
  });

  const formValues = watch();

  useEffect(() => {
    if (visible) {
      reset({
        fullname: user.fullname,
        email: user.email,
        phone: user.phone ?? "",
        // avatar: user.avatar,
        // birthday: toDisplayDate(user.birthday),
        // schoolName: user.schoolName ?? "",
        // ward: user.ward ?? "",
        // grade: user.grade ?? "",
      });
    }
  }, [visible, user, reset]);

  const setField = (key: keyof UserFormData, val: any) => {
    setValue(key, val, { shouldDirty: true, shouldValidate: true });
  };

  // DatePicker state
  const [showDP, setShowDP] = useState(false);
  //   const currentBirthdayDate = useMemo(
  //     () => toDateFromDisplay(formValues.birthday) ?? new Date(2008, 0, 1), // mặc định 01/01/2008
  //     [formValues.birthday]
  //   );
  const minDate = new Date(1950, 0, 1);
  const maxDate = new Date(); // không cho chọn quá hiện tại

  const canSave = isValid && Object.keys(errors).length === 0;

  const closeSheet = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const { mutate, isPending } = useUpdateUserById(() => {
    onClose();
  });

  // ---------- IMAGE PICKER ----------
  //   const pickAvatar = async () => {
  //     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (!perm.granted) return;
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ["images"],
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 0.8,
  //       selectionLimit: 1,
  //     });
  //     if (!result.canceled && result.assets?.[0]?.uri) {
  //       setField("avatar", result.assets[0].uri);
  //     }
  //   };

  const handleSave = handleSubmit((data: UserFormData) => {
    // const iso = toISOFromDisplay(data.birthday);
    mutate({
      userId: user.userId,
      email: data.email,
      fullName: data.fullname,
      phone: data.phone,
    });
  });

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: C.card }}
      handleIndicatorStyle={{ backgroundColor: C.mutedForeground }}
      enablePanDownToClose={true}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={{ flex: 1, backgroundColor: C.card }}>
        {/* CONTENT - Scrollable area with footer at bottom */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 14,
            paddingTop: 6,
          }}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          {/* Header */}
          <View style={{ marginBottom: 16 }}>
            <View style={s.headerRow}>
              <Text style={s.title}>Cập nhật hồ sơ</Text>
              <TouchableOpacity
                onPress={closeSheet}
                style={s.iconBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={22} color={C.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={s.divider} />
          </View>

          {/* INFO / AVATAR */}
          <View style={s.infoRow}>
            <View style={[s.avatarRing, { shadowColor: C.mutedForeground }]}>
              <View
                style={[
                  s.avatar,
                  { alignItems: "center", justifyContent: "center" },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color={C.mutedForeground}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  local.camBtn,
                  {
                    backgroundColor: C.primary,
                    borderColor: C.background,
                  },
                ]}
              >
                <Ionicons name="camera" size={14} color={C.primaryForeground} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Controller
                name="fullname"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Họ và tên"
                    placeholderTextColor={C.mutedForeground}
                    style={[
                      local.input,
                      { color: C.foreground, borderColor: C.border },
                      errors.fullname ? local.inputError : null,
                    ]}
                  />
                )}
              />
            </View>
          </View>

          <View style={[s.divider, { marginTop: 2 }]} />

          {/* FORM FIELDS */}
          <View style={s.sectionTight}>
            <Field
              icon="mail-outline"
              iconColor={C.primary}
              chipColor={{ bg: C.card, fg: C.foreground }}
              label="Email"
              name="email"
              control={control}
              C={C}
              keyboardType="email-address"
              error={errors.email?.message}
            />

            <Field
              icon="call-outline"
              iconColor={C.primary}
              chipColor={{ bg: C.card, fg: C.foreground }}
              label="Điện thoại"
              name="phone"
              control={control}
              C={C}
              keyboardType="phone-pad"
              error={errors.phone?.message}
            />
          </View>

          <View style={{ flex: 1, minHeight: 20 }} />

          <View
            style={[
              s.footer,
              {
                backgroundColor: C.card,
                borderTopColor: C.border,
                marginHorizontal: -14,
                marginTop: 20,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: -2 },
                elevation: 3,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                s.primaryBtn,
                canSave && !isPending ? null : { opacity: 0.5 },
              ]}
              onPress={handleSave}
              activeOpacity={0.9}
              disabled={!canSave || isPending}
            >
              <Text
                style={[
                  s.primaryTxt,
                  {
                    color: C.primaryForeground,
                    backgroundColor: C.primary,
                  },
                ]}
              >
                {!isPending ? "Lưu thay đổi" : "...Đang lưu"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.ghostBtn}
              onPress={closeSheet}
              activeOpacity={0.9}
            >
              <Text style={[s.ghostTxt, { color: C.mutedForeground }]}>
                Huỷ
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

function Field({
  icon,
  label,
  name,
  control,
  C,
  keyboardType,
  placeholder,
  error,
  last,
  iconColor,
  chipColor,
}: {
  icon: keyof typeof Ionicons.glyphMap | any;
  label: string;
  name: keyof UserFormData;
  control: any;
  C: any;
  keyboardType?: "default" | "email-address" | "phone-pad";
  placeholder?: string;
  error?: string;
  last?: boolean;
  iconColor?: string;
  chipColor?: { bg: string; fg: string };
}) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={[local.label, { color: C.mutedForeground }]}>{label}</Text>
      <View
        style={[
          local.row,
          { borderColor: C.border, backgroundColor: chipColor?.bg ?? C.card },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={iconColor ?? C.mutedForeground}
        />
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor={C.mutedForeground}
              style={[local.input, { color: C.foreground }]}
            />
          )}
        />
      </View>
      {!!error && (
        <Text style={[local.err, { color: C.destructive ?? "#EF4444" }]}>
          {error}
        </Text>
      )}
      {!last && (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: C.border,
            opacity: 0.9,
            marginTop: 10,
            marginHorizontal: -14,
          }}
        />
      )}
    </View>
  );
}

export default ProfileDetailsModal;

const local = StyleSheet.create({
  camBtn: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontWeight: "600",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    opacity: 0.8,
  },
  err: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
});
