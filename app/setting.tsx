import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "../store";

/* ================== Constants ================== */
const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
] as const;

/* =============== Decorative background =============== */
const OrbsBackground = memo(function OrbsBackground({
  scheme,
}: {
  scheme: "light" | "dark";
}) {
  // màu mềm cho light/dark
  const orbs =
    scheme === "dark"
      ? [
          ["#0EA5E922", "#6366F144"],
          ["#22D3EE22", "#06B6D444"],
          ["#A78BFA22", "#8B5CF644"],
        ]
      : [
          ["#60A5FA33", "#7C3AED55"],
          ["#F472B633", "#EC489955"],
          ["#34D39933", "#10B98155"],
        ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Orb 1 */}
      <LinearGradient
        colors={orbs[0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.orb,
          {
            top: -80,
            left: -60,
            width: 220,
            height: 220,
          },
        ]}
      />
      {/* Orb 2 */}
      <LinearGradient
        colors={orbs[1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.orb,
          {
            top: 120,
            right: -70,
            width: 240,
            height: 240,
          },
        ]}
      />
      {/* Orb 3 */}
      <LinearGradient
        colors={orbs[2]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.orb,
          {
            top: 340,
            left: -40,
            width: 180,
            height: 180,
          },
        ]}
      />
    </View>
  );
});

/* ================== Setting Screen ================== */
const Setting = () => {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [isDark, setIsDark] = useState(scheme === "dark");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [notifications, setNotifications] = useState(true);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAccessToken } = useAuthStore();

  const handleSignOut = () => {
    setAccessToken(null);
    queryClient.invalidateQueries({ queryKey: ["me"] });
    router.replace("/login");
  };

  const sectionCardStyle = [
    styles.sectionCard,
    {
      backgroundColor: C.card,
      borderColor: C.border,
      shadowColor: scheme === "dark" ? "#000" : "#111827",
    },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Orbs background */}
      <OrbsBackground scheme={scheme} />

      {/* Header (fix tràn: paddingTop = insets.top) */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: "transparent",
            borderBottomColor: "transparent",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <View style={styles.backPill}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <Text style={styles.backTxt}>Quay lại</Text>
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Badge tiêu đề trong pill gradient nhỏ gọn */}
        <LinearGradient
          colors={
            scheme === "dark" ? ["#0EA5E9", "#6366F1"] : ["#60A5FA", "#A78BFA"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBadge}
        >
          <Ionicons name="settings-outline" size={14} color="#fff" />
          <Text style={styles.headerBadgeTxt}>Cài đặt</Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 28 + Math.max(insets.bottom, 10),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Appearance ===== */}
        <View style={sectionCardStyle}>
          <SectionTitle title="Giao diện" />

          <SettingRow
            icon="moon"
            title="Chế độ tối"
            subtitle="Giảm chói, dễ đọc vào ban đêm"
            right={
              <Switch
                value={isDark}
                onValueChange={setIsDark}
                thumbColor={isDark ? Colors.dark.primary : Colors.light.primary}
                trackColor={{
                  false: Colors.light.muted,
                  true: Colors.dark.muted,
                }}
              />
            }
            scheme={scheme}
          />

          <Divider color={C.border} />

          <View style={styles.rowHorizontal}>
            <SettingIcon name="language" scheme={scheme} />
            <View style={styles.rowTexts}>
              <Text style={[styles.rowTitle, { color: C.foreground }]}>
                Ngôn ngữ
              </Text>
              <Text style={[styles.rowSub, { color: C.mutedForeground }]}>
                Chọn ngôn ngữ hiển thị
              </Text>
            </View>
          </View>

          <View style={styles.langChips}>
            {languages.map((lang) => {
              const active = lang.value === language;
              return (
                <Pressable
                  key={lang.value}
                  android_ripple={{ color: C.muted }}
                  onPress={() => setLanguage(lang.value)}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: active ? C.primary : C.muted,
                      borderColor: active ? C.primary : C.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={active ? C.primaryForeground : C.foreground}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: active ? C.primaryForeground : C.foreground,
                      fontWeight: "700",
                    }}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ===== Notifications ===== */}
        <View style={sectionCardStyle}>
          <SectionTitle title="Thông báo" />

          <SettingRow
            icon="notifications"
            title="Nhận thông báo"
            subtitle="Tin mới, cuộc thi & kết quả"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor={notifications ? C.primary : C.muted}
                trackColor={{ false: C.muted, true: C.primary }}
              />
            }
            scheme={scheme}
          />

          <Divider color={C.border} />

          <SettingRow
            icon="notifications-circle"
            title="Tóm tắt hằng tuần"
            subtitle="Một bản tóm lược vào thứ Hai"
            right={<Chevron />}
            scheme={scheme}
            onPress={() => {}}
          />
        </View>

        {/* ===== Account ===== */}
        <View style={sectionCardStyle}>
          <SectionTitle title="Tài khoản" />

          <SettingRow
            icon="person-circle"
            title="Hồ sơ cá nhân"
            subtitle="Tên, ảnh đại diện, giới thiệu"
            right={<Chevron />}
            scheme={scheme}
            onPress={() => router.push("/profile")}
          />

          <Divider color={C.border} />

          <SettingRow
            icon="shield-checkmark"
            title="Quyền riêng tư & bảo mật"
            subtitle="Đăng nhập & quyền truy cập"
            right={<Chevron />}
            scheme={scheme}
            onPress={() => router.push("/privacy")}
          />
        </View>

        {/* ===== Danger / Sign out ===== */}
        <LinearGradient
          colors={
            scheme === "dark" ? ["#FB7185", "#EF4444"] : ["#FCA5A5", "#EF4444"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.signoutWrap}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSignOut}
            style={styles.signoutBtn}
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.signoutTxt}>Đăng xuất</Text>
          </TouchableOpacity>
        </LinearGradient>

        {Platform.OS === "ios" && <View style={{ height: 12 }} />}
      </ScrollView>
    </View>
  );
};

