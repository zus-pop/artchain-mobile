import {
  useGetNotificationsForUser,
  useUpdateNotificationReadStatus,
} from "@/apis/notification";
import NotificationCard, {
  NotificationItem,
} from "@/components/cards/NotificationCard";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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

// Helper functions to extract title and type from message
const getNotificationTitle = (message: string): string => {
  // Extract title from message - this is a simple implementation
  // You might want to make this more sophisticated based on your message format
  const parts = message.split(":");
  return parts.length > 1 ? parts[0].trim() : "Notification";
};

const getNotificationType = (message: string): string => {
  // Determine type based on message content
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("result")) return "result";
  if (lowerMessage.includes("contest")) return "contest";
  if (lowerMessage.includes("submission")) return "submission";
  return "system";
};

/* nền orbs */
function Orbs({ scheme }: { scheme: "light" | "dark" }) {
  const C = Colors[scheme];
  const orbs =
    scheme === "dark"
      ? [
          [
            withOpacity(C.primary, 0.08),
            withOpacity(C.secondary, 0.15),
          ] as const,
          [withOpacity(C.accent, 0.08), withOpacity(C.muted, 0.15)] as const,
          [withOpacity(C.border, 0.08), withOpacity(C.card, 0.15)] as const,
        ]
      : [
          [withOpacity(C.primary, 0.1), withOpacity(C.secondary, 0.2)] as const,
          [withOpacity(C.accent, 0.1), withOpacity(C.muted, 0.2)] as const,
          [withOpacity(C.border, 0.1), withOpacity(C.card, 0.2)] as const,
        ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={orbs[0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.orb, { top: -100, left: -80, width: 200, height: 200 }]}
      />
      <LinearGradient
        colors={orbs[1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.orb, { top: 80, right: -90, width: 220, height: 220 }]}
      />
      <LinearGradient
        colors={orbs[2]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.orb,
          { bottom: -50, left: -60, width: 160, height: 160 },
        ]}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  // API hooks
  const {
    data: notificationsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetNotificationsForUser();

  const updateReadStatus = useUpdateNotificationReadStatus();

  // Flatten all pages of notifications
  const allNotifications = useMemo(() => {
    return notificationsData?.pages.flatMap((page) => page.data) ?? [];
  }, [notificationsData]);

  const unreadCount = allNotifications.filter((x) => !x.isRead).length;

  const [tab, setTab] = useState<"all" | "unread">("all");
  // Transform API data to match NotificationItem interface
  const transformedNotifications = useMemo(() => {
    return allNotifications.map((notification) => ({
      id: notification.notificationId,
      title: getNotificationTitle(notification.message),
      message: notification.message,
      type: getNotificationType(notification.message) as
        | "result"
        | "contest"
        | "submission"
        | "system",
      isRead: notification.isRead,
      date: notification.createdAt,
    }));
  }, [allNotifications]);

  const filtered = useMemo(
    () =>
      tab === "unread"
        ? transformedNotifications.filter((x) => !x.isRead)
        : transformedNotifications,
    [transformedNotifications, tab]
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
    return s;
  }, [filtered]);

  const markAllAsRead = () => {
    // Mark all unread notifications as read
    const unreadNotifications = allNotifications.filter((n) => !n.isRead);
    unreadNotifications.forEach((notification) => {
      updateReadStatus.mutate(notification.notificationId);
    });
  };

  const markOneAsRead = (id: string) => {
    updateReadStatus.mutate(id);
  };

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
          scheme === "dark" ? [C.primary, C.secondary] : [C.primary, C.accent]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            style={[
              styles.backBtn,
              {
                backgroundColor: withOpacity(C.primaryForeground, 0.22),
                borderColor: withOpacity(C.primaryForeground, 0.35),
              },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={C.mutedForeground} />
          </TouchableOpacity>

          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={[styles.headerTitle, { color: C.primaryForeground }]}>
              Thông báo
            </Text>
            {unreadCount > 0 ? (
              <Text
                style={[
                  styles.headerSub,
                  { color: withOpacity(C.primaryForeground, 0.9) },
                ]}
              >
                {unreadCount} chưa đọc
              </Text>
            ) : (
              <Text
                style={[
                  styles.headerSub,
                  { color: withOpacity(C.primaryForeground, 0.9) },
                ]}
              >
                Tất cả đã đọc
              </Text>
            )}
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllAsRead}
              activeOpacity={0.9}
              style={[
                styles.readAllBtn,
                { backgroundColor: withOpacity(C.primaryForeground, 0.9) },
              ]}
            >
              <Ionicons name="checkmark-done" size={16} color={C.primary} />
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
                      ? withOpacity(C.primaryForeground, 0.9)
                      : withOpacity(C.primaryForeground, 0.18),
                    borderColor: active
                      ? "transparent"
                      : withOpacity(C.primaryForeground, 0.3),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? C.primary : C.mutedForeground },
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
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: C.mutedForeground }]}>
            {section.title}
          </Text>
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={[styles.loadingText, { color: C.mutedForeground }]}>
                Đang tải thêm...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={[styles.emptyTitle, { color: C.muted }]}>
                Đang tải thông báo...
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={C.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: C.mutedForeground }]}>
                Chưa có thông báo
              </Text>
            </View>
          )
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
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  headerSub: {
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

  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
