import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Bell,
  CircleCheck as CheckCircle,
  Clock,
  FileText,
  Settings as SettingsIcon,
  Trophy,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "contest" | "submission" | "result" | "system";
  isRead: boolean;
  date: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: 'Kết quả cuộc thi "Vẽ Sài Gòn Xanh"',
    message:
      'Chúc mừng! Tác phẩm "Sài Gòn Trong Mắt Tôi" của bạn đã giành giải Nhất.',
    type: "result",
    isRead: false,
    date: "2024-12-20T10:30:00Z",
  },
  {
    id: "2",
    title: 'Cuộc thi mới: "Thiên Nhiên Việt Nam"',
    message: "Cuộc thi mới đã được công bố. Hạn chót tham gia: 28/02/2025.",
    type: "contest",
    isRead: false,
    date: "2024-12-19T14:15:00Z",
  },
  {
    id: "3",
    title: "Tác phẩm đã được chấp nhận",
    message:
      'Tác phẩm "Nghệ Thuật Đường Phố" đã được ban tổ chức chấp nhận tham gia cuộc thi.',
    type: "submission",
    isRead: true,
    date: "2024-12-18T09:45:00Z",
  },
  {
    id: "4",
    title: "Nhắc nhở hạn chót",
    message:
      'Cuộc thi "Nghệ Thuật Đường Phố" sẽ kết thúc trong 3 ngày. Hãy nộp bài ngay!',
    type: "contest",
    isRead: true,
    date: "2024-12-17T16:20:00Z",
  },
  {
    id: "5",
    title: "Cập nhật hệ thống",
    message: "Ứng dụng đã được cập nhật với tính năng bình chọn mới.",
    type: "system",
    isRead: true,
    date: "2024-12-16T11:00:00Z",
  },
];

export default function NotificationsScreen() {
  const [notificationList, setNotificationList] = useState(notifications);
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contest":
        return (
          <Trophy size={20} color={Colors[colorScheme].accentForeground} />
        );
      case "submission":
        return (
          <FileText size={20} color={Colors[colorScheme].accentForeground} />
        );
      case "result":
        return (
          <CheckCircle size={20} color={Colors[colorScheme].accentForeground} />
        );
      case "system":
        return (
          <SettingsIcon
            size={20}
            color={Colors[colorScheme].accentForeground}
          />
        );
      default:
        return <Bell size={20} color={Colors[colorScheme].mutedForeground} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const unreadCount = notificationList.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].background}
      />

      {/* Header */}
      <View style={themedStyles.header}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons
            onPress={() => router.back()}
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].primary}
          />
          <View>
            <Text style={themedStyles.headerTitle}>Thông báo</Text>
            {unreadCount > 0 && (
              <Text style={themedStyles.unreadCount}>
                {unreadCount} thông báo chưa đọc
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={themedStyles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={themedStyles.markAllText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {notificationList.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={themedStyles.notificationCard}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={themedStyles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>

            <View style={themedStyles.notificationContent}>
              <Text
                style={[
                  themedStyles.notificationTitle,
                  !notification.isRead && themedStyles.unreadTitle,
                ]}
              >
                {notification.title}
              </Text>
              <Text style={themedStyles.notificationMessage}>
                {notification.message}
              </Text>
              <View style={themedStyles.notificationFooter}>
                <Clock size={12} color={Colors[colorScheme].mutedForeground} />
                <Text style={themedStyles.notificationDate}>
                  {formatDate(notification.date)}
                </Text>
                <View style={themedStyles.readStatusIcon}>
                  {notification.isRead ? (
                    <Ionicons
                      name="checkmark-done"
                      size={16}
                      color={Colors[colorScheme].accentForeground}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse"
                      size={16}
                      color={Colors[colorScheme].accentForeground}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {notificationList.length === 0 && (
          <View style={themedStyles.emptyState}>
            <Bell size={48} color={Colors[colorScheme].muted} />
            <Text style={themedStyles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={themedStyles.emptyMessage}>
              Bạn sẽ nhận được thông báo về cuộc thi và tác phẩm ở đây
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: Colors[scheme].card,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: Colors[scheme].cardForeground,
    },
    unreadCount: {
      fontSize: 14,
      color: Colors[scheme].destructive,
      marginTop: 2,
    },
    markAllButton: {
      backgroundColor: Colors[scheme].primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    markAllText: {
      color: Colors[scheme].primaryForeground,
      fontSize: 12,
      fontWeight: "600",
    },
    scrollView: {
      flex: 1,
      paddingTop: 8,
    },
    notificationCard: {
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 5,
      marginBottom: 6,
      borderRadius: 6,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
      borderWidth: 0.8,
      borderColor: Colors[scheme].border,
    },
    // unreadCard removed, replaced with icon indicator
    notificationIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    unreadTitle: {
      fontWeight: "bold",
      color: Colors[scheme].cardForeground,
    },
    notificationMessage: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationFooter: {
      flexDirection: "row",
      alignItems: "center",
    },
    notificationDate: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      marginLeft: 4,
    },
    // unreadDot removed, replaced with icon indicator
    readStatusIcon: {
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].muted,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
