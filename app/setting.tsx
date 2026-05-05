// app/setting.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDisableAccount } from "@/apis/user";
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../store";

/* ================== Constants ================== */
const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
] as const;

/* =============== Decorative background (muted, orange-first) =============== */

/* ================== Setting Screen ================== */
const Setting = () => {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const ORANGE = C?.primary ?? "#F59E0B"; // accent cam chủ đạo
  const ORANGE_DIM = (C?.primary ?? "#F59E0B") + "1F"; // cam mờ

  const [isDark, setIsDark] = useState(scheme === "dark");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [notifications, setNotifications] = useState(true);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAccessToken } = useAuthStore();
  const disableAccountMutation = useDisableAccount();
  const [isDisablingAccount, setIsDisablingAccount] = useState(false);

  const handleSignOut = () => {
    setAccessToken(null);
    queryClient.invalidateQueries({ queryKey: ["me"] });
    router.replace("/login");
  };

  const handleDisableAccount = () => {
    Alert.alert(
      "Vô hiệu hóa tài khoản",
      "Tài khoản của bạn sẽ bị vô hiệu hóa vĩnh viễn. Bạn không thể phục hồi lại. Tiếp tục?",
      [
        {
          text: "Hủy",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Vô hiệu hóa",
          onPress: async () => {
            setIsDisablingAccount(true);
            await disableAccountMutation.mutateAsync(undefined);
            setAccessToken(null);
            queryClient.clear();
            router.replace("/login");
            setIsDisablingAccount(false);
          },
          style: "destructive",
        },
      ],
    );
  };

  const sectionCardStyle: StyleProp<ViewStyle> = [
    styles.sectionCard,
    {
      backgroundColor: C.card,
      borderColor: C.border,
      shadowColor: scheme === "dark" ? "#000" : "#111827",
    } as ViewStyle,
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.newbackground }]}
      edges={["left", "right", "bottom"]}
    >
      <UnifiedHeader title="Cài đặt" showBack={true} scheme={scheme} />

      <View style={styles.screenBody}>
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 28,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== Appearance ===== */}
          {/* <View style={sectionCardStyle}> */}
          {/* <SectionTitle title="Giao diện" /> */}

          {/* <SettingRow
            icon="moon"
            title="Chế độ tối"
            subtitle="Giảm chói, dễ đọc vào ban đêm"
            right={
              <Switch
                value={isDark}
                onValueChange={setIsDark}
                thumbColor={isDark ? ORANGE : C.muted}
                trackColor={{
                  false: C.muted,
                  true: ORANGE_DIM,
                }}
              />
            }
            scheme={scheme}
            accent={ORANGE}
          /> */}

          {/* <Divider color={C.border} />

          <View style={styles.rowHorizontal}>
            <SettingIcon name="language" scheme={scheme} accent={ORANGE} />
            <View style={styles.rowTexts}>
              <Text style={[styles.rowTitle, { color: C.foreground }]}>
                Ngôn ngữ
              </Text>
              <Text style={[styles.rowSub, { color: C.mutedForeground }]}>
                Chọn ngôn ngữ hiển thị
              </Text>
            </View>
          </View> */}

          {/* <View style={styles.langChips}>
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
                      backgroundColor: active ? ORANGE : C.muted,
                      borderColor: active ? ORANGE : C.border,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={active ? "#fff" : C.foreground}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: active ? "#fff" : C.foreground,
                      fontWeight: "700",
                    }}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View> */}
          {/* </View> */}

          {/* ===== Notifications ===== */}
          {/* <View style={sectionCardStyle}>
          <SectionTitle title="Thông báo" />

          <SettingRow
            icon="notifications"
            title="Nhận thông báo"
            subtitle="Tin mới, cuộc thi & kết quả"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor={notifications ? ORANGE : C.muted}
                trackColor={{ false: C.muted, true: ORANGE_DIM }}
              />
            }
            scheme={scheme}
            accent={ORANGE}
          />

          <Divider color={C.border} />

          <SettingRow
            icon="notifications-circle"
            title="Tóm tắt hằng tuần"
            subtitle="Một bản tóm lược vào thứ Hai"
            right={<Chevron />}
            scheme={scheme}
            accent={ORANGE}
            onPress={() => {}}
          />
        </View> */}

          {/* ===== Account ===== */}
          {/* <View style={sectionCardStyle}>
          <SectionTitle title="Tài khoản" />

          <SettingRow
            icon="person-circle"
            title="Hồ sơ cá nhân"
            subtitle="Tên, ảnh đại diện, giới thiệu"
            right={<Chevron />}
            scheme={scheme}
            accent={ORANGE}
            onPress={() => router.push("/profile")}
          />

          <Divider color={C.border} />

          <SettingRow
            icon="shield-checkmark"
            title="Quyền riêng tư & bảo mật"
            subtitle="Đăng nhập & quyền truy cập"
            right={<Chevron />}
            scheme={scheme}
            accent={ORANGE}
            // onPress={() => router.push("/privacy")}
          />
        </View> */}

          {/* ===== Disable Account (Danger Zone) ===== */}
          {/* <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: "#FEE2E2",
              borderColor: "#FECACA",
              shadowColor: "#991B1B",
            } as ViewStyle,
          ]}
        >
          <SectionTitle title="Vùng nguy hiểm" />

          <Pressable
            onPress={handleDisableAccount}
            disabled={isDisablingAccount || disableAccountMutation.isPending}
            style={styles.rowHorizontal}
            android_ripple={{ color: "#FCA5A5" }}
          >
            <View
              style={[
                styles.leadingIcon,
                { backgroundColor: "#FECACA", borderRadius: 10 },
              ]}
            >
              <Ionicons name="ban" size={18} color="#DC2626" />
            </View>
            <View style={styles.rowTexts}>
              <Text style={[styles.rowTitle, { color: "#7F1D1D" }]}>
                Vô hiệu hóa tài khoản
              </Text>
              <Text style={[styles.rowSub, { color: "#991B1B" }]}>
                Tài khoản sẽ bị vô hiệu hóa vĩnh viễn
              </Text>
            </View>
          </Pressable>
        </View> */}

          {Platform.OS === "ios" && <View style={{ height: 12 }} />}
        </ScrollView>

        {/* ===== Sign out (cam, ít rực) ===== */}
        <View style={styles.signoutContainer}>
          <LinearGradient
            colors={[ORANGE + "E6", ORANGE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.signoutWrap, { borderRadius: 10 }]}
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
        </View>
      </View>
    </SafeAreaView>
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
  accent,
}: {
  name:
    | "moon"
    | "language"
    | "notifications"
    | "notifications-circle"
    | "person-circle"
    | "shield-checkmark";
  scheme: "light" | "dark";
  accent: string;
}) {
  const bg = scheme === "dark" ? "#FFFFFF0F" : "#0000000D";
  return (
    <View
      style={[styles.leadingIcon, { backgroundColor: bg, borderRadius: 10 }]}
    >
      <Ionicons name={name as any} size={18} color={accent} />
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
  accent,
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
  accent: string;
}) {
  const C = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: C.muted }}
      style={styles.rowHorizontal}
    >
      <SettingIcon name={icon} scheme={scheme} accent={accent} />
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

  screenBody: {
    flex: 1,
  },

  /* Content */
  content: { flex: 1 },

  /* Orbs (muted) */
  orb: {
    position: "absolute",
    borderRadius: 9999,
    filter: Platform.OS === "web" ? ("blur(36px)" as any) : undefined,
  },

  /* Cards */
  sectionCard: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 14,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  rowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  leadingIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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
    borderWidth: StyleSheet.hairlineWidth,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },

  chevron: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  signoutWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  signoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
