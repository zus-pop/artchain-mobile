import { useExaminerContest } from "@/apis/contest";
import ContestCardForTab from "@/components/cards/ContestCardForTab";
import { PLATFORM_HEADER_CONFIG } from "@/constants/headerConfig";
import type { ExaminerContest } from "@/types/contest";
import type { ColorTokens } from "@/types/tabkey";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ===== Adaptive Responsive Spacing =====
const getAdaptivePadding = () => {
  if (SCREEN_WIDTH < 360) return 14;
  if (SCREEN_WIDTH < 480) return 16;
  return 20;
};

const CARD_SPACING = 16;
const HORIZONTAL_PADDING = getAdaptivePadding();
const SECTION_PADDING = getAdaptivePadding() + 4;

type Props = {
  C: ColorTokens;
  userId?: string;
  vertical?: boolean; // true = full screen mode (contests.tsx), false = profile tab mode
};

/**
 * 🎨 Premium Creative ExaminerContestsPanel
 * - SafeAreaView with proper edge handling
 * - Animated gradient header with stats
 * - Bouncing loading animation with visual feedback
 * - Gradient-enhanced error/empty states with icons
 * - Glassmorphism effects
 * - Responsive adaptive padding
 * - Micro-interactions and smooth transitions
 * - Professional premium design
 */
