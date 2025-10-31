import { useWhoAmI } from "@/apis/auth";
import { usePosts } from "@/apis/post";
import PodiumTop123, { Winner } from "@/assets/PodiumTop123";
import PostCard from "@/components/cards/PostCard";
import CollapsibleHeader, {
  HEADER_COLLAPSED,
  HEADER_EXPANDED,
} from "@/components/header/CollapsibleHeader";
import PostCarousel from "@/components/PostCarousel";
import themedStyles from "@/components/styleSheet/themeSheet";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =================== Balloons + Gradient Background =================== */
const { width: W, height: H } = Dimensions.get("window");

type BalloonSpec = {
  id: string;
  size: number;
  left: number; // 0..1
  duration: number; // ms
  delay: number; // ms
  sway: number; // px
  color: string; // hex
  alpha: number; // 0..1
  from: number; // px bottom
  to: number; // px top negative
};

const COLORS = [
  "#FF6B6B",
  "#F59E0B",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#22D3EE",
  "#84CC16",
  "#FB7185",
  "#F97316",
];

const rand = (a: number, b: number) => Math.random() * (b - a) + a;

function makeBalloons(n = 16): BalloonSpec[] {
  return Array.from({ length: n }, (_, i) => {
    const size = rand(36, 76);
    const left = rand(0.05, 0.95);
    const duration = rand(14000, 20000);
    const delay = rand(0, 7000);
    const sway = rand(10, 28);
    const color = COLORS[i % COLORS.length];
    const alpha = rand(0.16, 0.3);
    const from = H + rand(20, 120);
    const to = -rand(80, 160);
    return {
      id: `b_${i}`,
      size,
      left,
      duration,
      delay,
      sway,
      color,
      alpha,
      from,
      to,
    };
  });
}