export default Setting;

/* ================== Small UI Pieces ================== */
const SectionTitle = memo(function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 8,
        color: "#94A3B8",
      }}
      selectable={false}
    >
      {title}
    </Text>
  );
});

const Divider = memo(function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
});

const Chevron = memo(function Chevron() {
  return (
    <View style={styles.chevron}>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </View>
  );
});

const SettingIcon = memo(function SettingIcon({
  name,
  scheme,
}: {
  name:
    | "moon"
    | "language"
    | "notifications"
    | "notifications-circle"
    | "person-circle"
    | "shield-checkmark";
  scheme: "light" | "dark";
}) {
  const tint = scheme === "dark" ? "#93C5FD" : "#3B82F6";
  return (
    <View style={styles.leadingIcon}>
      <Ionicons name={name as any} size={18} color={tint} />
    </View>
  );
});

const SettingRow = memo(function SettingRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  scheme,
}: {
  icon:
    | "moon"
    | "language"
    | "notifications"
    | "notifications-circle"
    | "person-circle"
    | "shield-checkmark";
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  scheme: "light" | "dark";
}) {
  const C = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.muted }}
      style={styles.rowHorizontal}
    >
      <SettingIcon name={icon} scheme={scheme} />
      <View style={styles.rowTexts}>
        <Text style={[styles.rowTitle, { color: C.foreground }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.rowSub, { color: C.mutedForeground }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
});

/* ================== Styles ================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  backBtn: {
    borderRadius: 999,
  },
  backPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backTxt: { color: "#fff", fontWeight: "800", fontSize: 12.5 },

  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerBadgeTxt: { color: "#fff", fontWeight: "800", fontSize: 12.5 },

  /* Content */
  content: { flex: 1 },

  /* Orbs */
  orb: {
    position: "absolute",
    borderRadius: 9999,
    filter: Platform.OS === "web" ? ("blur(40px)" as any) : undefined,
    opacity: 1,
  },

  /* Cards */
  sectionCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  rowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  leadingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "rgba(99,102,241,0.10)",
  },
  rowTexts: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2 },

  langChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },

  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  signoutWrap: {
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },
  signoutBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signoutTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
