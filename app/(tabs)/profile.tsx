import PostCard from "@/components/cards/PostCard";
import ProfileDetailsModal from "@/components/modals/ProfileDetailsModal";
import SegmentTabs from "@/components/tabs/SegmentedTabs";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useWhoAmI } from "../../../wdpTuscode/artchain-mobile/apis/auth";
import { useAuthStore } from "../../../wdpTuscode/artchain-mobile/store";

// ===== Types =====
import type {
  ColorTokens,
  EmptyProps,
  KPIProps,
  RawProfile,
  TabKey,
  UserStats,
} from "@/types/tabkey";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ---- JSON đầu vào (từ bạn) ----
const rawProfile: RawProfile = {
  fullName: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "012323141242",
  birthday: "2010-05-14T17:00:00.000Z",
  schoolName: "Trường Tiểu học Hòa Bình",
  ward: "Phường 7, Quận 3",
  grade: "5",
};

export default function ProfileScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: userData, isLoading } = useWhoAmI();
  const C = Colors[scheme];
  const s = styles(C);

  // Use real user data from API
  const user = userData
    ? {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        birthday: userData.birthday,
        schoolName: userData.schoolName,
        ward: userData.ward,
        grade: userData.grade,
        // Keep some fake data for now until API provides it
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        followers: 2,
        handle: userData.email.split("@")[0], // Generate handle from email
      }
    : null;

  const recentSubmissions = useMemo(
    () => [
      {
        id: "1",
        title: "Bức tranh bình minh",
        contest: "Vẽ Sài Gòn Xanh",
        submissionDate: "2024-12-01",
        status: "winner",
        image:
          "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
        views: 320,
        likes: 45,
      },
      {
        id: "2",
        title: "Phố đêm rực rỡ",
        contest: "Nghệ Thuật Đường Phố",
        submissionDate: "2024-11-15",
        status: "accepted",
        image:
          "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg",
        views: 210,
        likes: 30,
      },
      {
        id: "3",
        title: "Sắc màu tuổi thơ",
        contest: "Nghệ Sĩ Xuất Sắc",
        submissionDate: "2024-10-20",
        status: "pending",
        image:
          "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg",
        views: 180,
        likes: 22,
      },
    ],
    []
  );

  const userStats: UserStats = {
    totalSubmissions: 12,
    wins: 3,
    views: 2450,
    likes: 120,
    rating: 4.7,
  };

  const [active, setActive] = useState<TabKey>("threads");
  const [openDetails, setOpenDetails] = useState(false);

  const achievements = useMemo(
    () => [
      {
        id: "a1",
        title: `Giải Nhất "${recentSubmissions[0].contest}"`,
        place: "2024 - TP. Hồ Chí Minh",
      },
      {
        id: "a2",
        title: `Top 10 "${recentSubmissions[1].contest}"`,
        place: "2024 - Quận 1",
      },
    ],
    [recentSubmissions]
  );

  const getStatusColor = (status: string) =>
    status === "winner"
      ? C.chart1
      : status === "accepted"
      ? C.primary
      : status === "rejected"
      ? C.destructive
      : C.mutedForeground;

  const getStatusText = (status: string) =>
    status === "winner"
      ? "Giải thưởng"
      : status === "accepted"
      ? "Được chấp nhận"
      : status === "pending"
      ? "Đang xử lý"
      : "Bị từ chối";

  if (!accessToken) {
    return (
      <View style={s.container}>
        <View style={s.topbar}>
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="settings-outline" size={22} color={C.foreground} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: C.foreground,
              marginTop: 16,
            }}
          >
            Bạn chưa đăng nhập
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: C.mutedForeground,
              marginVertical: 12,
              textAlign: "center",
            }}
          >
            Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc
            thi nghệ thuật hấp dẫn trên ArtChain.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{
              backgroundColor: C.primary,
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 12,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: C.primaryForeground,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Đăng nhập / Đăng ký
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const ICONS: Record<
    "brush" | "trophy" | "eye" | "heart",
    { fg: string; bg: string }
  > = {
    brush: { fg: "#F59E0B", bg: "rgba(245,158,11,0.14)" }, // amber
    trophy: { fg: "#EAB308", bg: "rgba(234,179,8,0.14)" }, // yellow
    eye: { fg: "#3B82F6", bg: "rgba(59,130,246,0.14)" }, // blue
    heart: { fg: "#EF4444", bg: "rgba(239,68,68,0.14)" }, // red
  };
  // Show loading state while fetching user data
  if (isLoading || !user) {
    return (
      <View style={s.container}>
        <View style={s.topbar}>
          <Text style={s.headerTitle}>Hồ sơ</Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={C.foreground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/setting")}
              style={s.iconBtn}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={C.foreground}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="person-circle-outline" size={80} color={C.muted} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: C.foreground,
              marginTop: 16,
            }}
          >
            Đang tải hồ sơ...
          </Text>
        </View>
      </View>
    );
  }

  // Trước đây: const Avatar = (): JSX.Element => { ... }  // -> lỗi
  const Avatar = () =>
    user.avatar ? (
      <Image source={{ uri: user.avatar }} style={s.avatar} />
    ) : (
      <View
        style={[s.avatar, { alignItems: "center", justifyContent: "center" }]}
      >
        <Ionicons name="person-outline" size={28} color={C.mutedForeground} />
      </View>
    );

  return (
    <SafeAreaProvider style={s.container}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Text style={s.headerTitle}>Hồ sơ</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={C.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={s.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color={C.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header compact */}
        <View style={s.headerWrap}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user.fullName}</Text>
            <Text style={s.handle}>@{user.handle}</Text>
            {!!user.subtitle && (
              <Text style={s.followers}>{user.subtitle}</Text>
            )}
            {!!user.location && (
              <Text style={[s.followers, { marginTop: 4 }]}>
                {user.location}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setOpenDetails(true)}
            activeOpacity={0.9}
          >
            <View>
              <Avatar />
              <View style={s.addBadge}>
                <Ionicons
                  name="person-add-outline"
                  size={14}
                  color={C.primaryForeground}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chips hành động */}
        <View style={s.chipsRow}>
          <TouchableOpacity style={s.chip} onPress={() => setOpenDetails(true)}>
            <Text style={s.chipText}>Chỉnh sửa trang cá nhân</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.chip}>
            <Text style={s.chipText}>Chia sẻ trang cá nhân</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Cards */}
        <View style={s.infoCards}>
          <View style={s.infoCard}>
            <Ionicons name="school-outline" size={20} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Trường học</Text>
              <Text style={s.infoValue}>{user.schoolName}</Text>
            </View>
          </View>
          <View style={s.infoCard}>
            <Ionicons name="location-outline" size={20} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Khu vực</Text>
              <Text style={s.infoValue}>{user.ward}</Text>
            </View>
          </View>
          <View style={s.infoCard}>
            <Ionicons name="school-outline" size={20} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Lớp</Text>
              <Text style={s.infoValue}>{user.grade}</Text>
            </View>
          </View>
          <View style={s.infoCard}>
            <Ionicons name="calendar-outline" size={20} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Ngày sinh</Text>
              <Text style={s.infoValue}>
                {new Date(user.birthday).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.kpiCard}>
          <KPI
            icon="brush-outline"
            label="Tác phẩm"
            value={String(userStats.totalSubmissions)}
            C={C}
            iconColor={ICONS.brush.fg}
            iconBg={ICONS.brush.bg}
          />
          <View style={s.kpiDivider} />
          <KPI
            icon="trophy-outline"
            label="Giải thưởng"
            value={String(userStats.wins)}
            C={C}
            iconColor={ICONS.trophy.fg}
            iconBg={ICONS.trophy.bg}
          />
          <View style={s.kpiDivider} />
          <KPI
            icon="eye-outline"
            label="Lượt xem"
            value={userStats.views.toLocaleString()}
            C={C}
            iconColor={ICONS.eye.fg}
            iconBg={ICONS.eye.bg}
          />
          <View style={s.kpiDivider} />
          <KPI
            icon="heart-outline"
            label="Lượt thích"
            value={String(userStats.likes)}
            C={C}
            iconColor={ICONS.heart.fg}
            iconBg={ICONS.heart.bg}
          />
        </View>

        {/* Rating */}
        <View style={s.ratingBox}>
          <Ionicons name="star" size={18} color={C.chart1} />
          <Text style={s.ratingText}>{userStats.rating}</Text>
          <Text style={s.ratingSub}>Đánh giá trung bình</Text>
        </View>

        {/* Divider */}
        <View style={s.sectionDivider} />

        {/* Tabs */}
        <View style={{ marginHorizontal: 0 }}>
          <SegmentTabs
            tabs={[
              { key: "threads", label: "Thread" },
              { key: "replies", label: "Thread trả lời" },
              { key: "media", label: "File phương tiện" },
              { key: "reposts", label: "Bài đăng lại" },
            ]}
            activeKey={active}
            onChange={(k) => setActive(k as TabKey)}
            colors={{
              background: C.background,
              card: C.card,
              foreground: C.foreground,
              mutedForeground: C.mutedForeground,
              border: C.border,
              primary: C.primary,
            }}
          />
        </View>

        {/* Nội dung tab */}
        {active === "threads" && (
          <View style={{ padding: 12 }}>
            {recentSubmissions.map((item) => (
              <PostCard
                key={item.id}
                item={item}
                C={C}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onPress={() => {
                  // TODO: điều hướng chi tiết bài gửi
                }}
              />
            ))}
          </View>
        )}
        {active === "replies" && (
          <Empty
            label="Chưa có thread trả lời"
            chips={[
              "Khám phá nghệ sĩ",
              "Viết thread",
              "Theo dõi thêm",
              "Tìm chủ đề",
            ]}
          />
        )}
        {active === "media" && (
          <Empty
            label="Chưa có file phương tiện"
            chips={["Tải ảnh", "Tải video", "Tạo album", "Thêm tác phẩm"]}
          />
        )}
        {active === "reposts" && (
          <Empty
            label="Chưa có bài đăng lại"
            chips={["Khám phá feed", "Theo dõi tag", "Gợi ý hôm nay"]}
          />
        )}
      </ScrollView>

      {/* Modal hồ sơ cá nhân */}
      <ProfileDetailsModal
        visible={openDetails}
        onClose={() => setOpenDetails(false)}
        scheme={scheme}
        user={{
          name: user.fullName,
          handle: user.handle,
          email: user.email,
          phone: user.phone || "",
          location: `${user.ward}, ${user.schoolName}`,
          avatar: user.avatar,
          followers: user.followers,
        }}
        achievements={achievements}
      />
    </SafeAreaProvider>
  );
}

