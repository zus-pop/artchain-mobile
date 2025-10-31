import NotificationCard, {
  NotificationItem,
} from "@/components/cards/NotificationCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* demo data */
const seed: NotificationItem[] = [
  {
    id: "1",
    title: 'Kết quả cuộc thi "Vẽ Sài Gòn Xanh"',
    message:
      'Chúc mừng! Tác phẩm "Sài Gòn Trong Mắt Tôi" của bạn đã giành giải Nhất.',
    type: "result",
    isRead: false,
    date: new Date().toISOString(),
  },
  {
    id: "2",
    title: 'Cuộc thi mới: "Thiên Nhiên Việt Nam"',
    message: "Cuộc thi mới đã được công bố. Hạn chót tham gia: 28/02/2025.",
    type: "contest",
    isRead: false,
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Tác phẩm đã được chấp nhận",
    message:
      'Tác phẩm "Nghệ Thuật Đường Phố" đã được ban tổ chức chấp nhận tham gia cuộc thi.',
    type: "submission",
    isRead: true,
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Nhắc nhở hạn chót",
    message:
      'Cuộc thi "Nghệ Thuật Đường Phố" sẽ kết thúc trong 3 ngày. Hãy nộp bài ngay!',
    type: "contest",
    isRead: true,
    date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Cập nhật hệ thống",
    message: "Ứng dụng đã được cập nhật với tính năng bình chọn mới.",
    type: "system",
    isRead: true,
    date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

/* nền orbs */
function Orbs({ scheme }: { scheme: "light" | "dark" }) {
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
      <LinearGradient
        colors={orbs[0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.orb, { top: -70, left: -60, width: 220, height: 220 }]}
      />
      <LinearGradient
        colors={orbs[1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.orb, { top: 120, right: -70, width: 240, height: 240 }]}
      />
      <LinearGradient
        colors={orbs[2]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.orb, { top: 340, left: -40, width: 180, height: 180 }]}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const [list, setList] = useState<NotificationItem[]>(seed);
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  const unreadCount = list.filter((x) => !x.isRead).length;

  const [tab, setTab] = useState<"all" | "unread">("all");
  const filtered = useMemo(
    () => (tab === "unread" ? list.filter((x) => !x.isRead) : list),
    [list, tab]
  );

  const sections = useMemo(() => {
    const today: NotificationItem[] = [];
    const week: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const startOfWeek = startOfToday - 6 * 24 * 3600 * 1000;

    filtered
      .slice()
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .forEach((n) => {
        const t = +new Date(n.date);
        if (t >= startOfToday) today.push(n);
        else if (t >= startOfWeek) week.push(n);
        else earlier.push(n);
      });

    const s: { title: string; data: NotificationItem[] }[] = [];
    if (today.length) s.push({ title: "Hôm nay", data: today });
    if (week.length) s.push({ title: "Tuần này", data: week });
    if (earlier.length) s.push({ title: "Trước đó", data: earlier });
    if (!s.length) s.push({ title: "—", data: [] });
    return s;
  }, [filtered]);

  const markAllAsRead = () =>
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const markOneAsRead = (id: string) =>
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* orbs */}
      <Orbs scheme={scheme} />

      {/* Header gradient mảnh + safe area */}
      <LinearGradient
        colors={
          scheme === "dark" ? ["#0EA5E9", "#6366F1"] : ["#60A5FA", "#A78BFA"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            {unreadCount > 0 ? (
              <Text style={styles.headerSub}>{unreadCount} chưa đọc</Text>
            ) : (
              <Text style={styles.headerSub}>Tất cả đã đọc</Text>
            )}
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllAsRead}
              activeOpacity={0.9}
              style={styles.readAllBtn}
            >
              <Ionicons name="checkmark-done" size={16} color="#111827" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["all", "unread"] as const).map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.9}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: active
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.18)",
                    borderColor: active
                      ? "transparent"
                      : "rgba(255,255,255,0.3)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? "#111827" : "#fff" },
                  ]}
                >
                  {t === "all" ? "Tất cả" : "Chưa đọc"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={() => markOneAsRead(item.id)}
            onLongPress={() => markOneAsRead(item.id)}
          />
        )}
        renderSectionHeader={({ section }) =>
          section.title !== "—" ? (
            <Text style={[styles.sectionTitle, { color: C.mutedForeground }]}>
              {section.title}
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={C.muted}
            />
            <Text style={[styles.emptyTitle, { color: C.muted }]}>
              Chưa có thông báo
            </Text>
            <Text style={[styles.emptyMsg, { color: C.mutedForeground }]}>
              Khi có cuộc thi mới, kết quả, hay cập nhật hệ thống, mình sẽ báo
              ngay tại đây.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* orbs */
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },

  /* header */
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  headerSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 2,
  },
  readAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  tabRow: { flexDirection: "row", gap: 8, marginTop: 10, paddingHorizontal: 2 },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: { fontSize: 12.5, fontWeight: "900", letterSpacing: 0.3 },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  empty: { alignItems: "center", paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900" },
  emptyMsg: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
  },
});
