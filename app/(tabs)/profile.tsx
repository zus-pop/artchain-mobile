import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Award,
  Camera,
  CreditCard as Edit3,
  Eye,
  Heart,
  Mail,
  MapPin,
  Phone,
  Settings,
  Star,
  Trophy,
} from "lucide-react-native";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function ProfileScreen() {
  // Simulate user authentication state
  const [isLoggedIn] = useState(false); // set to true for logged-in, false for guest
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  // Mock recent submissions data
  const recentSubmissions = [
    {
      id: "1",
      title: "Bức tranh bình minh",
      contest: "Vẽ Sài Gòn Xanh",
      submissionDate: "2024-12-01",
      status: "winner",
      image: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
      views: 320,
      likes: 45,
    },
    {
      id: "2",
      title: "Phố đêm rực rỡ",
      contest: "Nghệ Thuật Đường Phố",
      submissionDate: "2024-11-15",
      status: "accepted",
      image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg",
      views: 210,
      likes: 30,
    },
    {
      id: "3",
      title: "Sắc màu tuổi thơ",
      contest: "Nghệ Sĩ Xuất Sắc",
      submissionDate: "2024-10-20",
      status: "pending",
      image: "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg",
      views: 180,
      likes: 22,
    },
  ];

  const [activeTab, setActiveTab] = useState<"submissions" | "achievements">(
    "submissions"
  );

  // Mock user stats data
  const userStats = {
    totalSubmissions: 12,
    wins: 3,
    views: 2450,
    likes: 120,
    rating: 4.7,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "winner":
        return Colors[colorScheme].chart1;
      case "accepted":
        return Colors[colorScheme].primary;
      case "pending":
        return Colors[colorScheme].mutedForeground;
      case "rejected":
        return Colors[colorScheme].destructive;
      default:
        return Colors[colorScheme].mutedForeground;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "winner":
        return "Giải thưởng";
      case "accepted":
        return "Được chấp nhận";
      case "pending":
        return "Đang xử lý";
      case "rejected":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  if (!isLoggedIn) {
    // Guest user view
    return (
      <View style={themedStyles.container}>
        <View
          style={[
            themedStyles.header,
            {
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            },
          ]}
        >
          <Text style={themedStyles.headerTitle}>Hồ sơ</Text>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={themedStyles.settingsButton}
          >
            <Settings size={24} color={Colors[colorScheme].accentForeground} />
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
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors[colorScheme].muted}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: Colors[colorScheme].foreground,
              marginTop: 16,
            }}
          >
            Bạn chưa đăng nhập
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors[colorScheme].mutedForeground,
              marginVertical: 12,
              textAlign: "center",
            }}
          >
            Đăng nhập để quản lý hồ sơ, theo dõi thành tích và tham gia các cuộc
            thi nghệ thuật hấp dẫn trên ArtChain.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: Colors[colorScheme].primary,
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 12,
              marginTop: 8,
            }}
            onPress={() => router.push("/login")}
          >
            <Text
              style={{
                color: Colors[colorScheme].primaryForeground,
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

  // Logged-in user view
  return (
    <View style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.headerTitle}>Hồ sơ</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={themedStyles.notificationButton}
          >
            <Ionicons
              size={24}
              color={Colors[colorScheme].accentForeground}
              name="notifications"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            style={themedStyles.settingsButton}
          >
            <Settings size={24} color={Colors[colorScheme].accentForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={themedStyles.profileSection}>
          <View style={themedStyles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
              }}
              style={themedStyles.avatar}
            />
            <TouchableOpacity style={themedStyles.cameraButton}>
              <Camera size={16} color={Colors[colorScheme].primaryForeground} />
            </TouchableOpacity>
          </View>

          <View style={themedStyles.profileInfo}>
            <Text style={themedStyles.userName}>Nguyễn Văn Nam</Text>
            <Text style={themedStyles.userTitle}>Nghệ sĩ độc lập</Text>

            <View style={themedStyles.userContact}>
              <View style={themedStyles.contactItem}>
                <Mail size={14} color={Colors[colorScheme].primary} />
                <Text style={themedStyles.contactText}>
                  nam.artist@email.com
                </Text>
              </View>
              <View style={themedStyles.contactItem}>
                <Phone size={14} color={Colors[colorScheme].primary} />
                <Text style={themedStyles.contactText}>+84 123 456 789</Text>
              </View>
              <View style={themedStyles.contactItem}>
                <MapPin size={14} color={Colors[colorScheme].primary} />
                <Text style={themedStyles.contactText}>TP. Hồ Chí Minh</Text>
              </View>
            </View>

            <TouchableOpacity style={themedStyles.editProfileButton}>
              <Edit3 size={16} color={Colors[colorScheme].primary} />
              <Text style={themedStyles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={themedStyles.statsSection}>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statNumber}>
              {userStats.totalSubmissions}
            </Text>
            <Text style={themedStyles.statLabel}>Tác phẩm</Text>
          </View>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statNumber}>{userStats.wins}</Text>
            <Text style={themedStyles.statLabel}>Giải thưởng</Text>
          </View>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statNumber}>
              {userStats.views.toLocaleString()}
            </Text>
            <Text style={themedStyles.statLabel}>Lượt xem</Text>
          </View>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statNumber}>{userStats.likes}</Text>
            <Text style={themedStyles.statLabel}>Lượt thích</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={themedStyles.ratingSection}>
          <View style={themedStyles.ratingContainer}>
            <Star
              size={20}
              color={Colors[colorScheme].chart1}
              fill={Colors[colorScheme].chart1}
            />
            <Text style={themedStyles.ratingText}>{userStats.rating}</Text>
            <Text style={themedStyles.ratingLabel}>Đánh giá trung bình</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={themedStyles.tabsContainer}>
          <TouchableOpacity
            style={[
              themedStyles.tab,
              activeTab === "submissions" && themedStyles.activeTab,
            ]}
            onPress={() => setActiveTab("submissions")}
          >
            <Text
              style={[
                themedStyles.tabText,
                activeTab === "submissions" && themedStyles.activeTabText,
              ]}
            >
              Tác phẩm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              themedStyles.tab,
              activeTab === "achievements" && themedStyles.activeTab,
            ]}
            onPress={() => setActiveTab("achievements")}
          >
            <Text
              style={[
                themedStyles.tabText,
                activeTab === "achievements" && themedStyles.activeTabText,
              ]}
            >
              Thành tích
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "submissions" && (
          <View style={themedStyles.tabContent}>
            {recentSubmissions.map((submission) => (
              <TouchableOpacity
                key={submission.id}
                style={themedStyles.submissionCard}
              >
                <Image
                  source={{ uri: submission.image }}
                  style={themedStyles.submissionImage}
                />
                <View style={themedStyles.submissionContent}>
                  <View style={themedStyles.submissionHeader}>
                    <Text style={themedStyles.submissionTitle}>
                      {submission.title}
                    </Text>
                    <View
                      style={[
                        themedStyles.statusBadge,
                        { backgroundColor: getStatusColor(submission.status) },
                      ]}
                    >
                      <Text style={themedStyles.statusText}>
                        {getStatusText(submission.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={themedStyles.contestName}>
                    {submission.contest}
                  </Text>
                  <Text style={themedStyles.submissionDate}>
                    Gửi ngày:{" "}
                    {new Date(submission.submissionDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Text>

                  <View style={themedStyles.submissionStats}>
                    <View style={themedStyles.submissionStat}>
                      <Eye size={14} color={Colors[colorScheme].primary} />
                      <Text style={themedStyles.submissionStatText}>
                        {submission.views}
                      </Text>
                    </View>
                    <View style={themedStyles.submissionStat}>
                      <Heart size={14} color={Colors[colorScheme].primary} />
                      <Text style={themedStyles.submissionStatText}>
                        {submission.likes}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "achievements" && (
          <View style={themedStyles.tabContent}>
            <View style={themedStyles.achievementCard}>
              <Trophy size={24} color={Colors[colorScheme].chart1} />
              <View style={themedStyles.achievementContent}>
                <Text style={themedStyles.achievementTitle}>
                  Giải Nhất "Vẽ Sài Gòn Xanh"
                </Text>
                <Text style={themedStyles.achievementSubtitle}>
                  2024 - TP. Hồ Chí Minh
                </Text>
              </View>
            </View>
            <View style={themedStyles.achievementCard}>
              <Award size={24} color={Colors[colorScheme].primary} />
              <View style={themedStyles.achievementContent}>
                <Text style={themedStyles.achievementTitle}>
                  Top 10 "Nghệ Thuật Đường Phố"
                </Text>
                <Text style={themedStyles.achievementSubtitle}>
                  2024 - Quận 1
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
    notificationButton: {
      position: "relative",
      padding: 8,
    },
    notificationDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors[scheme].destructive,
      zIndex: 1,
    },
    notificationIcon: {
      fontSize: 20,
    },
    settingsButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginTop: 8,
      borderRadius: 6,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: Colors[scheme].primary,
    },
    cameraButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: Colors[scheme].primary,
      borderRadius: 16,
      padding: 8,
      borderWidth: 3,
      borderColor: Colors[scheme].card,
    },
    profileInfo: {
      alignItems: "center",
      width: "100%",
    },
    userName: {
      fontSize: 22,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    userTitle: {
      fontSize: 16,
      color: Colors[scheme].mutedForeground,
      marginBottom: 16,
    },
    userContact: {
      width: "100%",
      marginBottom: 16,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      justifyContent: "center",
    },
    contactText: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      marginLeft: 8,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[scheme].accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors[scheme].primary,
    },
    editProfileText: {
      color: Colors[scheme].foreground,
      fontWeight: "600",
      marginLeft: 6,
    },
    statsSection: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginTop: 6,
      borderRadius: 6,
      paddingVertical: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    statCard: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      textAlign: "center",
    },
    ratingSection: {
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginTop: 5,
      borderRadius: 6,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    ratingText: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginLeft: 8,
      marginRight: 8,
    },
    ratingLabel: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginTop: 6,
      borderRadius: 6,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: 15,
      alignItems: "center",
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: Colors[scheme].primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[scheme].mutedForeground,
    },
    activeTabText: {
      color: Colors[scheme].primaryForeground,
    },
    tabContent: {
      marginTop: 16,
    },
    submissionCard: {
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginBottom: 8,
      borderRadius: 6,
      padding: 10,
      flexDirection: "row",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
      borderColor: Colors[scheme].border,
      borderWidth: 1,
    },
    submissionImage: {
      width: 100,
      height: 120,
      borderRadius: 6,
      marginRight: 12,
    },
    submissionContent: {
      flex: 1,
    },
    submissionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    submissionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: Colors[scheme].primaryForeground,
      fontSize: 10,
      fontWeight: "600",
    },
    contestName: {
      fontSize: 14,
      color: Colors[scheme].primary,
      fontWeight: "500",
      marginBottom: 4,
    },
    submissionDate: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      marginBottom: 8,
    },
    submissionStats: {
      flexDirection: "row",
    },
    submissionStat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    submissionStatText: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      marginLeft: 4,
    },
    achievementCard: {
      backgroundColor: Colors[scheme].card,
      marginHorizontal: 4,
      marginBottom: 12,
      borderRadius: 6,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: Colors[scheme].border,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
      borderColor: Colors[scheme].border,
      borderWidth: 1,
    },
    achievementContent: {
      marginLeft: 16,
      flex: 1,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    achievementSubtitle: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      marginBottom: 4,
    },
    achievementDate: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
    },
  });
}
