// app/profile-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import myAxios from "@/constants/custom-axios";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= Helpers ================= */
const HEADER_H = 56;

const toAlpha = (hex: string, a: number) => {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

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
      <SafeAreaView
        style={[
          s.safeArea,
          {
            backgroundColor: "#EAE6E0",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        ]}
        edges={["top"]}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              s.headerIconBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={[s.container, s.center]}>
          <Text style={{ color: C.mutedForeground }}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userUI || error) {
    return (
      <SafeAreaView
        style={[
          s.safeArea,
          {
            backgroundColor: C.border,
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        ]}
        edges={["top"]}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              s.headerIconBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={[s.container, s.center]}>
          <Text style={{ color: C.mutedForeground }}>
            Không lấy được dữ liệu hồ sơ
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        s.safeArea,
        {
          backgroundColor: "#EAE6E0",
          paddingTop: Platform.OS === "ios" ? 8 : 0,
        },
      ]}
      edges={["top"]}
    >
      <View style={s.container}>
        {/* Unified header with back button */}
        <UnifiedHeader title="Hồ sơ" showBack={true} scheme={scheme} />

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
          style={{ backgroundColor: "#EAE6E0" }}
        >
          {/* Card avatar + nút camera */}
          <View style={[s.card, { marginTop: 12 }]}>
            <View style={s.avatarBox}>
              <View style={s.avatarRing}>
                <View style={s.avatarRingFill} />
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

            <Text style={s.name} numberOfLines={1}>
              {userUI.fullName}
            </Text>

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

          {/* Thông tin tài khoản */}
          <View
            style={[
              s.card,
              {
                gap: 6,
              },
            ]}
          >
            <Text style={s.sectionTitle}>Thông tin tài khoản</Text>
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

        {/* Modal chi tiết hồ sơ */}
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
        />
      </View>
    </SafeAreaView>
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
            backgroundColor: withOpacity(C.primary as string, 0.1),
            borderColor: withOpacity(C.primary as string, 0.25),
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={C.background} />
      </View>
      <View
        style={{
          alignContent: "center",
          flex: 1,
          justifyContent: "center",
        }}
      >
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

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    // SafeArea wrapper
    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
    },
    center: { alignItems: "center", justifyContent: "center" },

    // New header inside screen (uses beige bg to match body)
    header: {
      height: HEADER_H,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#rgba(31, 41, 55, 0.8)",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: toAlpha("#000000", 0.06),
    },
    headerIconBtn: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.92)",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#FFF",
    },

    card: {
      marginTop: 12,
      marginHorizontal: 16,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      backgroundColor: C.card,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 1 },
      }),
    },

    // avatar
    avatarBox: {
      alignSelf: "center",
      width: 90,
      height: 90,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 6,
      marginBottom: 8,
    },
    avatarRing: {
      width: 90,
      height: 90,
      borderRadius: 45,
      position: "relative",
    },
    avatarRingFill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 45,
      backgroundColor: withOpacity(C.primary as string, 0.18),
    },
    avatar: {
      position: "absolute",
      left: 5,
      top: 5,
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: C.background,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...Platform.select({ android: { elevation: 2 } }),
    },
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
      ...Platform.select({ android: { elevation: 3 } }),
    },

    name: {
      fontSize: 20,
      fontWeight: "900",
      color: C.foreground,
      textAlign: "center",
      marginTop: 6,
    },

    statsRow: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      paddingHorizontal: 8,
    },

    editBtn: {
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 999,
      width: "100%",
      alignItems: "center",
    },
    editTxt: { fontWeight: "900", fontSize: 15, letterSpacing: 0.3 },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 6,
      color: C.foreground,
      letterSpacing: 0.2,
    },

    achRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.border,
    },
    achText: { fontSize: 14.5, fontWeight: "700" },
    achPlace: { fontSize: 12, marginLeft: "auto" },
  });