const SoftMultiGradient: React.FC<{ scheme: "light" | "dark" }> = ({
  scheme,
}) => {
  const g =
    scheme === "dark"
      ? ["#0f172a", "#17153B", "#1F2544"]
      : ["#FEE2E2", "#E0E7FF", "#D1FAE5"];
  return (
    <LinearGradient
      colors={g as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
};

const BalloonsBackground: React.FC<{ scheme: "light" | "dark" }> = ({
  scheme,
}) => {
  const balloons = useMemo(() => makeBalloons(16), []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SoftMultiGradient scheme={scheme} />
      <LinearGradient
        pointerEvents="none"
        colors={[
          "#ffffff11",
          "#ffffff00",
          scheme === "dark" ? "#00000022" : "#00000011",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {balloons.map((b, i) => (
        <Balloon key={b.id} spec={b} zIndex={i} scheme={scheme} />
      ))}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              scheme === "dark" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
          },
        ]}
      />
    </View>
  );
};

const Balloon: React.FC<{
  spec: BalloonSpec;
  zIndex: number;
  scheme: string;
}> = ({ spec, zIndex, scheme }) => {
  const ty = useRef(new Animated.Value(spec.from)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rise = Animated.loop(
      Animated.sequence([
        Animated.delay(spec.delay),
        Animated.parallel([
          Animated.timing(ty, {
            toValue: spec.to,
            duration: spec.duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(op, {
              toValue: spec.alpha,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(spec.duration - 2400),
            Animated.timing(op, {
              toValue: 0,
              duration: 1200,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(tx, {
          toValue: spec.sway,
          duration: spec.duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: -spec.sway,
          duration: spec.duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const rotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rot, {
          toValue: 1,
          duration: spec.duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: 0,
          duration: spec.duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    rise.start();
    sway.start();
    rotLoop.start();
    return () => {
      rise.stop();
      sway.stop();
      rotLoop.stop();
    };
  }, []);

  const leftPx = spec.left * W - spec.size / 2;
  const rdeg = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ["-6deg", "6deg"],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: leftPx,
        bottom: -spec.size,
        width: spec.size,
        height: spec.size * 1.25,
        zIndex,
        opacity: op,
        transform: [
          { translateY: ty },
          { translateX: tx },
          { rotate: rdeg as any },
        ],
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: spec.size,
          backgroundColor: spec.color,
          opacity: scheme === "dark" ? spec.alpha + 0.05 : spec.alpha,
          shadowColor: spec.color,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      />
      <View
        style={{
          width: spec.size * 0.18,
          height: spec.size * 0.18,
          backgroundColor: spec.color,
          opacity: scheme === "dark" ? spec.alpha + 0.05 : spec.alpha,
          borderBottomLeftRadius: spec.size * 0.1,
          borderBottomRightRadius: spec.size * 0.1,
          alignSelf: "center",
          marginTop: -4,
        }}
      />
      <View
        style={{
          width: 1.2,
          height: spec.size * 0.9,
          backgroundColor:
            scheme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
          alignSelf: "center",
        }}
      />
    </Animated.View>
  );
};
/* =================== End Background =================== */

/* =================== Data =================== */
type UtilityItem = {
  id: string;
  icon: any;
  label: string;
  color: string;
  badge?: string;
  onPress?: () => void;
};

/* =================== Screen =================== */
export default function Home() {
  const { data, refetch: refetchMe } = useWhoAmI();
  const { data: postsData, refetch: refetchPosts } = usePosts();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";

  const posts = postsData?.data || [];
  const UTIL_COLS = 3;
  const GRID_GAP = 22;
  const GRID_PAD_H = 20;
  const TILE_W = (W - GRID_PAD_H * 2 - GRID_GAP * (UTIL_COLS - 1)) / UTIL_COLS;

  const artUtilities: UtilityItem[] = [
    {
      id: "u1",
      icon: "color-palette-outline",
      label: "Chủ đề",
      color: "#a855f7",
    },
    {
      id: "u2",
      icon: "brush-outline",
      label: "Tạo\ncuộc thi",
      color: "#f97316",
    },
    { id: "u3", icon: "images-outline", label: "Tác phẩm", color: "#06b6d4" },
    {
      id: "u4",
      icon: "play-outline",
      label: "Tham gia",
      color: "#22c55e",
      badge: "Mới",
    },
    {
      id: "u5",
      icon: "trophy-outline",
      label: "Bảng xếp hạng",
      color: "#eab308",
    },
    { id: "u6", icon: "book-outline", label: "Thể lệ", color: "#f43f5e" },
  ];

  const winners: [Winner, Winner, Winner] = [
    {
      name: "Nguyen An",
      avatarUri: "https://i.pravatar.cc/150?img=1",
      badgeText: "98 điểm",
    },
    {
      name: "Tran Binh",
      avatarUri: "https://i.pravatar.cc/150?img=2",
      badgeText: "96 điểm",
    },
    {
      name: "Le Chi",
      avatarUri: "https://i.pravatar.cc/150?img=3",
      badgeText: "94 điểm",
    },
  ];

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerProgress = useRef(new Animated.Value(1)).current;
  const lastY = useRef(0);
  const isOpen = useRef(false);
  const THRESHOLD = 60;
  const HYST = 14;

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y as number;
    const goingUp = y < lastY.current;
    lastY.current = y;

    if (goingUp && y <= THRESHOLD && !isOpen.current) {
      isOpen.current = true;
      Animated.spring(headerProgress, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else if (!goingUp && y >= THRESHOLD + HYST && isOpen.current) {
      isOpen.current = false;
      Animated.spring(headerProgress, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    }
  };

  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetchMe();
    refetchPosts();
    setRefreshing(false);
  }, []);

  // hero/pager auto (nếu dùng)
  const { AnimatedPagerView, ref } = usePagerView();
  const page = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      page.current = (page.current + 1) % 3;
      ref.current?.setPage(page.current);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(headerProgress, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View
      style={[
        themedStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* Nền “promax” */}
      <BalloonsBackground scheme={colorScheme} />

      <CollapsibleHeader
        progress={headerProgress}
        username={data ? data.fullName : "Guest"}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED + 100 * (1 - 0.5) + 10,
          paddingBottom: 120,
        }}
        scrollEventThrottle={16}
        bounces
        alwaysBounceVertical
        onScroll={(e) => {
          if (!refreshing) handleScroll(e);
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            titleColor="#f97316"
            colors={["#f97316"]}
            progressBackgroundColor="#fff"
            progressViewOffset={insets.top + HEADER_COLLAPSED / 2}
          />
        }
      >
        {/* Podium */}
        <View style={{ paddingTop: 20 }}>
          <PodiumTop123
            winners={[
              {
                id: "art-001",
                name: "Nguyen An",
                avatarUri:
                  "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg",
                badgeText: "98 điểm",
              },
              {
                id: "art-002",
                name: "Tran Binh",
                avatarUri:
                  "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg",
                badgeText: "96 điểm",
              },
              {
                id: "art-003",
                name: "Le Chi",
                avatarUri:
                  "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg",
                badgeText: "94 điểm",
              },
            ]}
            sizes={{ overallScale: 0.9, mainAvatar: 100, sideAvatar: 84 }}
            avatarOffsetY={{ main: -12, side: -22 }}
            ring={{ width: 3, innerWidth: 2 }}
            halo={{ forAll: true, enabled: true, pulseMs: 1400, spread: 0.32 }}
            sparkle={{ enabled: true }}
            fireworks={{
              enabled: true,
              loopMs: 3000,
              particleCount: 34,
              durationMs: 1100,
            }}
          />
        </View>

        {/* Thông báo mới — Carousel promax + List gọn */}
        <View style={themedStyles.section}>
          <View
            style={[themedStyles.sectionHeader, { alignItems: "baseline" }]}
          >
            <View>
              <Text style={themedStyles.sectionTitle}>Thông báo mới</Text>
            </View>
            <TouchableOpacity
              style={themedStyles.seeAllBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/posts")}
            >
              <Text style={[themedStyles.seeAllText, { fontWeight: "800" }]}>
                Xem tất cả
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors[colorScheme].accentForeground}
              />
            </TouchableOpacity>
          </View>

          {posts.length > 0 ? (
            <>
              <PostCarousel
                data={posts}
                scheme={colorScheme}
                onPressItem={(post) =>
                  router.push({
                    pathname: "/post-detail",
                    params: { post: JSON.stringify(post) },
                  })
                }
              />

              <View style={{ marginTop: 8 }}>
                {posts.slice(0, 4).map((item) => (
                  <PostCard
                    key={item.post_id}
                    item={item}
                    thumbSize={88}
                    showDivider
                    onPress={(post) =>
                      router.push({
                        pathname: "/post-detail",
                        params: { post: JSON.stringify(post) },
                      })
                    }
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors[colorScheme].mutedForeground}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors[colorScheme].mutedForeground,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Chưa có thông báo nào
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme].mutedForeground,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Thông báo mới sẽ xuất hiện ở đây
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
