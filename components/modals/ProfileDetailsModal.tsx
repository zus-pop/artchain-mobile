import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "./style";

type Scheme = "light" | "dark";

type UserShape = {
  name: string;
  handle: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  followers: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
  user: UserShape;
  achievements?: { id: string; title: string; place: string }[];
  onSave?: (updated: UserShape) => void;
};

const { height: SCREEN_H } = Dimensions.get("window");
const SNAP = { OPEN: 0, DISMISS: SCREEN_H };
const DRAG_CLOSE_THRESHOLD = 120;
const VELOCITY_CLOSE_THRESHOLD = 1.0;
const FOOTER_H = 64;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const COLORFUL = {
  blue: { bg: "rgba(37, 99, 235, 0.12)", fg: "#2563EB" },   // indigo-600
  green: { bg: "rgba(5, 150, 105, 0.12)", fg: "#059669" },  // emerald-600
  purple: { bg: "rgba(147, 51, 234, 0.12)", fg: "#9333EA" },// purple-600
  amber: { bg: "rgba(245, 158, 11, 0.12)", fg: "#F59E0B" }, // amber-500
  pink: { bg: "rgba(219, 39, 119, 0.12)", fg: "#DB2777" },  // pink-600
  sky: { bg: "rgba(2, 132, 199, 0.12)", fg: "#0284C7" },    // sky-600
};

const ProfileDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  scheme,
  user,
  achievements = [],
  onSave,
}) => {
  const C = Colors[scheme];
  const s = styles(C);

  // positions
  const translateY = useRef(new Animated.Value(SNAP.DISMISS)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0);
  const scrollYRef = useRef(0);

  // ---------- FORM STATE ----------
  const [form, setForm] = useState<UserShape>(user);
  const [touched, setTouched] = useState<Record<keyof UserShape, boolean>>({
    name: false,
    handle: false,
    email: false,
    phone: false,
    location: false,
    avatar: false,
    followers: false,
  });

  // reset form khi mở modal với user mới
  useEffect(() => {
    if (visible) {
      setForm(user);
      setTouched({
        name: false,
        handle: false,
        email: false,
        phone: false,
        location: false,
        avatar: false,
        followers: false,
      });
    }
  }, [visible, user]);

  const setField = <K extends keyof UserShape>(key: K, val: UserShape[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof UserShape, string>> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!emailRegex.test(form.email)) e.email = "Email không hợp lệ";
    if (form.phone && form.phone.replace(/\D/g, "").length < 8)
      e.phone = "Số điện thoại chưa đúng";
    return e;
  }, [form]);

  const isDirty = useMemo(() => {
    return (
      form.name !== user.name ||
      form.email !== user.email ||
      form.phone !== user.phone ||
      form.location !== user.location ||
      form.avatar !== user.avatar
    );
  }, [form, user]);

  const canSave = isDirty && Object.keys(errors).length === 0;

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
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragOffset.current = SNAP.DISMISS;
      onClose();
    });
  };

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
  const pickAvatar = async () => {
    // xin quyền
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    // mở thư viện
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setField("avatar", result.assets[0].uri);
      setTouched((t) => ({ ...t, avatar: true }));
    }
  };

  if (!visible) return null;

  const handleSave = () => {
    if (!canSave) return;
    if (onSave) onSave(form);
    closeSheet();
  };

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
                {form.avatar ? (
                  <Image source={{ uri: form.avatar }} style={s.avatar} />
                ) : (
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
                )}

                {/* Nút máy ảnh overlay — bấm để chọn ảnh trong máy */}
                <TouchableOpacity
                  onPress={pickAvatar}
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
                <TextInput
                  value={form.name}
                  onChangeText={(t) => setField("name", t)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Họ và tên"
                  placeholderTextColor={C.mutedForeground}
                  style={[
                    local.input,
                    { color: C.foreground, borderColor: C.border },
                    errors.name && touched.name ? local.inputError : null,
                  ]}
                />
                <View style={local.handleRow}>
                  <Ionicons name="at" size={14} color={COLORFUL.purple.fg} />
                  <Text style={[s.handle, { color: COLORFUL.purple.fg }]} numberOfLines={1}>
                    {form.handle}
                  </Text>
                </View>

                <View style={[s.followChip, { backgroundColor: COLORFUL.green.bg }]}>
                  <Ionicons name="people" size={12} color={COLORFUL.green.fg} />
                  <Text style={[s.followTxt, { color: COLORFUL.green.fg }]}>
                    {user.followers} theo dõi
                  </Text>
                </View>
              </View>
            </View>

            <View style={[s.divider, { marginTop: 2 }]} />

            {/* FORM FIELDS — icon nhiều màu */}
            <View style={s.sectionTight}>
             

              <Field
                icon="mail-outline"
                iconColor={COLORFUL.blue.fg}
                chipColor={COLORFUL.blue}
                label="Email"
                value={form.email}
                onChangeText={(t) => setField("email", t)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                C={C}
                keyboardType="email-address"
                error={touched.email ? errors.email : undefined}
              />

              <Field
                icon="call-outline"
                iconColor={COLORFUL.green.fg}
                chipColor={COLORFUL.green}
                label="Điện thoại"
                value={form.phone}
                onChangeText={(t) => setField("phone", t)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                C={C}
                keyboardType="phone-pad"
                error={touched.phone ? errors.phone : undefined}
              />

              <Field
                icon="location-outline"
                iconColor={COLORFUL.purple.fg}
                chipColor={COLORFUL.purple}
                label="Địa chỉ / Khu vực"
                value={form.location}
                onChangeText={(t) => setField("location", t)}
                onBlur={() => setTouched((t) => ({ ...t, location: true }))}
                C={C}
                placeholder="Phường, Quận"
                last
              />
            </View>

            {achievements.length > 0 && <View style={s.divider} />}

            {/* ACHIEVEMENTS (read-only ở modal này) */}
            {achievements.length > 0 && (
              <View style={s.sectionTight}>
                <Text style={s.sectionTitle}>Thành tích</Text>
                {achievements.map((a, i) => (
                  <DetailRow
                    key={a.id}
                    icon="trophy-outline"
                    label={`${a.title} • ${a.place}`}
                    C={C}
                    tone="amber"
                    last={i === achievements.length - 1}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* FOOTER STICKY */}
          <View
            style={[
              s.footer,
              {
                backgroundColor: C.card,
                borderTopColor: C.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[s.primaryBtn, canSave ? null : { opacity: 0.5 }]}
              onPress={handleSave}
              activeOpacity={0.9}
              disabled={!canSave}
            >
              <Text
                style={[
                  s.primaryTxt,
                  { color: C.primaryForeground, backgroundColor: COLORFUL.blue.fg },
                ]}
              >
                Lưu thay đổi
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
      </View>
    </Modal>
  );
};

/** Ô nhập có label + icon trái, icon nhiều màu */
function Field({
  icon,
  label,
  value,
  onChangeText,
  onBlur,
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
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
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
        <Ionicons name={icon} size={16} color={iconColor ?? C.mutedForeground} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={C.mutedForeground}
          style={[local.input, { color: C.foreground }]}
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

/** Dòng read-only cho thành tích, icon nhiều màu rực hơn */
function DetailRow({
  icon,
  label,
  last,
  C,
  tone = "blue",
}: {
  icon: any;
  label: string;
  last?: boolean;
  C: any;
  tone?: "blue" | "green" | "purple" | "amber";
}) {
  const palette =
    tone === "green"
      ? COLORFUL.green
      : tone === "purple"
      ? COLORFUL.purple
      : tone === "amber"
      ? COLORFUL.amber
      : COLORFUL.blue;

  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: palette.bg,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: palette.fg,
            shadowOpacity: 0.16,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Ionicons name={icon} size={16} color={palette.fg} />
        </View>
        <Text
          style={{ marginLeft: 10, color: C.foreground, flex: 1 }}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>

      <View
        style={[
          {
            height: StyleSheet.hairlineWidth,
            backgroundColor: C.border,
            opacity: 0.9,
            marginTop: 10,
            marginHorizontal: -14,
          },
          last ? { height: 0 } : null,
        ]}
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
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
  
    marginTop: 4,
    justifyContent: "flex-start",
    
  },
});
