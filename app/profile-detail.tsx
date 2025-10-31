// app/profile-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import myAxios from "@/constants/custom-axios";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

/* ================= Helpers ================= */
const center: ViewStyle = { alignItems: "center", justifyContent: "center" };
const HEADER_H = 56;

const toAlpha = (hex: string, a: number) => {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

type Grad = readonly [ColorValue, ColorValue];
const asGrad = (a: ColorValue, b: ColorValue): Grad => [a, b] as const;

/* ============== Floating Orbs ============== */
function FloatingOrbs({ C }: { C: ColorTokens }) {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: 3500,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    loop(t1, 0);
    loop(t2, 400);
    loop(t3, 800);
  }, [t1, t2, t3]);

  const tr = (v: Animated.Value, dist: number) =>
    [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -dist],
        }),
      },
      {
        translateX: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dist / 2],
        }),
      },
    ] as const;

  const gPink: Grad = asGrad("#f9a8d4", "#f472b6");
  const gIndigo: Grad = asGrad("#818cf8", "#6366f1");
  const gCyan: Grad = asGrad("#67e8f9", "#22d3ee");

  return (
    <>
      <Animated.View
        style={[orbStyles.orb, orbStyles.orbTL, { transform: tr(t1, 18) }]}
      >
        <LinearGradient
          colors={gPink}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={orbStyles.fill}
        />
      </Animated.View>
      <Animated.View
        style={[orbStyles.orb, orbStyles.orbTR, { transform: tr(t2, 22) }]}
      >
        <LinearGradient
          colors={gIndigo}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={orbStyles.fill}
        />
      </Animated.View>
      <Animated.View
        style={[orbStyles.orb, orbStyles.orbBR, { transform: tr(t3, 20) }]}
      >
        <LinearGradient
          colors={gCyan}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={orbStyles.fill}
        />
      </Animated.View>
    </>
  );
}

/* ============== Main ============== */
export default function ProfileDetailScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme] as ColorTokens;
  const s = styles(C);

  const { data: userUI, isLoading, error } = useWhoAmI();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await qc.invalidateQueries({ queryKey: ["me"] });
    } finally {
      setRefreshing(false);
    }
  };

  const achievements = useMemo(
    () => [
      { id: "a1", title: "Top 1 - Sự kiện tháng 6", place: "2024 - TP.HCM" },
      { id: "a2", title: "Top 10 - Mùa hè sáng tạo", place: "2024 - Quận 1" },
    ],
    []
  );

  // Upload avatar
  const pickAndUploadAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0];
    const form = new FormData();
    form.append("file", {
      uri: asset.uri,
      name: asset.fileName || "avatar.jpg",
      type: asset.mimeType || "image/jpeg",
    } as any);

    await myAxios.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await qc.invalidateQueries({ queryKey: ["me"] });
  };

  if (isLoading) {
    return (
      <View style={[s.container, center]}>
        <Text style={{ color: C.mutedForeground }}>Đang tải hồ sơ...</Text>
      </View>
    );
  }
  if (!userUI || error) {
    return (
      <View style={[s.container, center]}>
        <Text style={{ color: C.mutedForeground }}>
          Không lấy được dữ liệu hồ sơ
        </Text>
      </View>
    );
  }

  const headerGrad: Grad =
    scheme === "dark"
      ? asGrad("#0b1020", "#111827")
      : asGrad("#dbeafe", "#f5f3ff");

  return (
    <View style={s.container}>
      {/* Background */}
      <LinearGradient
        colors={headerGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <FloatingOrbs C={C} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: HEADER_H }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {/* Hero glass */}
        <View style={s.heroWrap}>
          <LinearGradient
            colors={
              [
                toAlpha("#ffffff", scheme === "dark" ? 0.06 : 0.75),
                toAlpha("#ffffff", 0.0),
              ] as const
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroActions}>
              <CircleBtn onPress={() => {}}>
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={scheme === "dark" ? "#fff" : "#111"}
                />
              </CircleBtn>
              <CircleBtn onPress={() => setOpenDetails(true)}>
                <Ionicons
                  name="settings-outline"
                  size={18}
                  color={scheme === "dark" ? "#fff" : "#111"}
                />
              </CircleBtn>
            </View>
          </LinearGradient>

          {/* Avatar + camera pinned */}
          <View style={s.avatarWrap}>
            <View style={s.avatarBox}>
              <View style={s.avatarRing}>
                <LinearGradient
                  colors={[C.primary, "#a78bfa"] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.avatarRingFill}
                />
                <View style={[s.avatar, { backgroundColor: C.background }]}>
                  <Ionicons name="person" size={28} color={C.mutedForeground} />
                </View>
              </View>

              <Pressable
                onPress={pickAndUploadAvatar}
                style={({ pressed }) => [
                  s.camBtn,
                  {
                    backgroundColor: C.primary,
                    opacity: pressed ? 0.9 : 1,
                    borderColor: scheme === "dark" ? "#111827" : "#fff",
                  },
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={16}
                  color={C.primaryForeground}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Name + stats + edit */}
        <View
          style={{ alignItems: "center", marginTop: 44, paddingHorizontal: 16 }}
        >
          <Text style={s.name} numberOfLines={1}>
            {userUI.fullName}
          </Text>

          <View style={s.statsRow}>
            <StatBox label="Cuộc thi" value="12" C={C} />
            <StatBox label="Giải thưởng" value="03" C={C} />
            <StatBox label="Theo dõi" value="1.2K" C={C} />
          </View>

          <Pressable
            onPress={() => setOpenDetails(true)}
            style={({ pressed }) => [
              s.editBtn,
              { backgroundColor: C.primary, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={[s.editTxt, { color: C.primaryForeground }]}>
              Chỉnh sửa hồ sơ
            </Text>
          </Pressable>
        </View>

        {/* Info card */}
        <View
          style={[
            s.detailCard,
            {
              backgroundColor: toAlpha(
                "#ffffff",
                scheme === "dark" ? 0.06 : 0.75
              ),
              borderColor: toAlpha(C.border, 0.6),
            },
          ]}
        >
          <Text style={s.detailTitle}>Thông tin tài khoản</Text>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={userUI.email}
            C={C}
          />
          <InfoRow
            icon="call-outline"
            label="Điện thoại"
            value={userUI.phone || "—"}
            C={C}
          />
          <InfoRow
            icon="calendar-outline"
            label="Ngày sinh"
            value={fmtDate(userUI.birthday) || "—"}
            C={C}
          />
          <InfoRow
            icon="school-outline"
            label="Trường"
            value={userUI.schoolName || "—"}
            C={C}
          />
          <InfoRow
            icon="location-outline"
            label="Phường / Xã"
            value={userUI.ward || "—"}
            C={C}
          />
          <InfoRow
            icon="ribbon-outline"
            label="Khối / Lớp"
            value={userUI.grade || "—"}
            C={C}
          />
        </View>
      </Animated.ScrollView>

      {/* Modal chi tiết hồ sơ (scrollable) */}
      <ProfileDetailsModal
        visible={openDetails}
        onClose={() => setOpenDetails(false)}
        scheme={scheme}
        user={{
          userId: userUI.userId,
          fullname: userUI.fullName,
          email: userUI.email,
          phone: userUI.phone || "",
        }}
        achievements={achievements}
      />
    </View>
  );
}

/* ---------- Sub components ---------- */
const CircleBtn = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.92)",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.85 : 1,
      },
      Platform.select({ android: { elevation: 1 } }),
    ]}
  >
    {children}
  </Pressable>
);

