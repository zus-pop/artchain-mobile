// app/(tabs)/painting-score.tsx
import { useWhoAmI } from "@/apis/auth";
import { useExaminerContest } from "@/apis/contest";
import ContestCardForTab from "@/components/cards/ContestCardForTab";
import EmptyTab from "@/components/tabs/EmptyTab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ExaminerContest } from "@/types";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

function TopBar({ C, title }: { C: ColorTokens; title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.topbarGrad,
        {
          paddingTop: insets.top,
          backgroundColor: "",
        },
      ]}
    >
      <Text
        style={[
          styles.headerTitle,
          {
            color: "#fff",
            textShadowColor: "rgba(0,0,0,0.25)",
            textShadowRadius: 2,
          },
        ]}
      >
        {title}
      </Text>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.iconBtn}>
          <Ionicons name="brush-outline" size={22} color="#fff" />
        </View>
      </View>
    </View>
  );
}

function CenteredState({
  C,
  icon,
  title,
  message,
}: {
  C: ColorTokens;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <Ionicons name={icon} size={64} color={C.muted} />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: C.foreground,
          marginTop: 16,
        }}
      >
        {title}
      </Text>
      {!!message && (
        <Text
          style={{
            fontSize: 14,
            color: C.mutedForeground,
            marginVertical: 10,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

export default function PaintingScoreScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];

  const { data: user, isLoading: loadingMe } = useWhoAmI();
  const {
    data: ongoingContests,
    isLoading: loadingContests,
    refetch,
  } = useExaminerContest(user?.userId);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const isLoading = loadingMe || loadingContests;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <TopBar C={C} title="Bài thi của tôi" />

      {isLoading ? (
        <CenteredState
          C={C}
          icon="brush-outline"
          title="Đang tải danh sách cuộc thi..."
        />
      ) : !user ? (
        <CenteredState
          C={C}
          icon="person-circle-outline"
          title="Bạn chưa đăng nhập"
          message="Đăng nhập để xem các cuộc thi và bài thi được phân công."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: C.foreground,
                marginBottom: 4,
              }}
            >
              Các cuộc thi được giao
            </Text>
            <Text style={{ fontSize: 13, color: C.mutedForeground }}>
              Chọn cuộc thi để xem và chấm bài.
            </Text>
          </View>

          {ongoingContests && ongoingContests.length > 0 ? (
            <View style={{ gap: 24 }}>
              {ongoingContests.map((contest: ExaminerContest) => (
                <ContestCardForTab
                  key={contest.contestId}
                  C={C}
                  contest={contest}
                  onEvaluate={(c) => {
                    router.push({
                      pathname: "/contest-paintings",
                      params: {
                        contestId: c.contestId,
                        contestTitle: c.title,
                        examinerRole: c.examinerRole,
                      },
                    });
                  }}
                />
              ))}
            </View>
          ) : (
            <EmptyTab
              C={C}
              icon="time-outline"
              text="Chưa có cuộc thi nào được giao"
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbarGrad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  iconBtn: { padding: 8, marginLeft: 4 },
});
