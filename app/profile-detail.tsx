// app/profile-detail.tsx
import { useWhoAmI } from "@/apis/auth";
import StickyProfileHeader from "@/components/header/StickyProfileHeader";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import myAxios from "@/constants/custom-axios";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type Stat = { label: string; value: string };

const center: ViewStyle = { alignItems: "center", justifyContent: "center" };
const HEADER_H = 56;

export default function ProfileDetailScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme] as ColorTokens;
  const s = styles(C);

  // Hooks
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

  // ======= Upload avatar nhanh từ icon máy ảnh =======
  const pickAndUploadAvatar = async () => {
    // Quyền truy cập ảnh
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    // Chọn ảnh
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0]; // { uri, fileName, mimeType, ... }

    // Upload (FormData)
    const form = new FormData();
    form.append("file", {
      uri: asset.uri,
      name: asset.fileName || "avatar.jpg",
      type: asset.mimeType || "image/jpeg",
    } as any);

    // endpoint thay cho phù hợp BE của bạn
    await myAxios.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Tải lại thông tin user
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

  return (
    <View style={s.container}>
      <StickyProfileHeader
        title={userUI.fullName}
        colors={C}
        scrollY={scrollY}
        showAt={60}
        onRightPress={() => setOpenDetails(true)}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: HEADER_H }}
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
        {/* Banner */}
        <View>
          <ImageBackground
            source={{ uri: "https://via.placeholder.com/400x160" }}
            style={s.banner}
            imageStyle={s.bannerImg}
          >
            <View style={s.bannerActions}>
              <CircleBtn onPress={() => {}}>
                <Ionicons name="share-social-outline" size={18} color="#111" />
              </CircleBtn>
              <CircleBtn onPress={() => setOpenDetails(true)}>
                <Ionicons name="settings-outline" size={18} color="#111" />
              </CircleBtn>
            </View>
          </ImageBackground>

          {/* Avatar nổi + nút máy ảnh góc dưới-phải */}
          <View style={s.avatarWrap}>
            <View style={[s.avatar, { backgroundColor: C.muted }]}>
              <Ionicons name="person" size={28} color={C.mutedForeground} />
            </View>

            {/* Nút máy ảnh để đổi avatar */}
            <Pressable
              onPress={pickAndUploadAvatar}
              style={({ pressed }) => [
                s.camBtn,
                { opacity: pressed ? 0.85 : 1, backgroundColor: C.primary },
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

        {/* Tên + stats + nút chỉnh sửa */}
        <View
          style={{ alignItems: "center", marginTop: 40, paddingHorizontal: 16 }}
        >
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

        {/* ======= USER DETAILS CARD ======= */}
        <View
          style={[
            s.detailCard,
            { backgroundColor: C.card, borderColor: C.border },
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

      {/* Modal chi tiết hồ sơ (dựa API) */}
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
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.85 : 1,
      },
    ]}
  >
    {children}
  </Pressable>
);

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
      <View style={[infoStyles.icWrap, { backgroundColor: C.muted }]}>
        <Ionicons name={icon} size={16} color={C.mutedForeground} />
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

/* ---------- Styles ---------- */
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  icWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, fontWeight: "600", opacity: 0.8 },
  value: { fontSize: 14, fontWeight: "700" },
});

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },

    banner: {
      width: "100%",
      height: 160,
      justifyContent: "flex-start",
      paddingTop: 12,
      paddingHorizontal: 12,
    },
    bannerImg: {
      width: "100%",
      height: "100%",
    },
    bannerActions: {
      marginLeft: "auto",
      flexDirection: "row",
      gap: 10,
    },

    avatarWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -36,
      alignItems: "center",
      zIndex: 2,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 3,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    camBtn: {
      position: "absolute",
      // right: "calc(50% - 76/2px)", // RN không hỗ trợ calc → dùng offset bằng số:
      // ↳ nên dùng tọa độ số tuyệt đối thay vì calc. Sửa lại như sau:
      // right: -4,
      // bottom: -4,
      // (mình để ghi chú, phía dưới là version dùng số)
      right: -4,
      bottom: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#fff",
    },

    name: { fontSize: 20, fontWeight: "800", color: C.foreground },

    statsRow: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
    },
    statBox: { alignItems: "center", paddingHorizontal: 6, minWidth: 88 },
    statValue: { fontSize: 18, fontWeight: "800", color: C.foreground },
    statLabel: { fontSize: 12, marginTop: 2, color: C.mutedForeground },

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
    editTxt: { fontWeight: "800", fontSize: 15 },

    detailCard: {
      marginTop: 18,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      gap: 6,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    detailTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 6,
      color: C.foreground,
    },
  });
