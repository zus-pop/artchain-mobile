import PodiumTop123, { Winner } from "@/assets/PodiumTop123";
import AnnouncementCard from "@/components/cards/AnnouncementCard";
import CollapsibleHeader, {
  HEADER_COLLAPSED,
  HEADER_EXPANDED,
} from "@/components/header/CollapsibleHeader";
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
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWhoAmI } from "../../apis/auth";
import themedStyles from "../../components/styleSheet/themeSheet";

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
      colors={g}
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
interface Announcement {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  type: "contest" | "result";
}
type UtilityItem = {
  id: string;
  icon: any;
  label: string;
  color: string;
  badge?: string;
  onPress?: () => void;
};

const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Khai mạc cuộc thi Vẽ Sài Gòn Xanh",
    summary:
      "Cuộc thi vẽ về một thành phố xanh, bền vững và thân thiện với môi trường đã chính thức bắt đầu!",
    image: "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
    date: "2025-01-01",
    type: "contest",
  },
  {
    id: "a2",
    title: "Kết quả cuộc thi Nghệ Thuật Đường Phố",
    summary:
      "Xin chúc mừng các nghệ sĩ đã đạt giải trong cuộc thi Nghệ Thuật Đường Phố! Xem danh sách người thắng cuộc và tác phẩm nổi bật.",
    image: "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
    date: "2025-02-01",
    type: "result",
  },
  {
    id: "a3",
    title: "Thông báo cuộc thi Di Sản Văn Hóa",
    summary:
      "Cuộc thi Di Sản Văn Hóa sẽ diễn ra vào tháng 3. Đăng ký tham gia ngay để nhận giải thưởng hấp dẫn!",
    image: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
    date: "2025-02-15",
    type: "contest",
  },
  {
    id: "a4",
    title: "Kết quả cuộc thi Vẽ Thiên Nhiên Việt Nam",
    summary:
      "Cuộc thi Vẽ Thiên Nhiên Việt Nam đã kết thúc. Xem các tác phẩm đoạt giải và cảm nhận vẻ đẹp quê hương qua tranh vẽ.",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
    date: "2025-03-10",
    type: "result",
  },
  {
    id: "a5",
    title: "Cuộc thi Nghệ Thuật Trẻ",
    summary:
      "Dành cho các nghệ sĩ trẻ tuổi dưới 18. Tham gia để thể hiện tài năng của bạn!",
    image: "https://images.pexels.com/photos/1450354/pexels-photo-1450354.jpeg",
    date: "2025-04-01",
    type: "contest",
  },
  {
    id: "a6",
    title: "Kết quả cuộc thi Mỹ Thuật Hiện Đại",
    summary:
      "Các tác phẩm đoạt giải đã được công bố. Khám phá nghệ thuật hiện đại qua các bức tranh ấn tượng.",
    image: "https://images.pexels.com/photos/1450355/pexels-photo-1450355.jpeg",
    date: "2025-05-01",
    type: "result",
  },
];

/* =================== Announcement Carousel (đẹp & mượt) =================== */
const CARD_W = W * 0.78;
const SPACING = 14;
const SNAP_W = CARD_W + SPACING;

