import { useGetPaintings } from "@/apis/painting";
import { useUserById } from "@/apis/user";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Painting } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

export default function ContestPaintingsScreen() {
  const { contestId, contestTitle } = useLocalSearchParams<{
    contestId: string;
    contestTitle: string;
  }>();

  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const s = styles(C);

  const {
    data: paintings,
    isLoading,
    error,
  } = useGetPaintings({
    contestId: contestId!,
  });

  const PaintingItem = ({ painting }: { painting: Painting }) => {
    const { data: user } = useUserById(painting.competitorId);
    console.log(painting.imageUrl);
    return (
      <TouchableOpacity
        style={s.paintingCard}
        onPress={() => {
          router.push({
            pathname: "/painting-evaluation",
            params: {
              paintingId: painting.paintingId,
              contestTitle: contestTitle,
              paintingTitle: painting.title,
              artistName: user?.fullName || `Artist ${painting.competitorId}`,
              imageUrl: encodeURIComponent(painting.imageUrl),
            },
          });
        }}
      >
        <Image
          source={{ uri: painting.imageUrl }}
          style={s.paintingImage}
          placeholder={require("@/assets/images/partial-react-logo.png")}
          contentFit="cover"
        />
        <View style={s.paintingInfo}>
          <Text style={s.paintingTitle} numberOfLines={2}>
            {painting.title}
          </Text>
          <Text style={s.artistName}>
            <Text style={s.labelText}>Nghệ sĩ: </Text>
            {user?.fullName || `Artist ${painting.competitorId}`}
          </Text>
          <Text style={s.submissionDate}>
            <Text style={s.labelText}>Đã gửi: </Text>
            {new Date(painting.submissionDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={s.evaluateContainer}>
          <Text style={s.evaluateText}>Chấm bài</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={C.foreground} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Tranh</Text>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Đang tải tranh...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={C.foreground} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Tranh</Text>
        </View>
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={C.muted} />
          <Text style={s.errorText}>Không thể tải tranh</Text>
          <TouchableOpacity
            style={s.retryButton}
            onPress={() => {
              // Refetch would happen automatically on re-render
            }}
          >
            <Text style={s.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {contestTitle ? `${contestTitle} - Tranh` : "Tranh cuộc thi"}
        </Text>
      </View>

      {paintings && paintings.length > 0 ? (
        <FlatList
          data={paintings}
          keyExtractor={(item) => item.paintingId}
          renderItem={({ item }) => <PaintingItem painting={item} />}
          contentContainerStyle={s.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={C.muted} />
          <Text style={s.emptyText}>Chưa có tranh nào được gửi</Text>
        </View>
      )}
    </View>
  );
}

const styles = (C: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: C.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: C.foreground,
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: C.mutedForeground,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: C.mutedForeground,
      marginTop: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: C.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: C.primaryForeground,
      fontWeight: "600",
    },
    listContainer: {
      padding: 16,
    },
    paintingCard: {
      backgroundColor: C.card,
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
      overflow: "hidden",
    },
    paintingImage: {
      width: "100%",
      height: 200,
    },
    paintingInfo: {
      padding: 12,
    },
    paintingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: C.foreground,
      marginBottom: 4,
    },
    artistName: {
      fontSize: 14,
      color: C.mutedForeground,
      marginBottom: 2,
    },
    submissionDate: {
      fontSize: 12,
      color: C.mutedForeground,
    },
    labelText: {
      fontWeight: "600",
      color: C.foreground,
    },
    evaluateContainer: {
      backgroundColor: C.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    evaluateText: {
      color: C.primaryForeground,
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
      color: C.mutedForeground,
      marginTop: 16,
      textAlign: "center",
    },
  });
