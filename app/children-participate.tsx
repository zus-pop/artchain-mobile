import { useWhoAmI } from "@/apis/auth";
import { useGuardianChildren } from "@/apis/guardian";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContestParticipateScreen() {
  const { contestId, roundId } = useLocalSearchParams<{
    contestId: string;
    roundId: string;
  }>();
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { data: user } = useWhoAmI();
  const {
    data: children,
    isLoading,
    error,
  } = useGuardianChildren(user?.userId);
  // Avatar colors for children
  const childAvatars = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  const getChildAvatar = (index: number) => {
    return childAvatars[index % childAvatars.length];
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: C.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.foreground }]}>
            Chọn con em tham gia
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.loadingText, { color: C.foreground }]}>
            Đang tải danh sách con em...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: C.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: C.foreground }]}>
            Chọn con em tham gia
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={C.destructive} />
          <Text style={[styles.errorText, { color: C.foreground }]}>
            Không thể tải danh sách con em
          </Text>
          <Text style={[styles.errorSubtext, { color: C.mutedForeground }]}>
            {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.foreground }]}>
          Chọn con em tham gia
        </Text>
      </View>

      <View style={styles.content}>
        {children && children.length > 0 ? (
          <FlatList
            data={children}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item, index }) => (
              <View style={[styles.childCard, { backgroundColor: C.card }]}>
                <View style={styles.childHeader}>
                  <View
                    style={[
                      styles.childAvatar,
                      { backgroundColor: getChildAvatar(index) },
                    ]}
                  >
                    <Ionicons name="person-outline" size={24} color="white" />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={[styles.childName, { color: C.foreground }]}>
                      {item.fullName || "Tên chưa cập nhật"}
                    </Text>
                    <Text
                      style={[
                        styles.childDetails,
                        { color: C.mutedForeground },
                      ]}
                    >
                      {item.grade || "Chưa cập nhật"} -{" "}
                      {item.schoolName || "Chưa cập nhật"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: C.primary }]}
                  onPress={() => {
                    router.push({
                      pathname: "/painting-upload",
                      params: {
                        type: "GUARDIAN",
                        contestId: contestId,
                        roundId: roundId,
                        competitorId: item.userId,
                      },
                    });
                  }}
                >
                  <Ionicons
                    name="brush"
                    size={18}
                    color={C.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.submitButtonText,
                      { color: C.primaryForeground },
                    ]}
                  >
                    Nộp bài cho {item.fullName}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={C.muted} />
                <Text style={[styles.emptyText, { color: C.mutedForeground }]}>
                  Chưa có thông tin con em
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addChildButton,
                    { backgroundColor: C.primary },
                  ]}
                  onPress={() => router.push("/add-child")}
                >
                  <Ionicons name="add" size={20} color={C.primaryForeground} />
                  <Text
                    style={[
                      styles.addChildButtonText,
                      { color: C.primaryForeground },
                    ]}
                  >
                    Thêm con em
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={C.muted} />
            <Text style={[styles.emptyText, { color: C.mutedForeground }]}>
              Chưa có thông tin con em
            </Text>
            <TouchableOpacity
              style={[styles.addChildButton, { backgroundColor: C.primary }]}
              onPress={() => router.push("/add-child")}
            >
              <Ionicons name="add" size={20} color={C.primaryForeground} />
              <Text
                style={[
                  styles.addChildButtonText,
                  { color: C.primaryForeground },
                ]}
              >
                Thêm con em
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  childCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
  },
  addChildButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