function AnnouncementCarousel({
  data,
  onPressItem,
  scheme,
}: {
  data: Announcement[];
  onPressItem?: (a: Announcement) => void;
  scheme: "light" | "dark";
}) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({
    item,
    index,
  }: {
    item: Announcement;
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * SNAP_W,
      index * SNAP_W,
      (index + 1) * SNAP_W,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [8, 0, 8],
      extrapolate: "clamp",
    });
    const rotate = scrollX.interpolate({
      inputRange,
      outputRange: ["-4deg", "0deg", "4deg"],
      extrapolate: "clamp",
    });

    const typeChip =
      item.type === "contest"
        ? { label: "Cuộc thi", color: "#22C55E" }
        : { label: "Kết quả", color: "#F59E0B" };

    return (
      <Animated.View
        style={{
          width: CARD_W,
          marginRight: SPACING,
          transform: [{ scale }, { translateY }, { rotate }],
        }}
      >
        {/* viền gradient mờ */}
        <LinearGradient
          colors={["#ffffff55", "#ffffff10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            inset: 0 as any,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        />

        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => onPressItem?.(item)}
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <ImageBackground
            source={{ uri: item.image }}
            style={{ height: 210 }}
            imageStyle={{ borderRadius: 20 }}
          >
            {/* glass overlay */}
            <LinearGradient
              colors={
                scheme === "dark"
                  ? ["rgba(0,0,0,0.15)", "rgba(0,0,0,0.65)"]
                  : ["rgba(255,255,255,0.1)", "rgba(0,0,0,0.55)"]
              }
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* chips */}
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                right: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: `${typeChip.color}E6`,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Ionicons
                  name={item.type === "contest" ? "trophy" : "checkmark-done"}
                  size={12}
                  color="#fff"
                />
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}
                >
                  {typeChip.label}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.28)",
                }}
              >
                <Ionicons name="calendar-outline" size={12} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}
                >
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {/* nội dung */}
            <View
              style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}
            >
              <Text
                numberOfLines={2}
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "900",
                  marginBottom: 6,
                  letterSpacing: 0.2,
                  textShadowColor: "rgba(0,0,0,0.35)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {item.summary}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  <Ionicons name="eye-outline" size={14} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}
                  >
                    Chi tiết
                  </Text>
                </View>
                <LinearGradient
                  colors={["#FDE68A", "#F59E0B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#FDE68A",
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <Ionicons name="chevron-forward" size={16} color="#111827" />
                </LinearGradient>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View>
      <Animated.FlatList
        data={data}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 12 }}
        snapToInterval={SNAP_W}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
      {/* dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
          marginTop: 8,
        }}
      >
        {data.map((_, i) => {
          const inputRange = [(i - 1) * SNAP_W, i * SNAP_W, (i + 1) * SNAP_W];
          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1.1, 0.6],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={`dot_${i}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: scheme === "dark" ? "#ffffff" : "#111827",
                opacity: dotOpacity,
                transform: [{ scale: dotScale }],
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

/* =================== Screen =================== */
export default function Home() {
  const { data } = useWhoAmI();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";

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
    setTimeout(() => setRefreshing(false), 1000);
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
        gradientMode="rainbow"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED + 160 * (1 - 0.5) + 16,
          paddingBottom: 80,
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
        {/* Utilities */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Tiện ích</Text>
          <View style={themedStyles.utilitiesGrid}>
            {artUtilities.map((u) => (
              <TouchableOpacity
                key={u.id}
                activeOpacity={0.9}
                onPress={() => u.onPress?.()}
                style={[themedStyles.utilTile, { width: TILE_W }]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <View style={themedStyles.utilCircleWrap}>
                  <View
                    style={[
                      themedStyles.utilCircle,
                      { backgroundColor: `${u.color}1A` },
                    ]}
                  />
                  <View
                    style={[
                      themedStyles.utilRing,
                      { borderColor: `${u.color}66` },
                    ]}
                  />
                  <Ionicons
                    name={u.icon as any}
                    size={26}
                    color={u.color}
                    style={{ position: "absolute" }}
                  />
                  {!!u.badge && (
                    <View
                      style={[
                        themedStyles.utilBadge,
                        { backgroundColor: u.color },
                      ]}
                    >
                      <Text style={themedStyles.utilBadgeTxt}>{u.badge}</Text>
                    </View>
                  )}
                </View>
                <Text numberOfLines={2} style={themedStyles.utilLabel}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
              <LinearGradient
                colors={["#60A5FA", "#A78BFA", "#22D3EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 3,
                  borderRadius: 999,
                  marginTop: 6,
                  width: 140,
                  opacity: 0.9,
                }}
              />
            </View>
            <TouchableOpacity
              style={themedStyles.seeAllBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/contests")}
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

          <AnnouncementCarousel
            data={announcements}
            scheme={colorScheme}
            onPressItem={() => router.push("/contests")}
          />

          <View style={{ marginTop: 8 }}>
            {announcements.slice(0, 4).map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                thumbSize={88}
                radius={3}
                showDivider
              />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