export default function ExaminerContestsPanel({
  C,
  userId,
  vertical = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs for loading bounce effect
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const {
    data: ongoingContests,
    isLoading,
    error,
    refetch,
  } = useExaminerContest(userId);

  // ===== Sort data: newest contests first (higher contestId = newer) =====
  const sortedContests = useMemo(() => {
    if (!ongoingContests) return undefined;
    return [...ongoingContests].sort((a, b) => b.contestId - a.contestId);
  }, [ongoingContests]);

  // ===== Bouncing Animation =====
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -24,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isLoading, bounceAnim]);

  // ===== Pulse Animation =====
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isLoading, pulseAnim]);

  const handleEvaluate = useCallback((contest: ExaminerContest) => {
    router.push({
      pathname: "/contest-paintings",
      params: {
        contestId: contest.contestId,
        contestTitle: contest.title,
        examinerRole: contest.examinerRole,
      },
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // ===== Premium Gradient Header =====
  const renderHeader = useCallback(() => {
    if (!vertical) return null;

    const safeAreaTop = PLATFORM_HEADER_CONFIG.SAFE_AREA_PADDING;
    const activeCount =
      ongoingContests?.filter((c) => c.status === "ACTIVE")?.length ?? 0;
    const totalCount = ongoingContests?.length ?? 0;

    return (
      <LinearGradient
        colors={[
          C.primary ?? "#5C1A1A",
          C.primary ?? "#5C1A1A",
          C.primary ?? "#5C1A1A",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 1.2 }}
        locations={[0, 0.5, 1]}
        style={{
          paddingHorizontal: HORIZONTAL_PADDING + 4,
          paddingTop: insets.top + safeAreaTop + 8,
          paddingBottom: SECTION_PADDING + 12,
        }}
      >
        {/* Decorative Gradient Orb Background */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            opacity: 0.6,
          }}
        />

        {/* Title Section */}
        <View style={{ marginBottom: 16, zIndex: 2 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  fontFamily: "Outfit",
                  letterSpacing: 0.5,
                  textShadowColor: "rgba(0, 0, 0, 0.15)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 3,
                }}
              >
                Chấm thi
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontFamily: "Quicksand",
                  fontWeight: "500",
                  marginTop: 4,
                  letterSpacing: 0.3,
                }}
              >
                Danh sách được giao
              </Text>
            </View>

            {/* Badge Icon */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="badge-account-horizontal-outline"
                size={28}
                color="rgba(255, 255, 255, 0.9)"
              />
            </View>
          </View>
        </View>

        {/* Stats Bar */}
        {!isLoading && totalCount > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingTop: 16,
              zIndex: 2,
            }}
          >
            {/* Total Contests Stat */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255, 255, 255, 0.11)",
                paddingVertical: 11,
                paddingHorizontal: 13,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.14)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="trophy-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: "rgba(255, 255, 255, 0.75)",
                    fontFamily: "Quicksand",
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  Tổng cộng
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    fontFamily: "Outfit",
                  }}
                >
                  {totalCount}
                </Text>
              </View>
            </View>

            {/* Active Contests Stat */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(255, 255, 255, 0.11)",
                paddingVertical: 11,
                paddingHorizontal: 13,
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.14)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="flame-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: "rgba(255, 255, 255, 0.75)",
                    fontFamily: "Quicksand",
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  Đang diễn ra
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    fontFamily: "Outfit",
                  }}
                >
                  {activeCount}
                </Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    );
  }, [vertical, C.primary, insets.top, isLoading, ongoingContests]);

  // ===== Creative Loading State =====
  if (isLoading && (!ongoingContests || ongoingContests.length === 0)) {
    const loadingContent = (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 80,
          paddingHorizontal: HORIZONTAL_PADDING,
        }}
      >
        {/* Bouncing Animation */}
        <View
          style={{
            height: 100,
            marginBottom: 32,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: C.primary ?? "#5C1A1A",
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -24],
                    }),
                  },
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    }),
                  },
                ],
                opacity: index === 0 ? 0.4 : index === 1 ? 0.65 : 0.9,
              }}
            />
          ))}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: C.primary ?? "#5C1A1A",
            fontFamily: "Outfit",
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          Đang tải
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: C.mutedForeground ?? "#7C5B4F",
            fontFamily: "Quicksand",
            fontWeight: "500",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Chuẩn bị danh sách cuộc thi của bạn...
        </Text>
      </View>
    );

    if (vertical) {
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: C.background ?? "#FAF7F2" }}
          edges={["left", "right", "bottom"]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingVertical: 0,
              paddingHorizontal: 0,
              paddingBottom: (insets.bottom || 0) + 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={C.primary ?? "#5C1A1A"}
                colors={[C.primary ?? "#5C1A1A"]}
                progressBackgroundColor={C.background ?? "#FAF7F2"}
              />
            }
          >
            {renderHeader()}
            {loadingContent}
          </ScrollView>
        </SafeAreaView>
      );
    }
    return loadingContent;
  }

  // ===== Premium Error State =====
  if (error && (!ongoingContests || ongoingContests.length === 0)) {
    const errorContent = (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 80,
          paddingHorizontal: HORIZONTAL_PADDING,
        }}
      >
        {/* Error Icon Container */}
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
            backgroundColor: (C.destructive ?? "#EF4444") + "12",
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={50}
            color={C.destructive ?? "#EF4444"}
          />
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: C.primary ?? "#5C1A1A",
            fontFamily: "Outfit",
            marginBottom: 12,
            letterSpacing: 0.3,
          }}
        >
          Không tải được dữ liệu
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: C.mutedForeground ?? "#7C5B4F",
            textAlign: "center",
            marginBottom: 32,
            fontFamily: "Quicksand",
            lineHeight: 21,
          }}
        >
          Có vấn đề xảy ra. Vui lòng kiểm tra kết nối Internet và thử lại.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            paddingVertical: 13,
            paddingHorizontal: 40,
            borderRadius: 12,
            backgroundColor: C.primary ?? "#5C1A1A",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "800",
              fontFamily: "Outfit",
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );

    if (vertical) {
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: C.background ?? "#FAF7F2" }}
          edges={["left", "right", "bottom"]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingVertical: 0,
              paddingHorizontal: 0,
              paddingBottom: (insets.bottom || 0) + 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={C.primary ?? "#5C1A1A"}
                colors={[C.primary ?? "#5C1A1A"]}
                progressBackgroundColor={C.background ?? "#FAF7F2"}
              />
            }
          >
            {renderHeader()}
            {errorContent}
          </ScrollView>
        </SafeAreaView>
      );
    }
    return errorContent;
  }

  // ===== Premium Empty State =====
  if (!ongoingContests || ongoingContests.length === 0) {
    const emptyContent = (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 80,
          paddingHorizontal: HORIZONTAL_PADDING,
        }}
      >
        {/* Empty Icon Container */}
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
            backgroundColor: (C.chart1 ?? "#C9A96E") + "12",
          }}
        >
          <MaterialCommunityIcons
            name="inbox-outline"
            size={50}
            color={C.chart1 ?? "#C9A96E"}
          />
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: C.primary ?? "#5C1A1A",
            fontFamily: "Outfit",
            marginBottom: 12,
            letterSpacing: 0.3,
          }}
        >
          Không có cuộc thi nào
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: C.mutedForeground ?? "#7C5B4F",
            textAlign: "center",
            fontFamily: "Quicksand",
            lineHeight: 21,
          }}
        >
          Hiện tại chưa có cuộc thi nào được gán cho bạn. Hãy quay lại sau để
          kiểm tra những cơ hội mới.
        </Text>
      </View>
    );

    if (vertical) {
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: C.background ?? "#FAF7F2" }}
          edges={["left", "right", "bottom"]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingVertical: 0,
              paddingHorizontal: 0,
              paddingBottom: (insets.bottom || 0) + 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={C.primary ?? "#5C1A1A"}
                colors={[C.primary ?? "#5C1A1A"]}
                progressBackgroundColor={C.background ?? "#FAF7F2"}
              />
            }
          >
            {renderHeader()}
            {emptyContent}
          </ScrollView>
        </SafeAreaView>
      );
    }
    return emptyContent;
  }

  // ===== Success State - Content Rendering =====
  const contestsContent = (
    <View
      style={{
        gap: CARD_SPACING,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 12,
        paddingBottom: SECTION_PADDING,
      }}
    >
      {sortedContests?.map((contest: ExaminerContest) => (
        <View
          key={contest.contestId}
          style={{
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <ContestCardForTab
            C={C}
            contest={contest}
            onEvaluate={handleEvaluate}
          />
        </View>
      ))}
    </View>
  );

  // ===== Render based on mode =====
  if (vertical) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: C.background ?? "#FAF7F2" }}
        edges={["left", "right", "bottom"]}
      >
        {renderHeader()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingVertical: 0,
            paddingHorizontal: 0,
            paddingBottom: (insets.bottom || 0) + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary ?? "#5C1A1A"}
              colors={[C.primary ?? "#5C1A1A"]}
              progressBackgroundColor={C.background ?? "#FAF7F2"}
            />
          }
        >
          {contestsContent}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Profile mode (horizontal): just return content for use in parent FlatList/ScrollView
  return contestsContent;
}