function KPI({
  icon,
  label,
  value,
  C,
  iconColor = C.foreground,
  iconBg = C.muted,
}: KPIProps) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={{ fontWeight: "800", color: C.foreground }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.mutedForeground }}>{label}</Text>
    </View>
  );
}

function Empty({ label, chips = [] }: EmptyProps) {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={emptyStyles.text}>{label}</Text>

      {chips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={emptyStyles.chipsContent}
        >
          {chips.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={emptyStyles.chipBtn}
              activeOpacity={0.85}
            >
              <Ionicons
                name="add-circle-outline"
                size={14}
                style={{ marginRight: 6 }}
              />
              <Text style={emptyStyles.chipTxt}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 12,
  },
  text: {
    opacity: 0.6,
    fontSize: 14,
  },
  chipsContent: {
    paddingHorizontal: 16,
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  chipTxt: {
    fontSize: 13,
    fontWeight: "600",
  },
});

const styles = (C: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    topbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: C.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: C.foreground },
    iconBtn: { padding: 8, marginLeft: 4 },

    headerWrap: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
    },
    name: { fontSize: 22, fontWeight: "800", color: C.foreground },
    handle: { color: C.mutedForeground, marginTop: 2 },
    followers: { color: C.mutedForeground, marginTop: 6, fontSize: 12 },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: C.muted,
    },
    addBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      backgroundColor: C.primary,
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: C.background,
    },

    chipsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
    },
    chip: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      paddingVertical: 10,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    chipText: { color: C.foreground, fontWeight: "600" },

    // User Info Cards
    infoCards: {
      marginHorizontal: 12,
      marginTop: 8,
      gap: 8,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.card,
      borderRadius: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: C.mutedForeground,
      fontWeight: "500",
    },
    infoValue: {
      fontSize: 14,
      color: C.foreground,
      fontWeight: "600",
      marginTop: 2,
    },

    // KPI card — bỏ border, thêm shadow + divider hairline
    kpiCard: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: C.card,
      marginHorizontal: 12,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 8,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    kpiDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 6,
    },

    ratingBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: C.card,
      marginHorizontal: 12,
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: 14,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    ratingText: { fontWeight: "800", color: C.foreground },
    ratingSub: { color: C.mutedForeground },

    sectionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 2,
    },

    postRow: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 12,
      marginBottom: 12,
      padding: 10,
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    postThumb: { width: 92, height: 110, borderRadius: 10, marginRight: 12 },
    postTitle: {
      fontWeight: "800",
      color: C.foreground,
      flex: 1,
      marginRight: 8,
    },
    postContest: { color: C.primary, marginTop: 2, fontWeight: "600" },
    postMeta: { color: C.mutedForeground, fontSize: 12, marginTop: 4 },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    badgeTxt: { color: C.primaryForeground, fontSize: 10, fontWeight: "700" },
    metaChip: { flexDirection: "row", alignItems: "center", marginRight: 14 },
    metaTxt: { marginLeft: 4, color: C.mutedForeground, fontSize: 12 },
  });