function StatBox({
  label,
  value,
  C,
}: {
  label: string;
  value: string;
  C: ColorTokens;
}) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.value, { color: C.foreground }]}>{value}</Text>
      <Text style={[statStyles.label, { color: C.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  C,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  C: ColorTokens;
}) {
  return (
    <View style={infoStyles.row}>
      <View
        style={[
          infoStyles.icWrap,
          {
            backgroundColor: toAlpha(C.primary as string, 0.1),
            borderColor: toAlpha(C.primary as string, 0.25),
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[infoStyles.label, { color: C.mutedForeground }]}>
          {label}
        </Text>
        <Text
          style={[infoStyles.value, { color: C.foreground }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ---------- Helpers ---------- */
function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = `${d.getDate()}`.padStart(2, "0");
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
}

/* ---------- Styles ---------- */
const statStyles = StyleSheet.create({
  box: { alignItems: "center", paddingHorizontal: 6, minWidth: 88 },
  value: { fontSize: 18, fontWeight: "900" },
  label: { fontSize: 12, marginTop: 2, fontWeight: "700", opacity: 0.9 },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  icWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 12, fontWeight: "700", opacity: 0.9 },
  value: { fontSize: 14, fontWeight: "800" },
});

const orbStyles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9,
    overflow: "hidden",
  },
  fill: { flex: 1 },
  orbTL: { top: -30, left: -40, width: 220, height: 220 },
  orbTR: { top: 40, right: -60, width: 260, height: 260 },
  orbBR: { bottom: -50, right: -30, width: 220, height: 220 },
});

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1 },

    heroWrap: { paddingTop: 12, paddingHorizontal: 12, marginTop: 6 },
    hero: {
      height: 160,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: toAlpha(C.border, 0.7),
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      justifyContent: "flex-start",
    },
    heroActions: {
      marginLeft: "auto",
      flexDirection: "row",
      gap: 10,
      padding: 10,
    },

    avatarWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -36,
      alignItems: "center",
      zIndex: 2,
    },

    // NEW: khối định vị để camBtn bám vào
    avatarBox: {
      width: 86,
      height: 86,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarRing: {
      width: 86,
      height: 86,
      borderRadius: 43,
      position: "relative",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    avatarRingFill: { ...StyleSheet.absoluteFillObject, borderRadius: 43 },

    avatar: {
      position: "absolute",
      left: 5,
      top: 5,
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 3,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...Platform.select({ android: { elevation: 4 } }),
    },

    // UPDATED: luôn ở góc dưới-phải avatar
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
      ...Platform.select({ android: { elevation: 4 } }),
    },

    name: { fontSize: 20, fontWeight: "900", color: C.foreground },

    statsRow: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      paddingHorizontal: 16,
    },

    editBtn: {
      marginTop: 14,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 999,
      width: "92%",
      alignItems: "center",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    editTxt: { fontWeight: "900", fontSize: 15, letterSpacing: 0.3 },

    detailCard: {
      marginTop: 26,
      marginHorizontal: 16,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      gap: 6,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    detailTitle: {
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 6,
      color: C.foreground,
      letterSpacing: 0.2,
    },
  });
