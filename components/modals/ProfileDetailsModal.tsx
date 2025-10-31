// components/modals/ProfileDetailsModal/index.tsx
import { useUpdateUserById } from "@/apis/user";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
      "Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)"
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

const { height: SCREEN_H } = Dimensions.get("window");
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;
const FOOTER_H = 360;

const COLORFUL = {
  blue: { bg: "rgba(37, 99, 235, 0.12)", fg: "#2563EB" },
  green: { bg: "rgba(5, 150, 105, 0.12)", fg: "#059669" },
  purple: { bg: "rgba(147, 51, 234, 0.12)", fg: "#9333EA" },
  amber: { bg: "rgba(245, 158, 11, 0.12)", fg: "#F59E0B" },
  pink: { bg: "rgba(219, 39, 119, 0.12)", fg: "#DB2777" },
  sky: { bg: "rgba(2, 132, 199, 0.12)", fg: "#0284C7" },
};

const ProfileDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  user,
}) => {
  const C = Colors[scheme];
  const s = styles(C);

  // positions
  const translateY = useRef(new Animated.Value(SNAP.DISMISS)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);
  const scrollYRef = useRef(0);

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

  // ---------- SHEET ANIM ----------
  const openSheet = () => {
    translateY.setValue(SNAP.DISMISS);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.OPEN,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.OPEN;
    });
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SNAP.DISMISS,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.85,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.DISMISS;
      onClose();
    });
  };
  const { mutate, isPending } = useUpdateUserById(closeSheet);

  const animateTo = (to: number) => {
    if (to === SNAP.DISMISS) return closeSheet();
    Animated.spring(translateY, {
      toValue: to,
      useNativeDriver: true,
      stiffness: 180,
      damping: 22,
      mass: 0.8,
    }).start(() => (dragOffset.current = to));
  };

  useEffect(() => {
    if (visible) requestAnimationFrame(openSheet);
  }, [visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const isVertical = Math.abs(g.dy) > Math.abs(g.dx);
          const pullingDown = g.dy > 5;
          const canGrab =
            scrollYRef.current <= 0 || dragOffset.current > SNAP.OPEN;
          return isVertical && pullingDown && canGrab;
        },
        onPanResponderGrant: () => translateY.stopAnimation(),
        onPanResponderMove: (_, g) => {
          const next = Math.max(SNAP.OPEN, dragOffset.current + g.dy);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const endY = dragOffset.current + g.dy;
          const shouldClose =
            g.vy > VELOCITY_CLOSE_THRESHOLD || endY > DRAG_CLOSE_THRESHOLD;
          animateTo(shouldClose ? SNAP.DISMISS : SNAP.OPEN);
        },
      }),
    []
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  };

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

  if (!visible) return null;

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
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={s.wrap}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <Animated.View
          style={[s.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View>
            <View style={s.grabberWrap}>
              <View style={s.grabber} />
            </View>

            <View style={s.headerRow}>
              <Text style={s.title}>Cập nhật hồ sơ</Text>
              <TouchableOpacity
                onPress={closeSheet}
                style={s.iconBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={22} color={COLORFUL.pink.fg} />
              </TouchableOpacity>
            </View>

            <View style={s.divider} />
          </View>

          {/* CONTENT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: FOOTER_H + 16 }}
            keyboardShouldPersistTaps="handled"
            bounces
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {/* INFO / AVATAR */}
            <View style={s.infoRow}>
              <View style={[s.avatarRing, { shadowColor: COLORFUL.sky.fg }]}>
                <View
                  style={[
                    s.avatar,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color={COLORFUL.sky.fg}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    local.camBtn,
                    {
                      backgroundColor: COLORFUL.blue.fg,
                      borderColor: C.background,
                    },
                  ]}
                >
                  <Ionicons name="camera" size={14} color={"#fff"} />
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
                iconColor={COLORFUL.blue.fg}
                chipColor={COLORFUL.blue}
                label="Email"
                name="email"
                control={control}
                C={C}
                keyboardType="email-address"
                error={errors.email?.message}
              />

              <Field
                icon="call-outline"
                iconColor={COLORFUL.green.fg}
                chipColor={COLORFUL.green}
                label="Điện thoại"
                name="phone"
                control={control}
                C={C}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />

              {/* Ngày sinh thân thiện */}
              {/* <BirthdayField
                value={formValues.birthday}
                onOpen={() => setShowDP(true)}
                error={errors.birthday?.message}
                C={C}
              />

              <Field
                icon="school-outline"
                iconColor={COLORFUL.sky.fg}
                chipColor={COLORFUL.sky}
                label="Trường"
                name="schoolName"
                control={control}
                C={C}
                keyboardType="default"
                error={errors.schoolName?.message}
              />

              <Field
                icon="location-outline"
                iconColor={COLORFUL.amber.fg}
                chipColor={COLORFUL.amber}
                label="Phường / Xã"
                name="ward"
                control={control}
                C={C}
                keyboardType="default"
                error={errors.ward?.message}
              />

              <Field
                icon="ribbon-outline"
                iconColor={COLORFUL.pink.fg}
                chipColor={COLORFUL.pink}
                label="Khối / Lớp"
                name="grade"
                control={control}
                C={C}
                keyboardType="default"
                error={errors.grade?.message}
                last
              /> */}
            </View>
          </ScrollView>

          {/* FOOTER STICKY */}
          <View
            style={[
              s.footer,
              { backgroundColor: C.card, borderTopColor: C.border },
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
                    backgroundColor: COLORFUL.blue.fg,
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
              <Text style={[s.ghostTxt, { color: COLORFUL.pink.fg }]}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* DateTimePicker (Android: hiển thị pop-up; iOS: inline modal của hệ thống) */}
        {/* {showDP && (
          <DateTimePicker
            mode="date"
            value={currentBirthdayDate}
            maximumDate={maxDate}
            minimumDate={minDate}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              // Android: khi người dùng bấm Cancel, date sẽ undefined => chỉ đóng
              if (!date) {
                setShowDP(false);
                return;
              }
              const dd = `${date.getDate()}`.padStart(2, "0");
              const mm = `${date.getMonth() + 1}`.padStart(2, "0");
              const yyyy = date.getFullYear();
              setField("birthday", `${dd}/${mm}/${yyyy}`);

              // Android sẽ tự đóng, iOS cần tự đóng (tùy UX, ở đây cũng đóng)
              if (Platform.OS === "android") setShowDP(false);
            }}
            onTouchCancel={() => setShowDP(false)}
          />
        )} */}
      </View>
    </Modal>
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

/** Trường ngày sinh thân thiện: bấm để mở DatePicker, không bật bàn phím */
function BirthdayField({
  value,
  onOpen,
  error,
  C,
}: {
  value?: string;
  onOpen: () => void;
  error?: string;
  C: any;
}) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={[local.label, { color: C.mutedForeground }]}>Ngày sinh</Text>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          local.row,
          {
            borderColor: C.border,
            backgroundColor: "rgba(147, 51, 234, 0.12)", // tím nhẹ
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={16} color={"#9333EA"} />
        <Text
          style={[local.input, { color: C.foreground, paddingVertical: 0 }]}
        >
          {value || "Chọn ngày…"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={C.mutedForeground} />
      </Pressable>
      {!!error && (
        <Text style={[local.err, { color: C.destructive ?? "#EF4444" }]}>
          {error}
        </Text>
      )}
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: C.border,
          opacity: 0.9,
          marginTop: 10,
          marginHorizontal: -14,
        }}
      />
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
