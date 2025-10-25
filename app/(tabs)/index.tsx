import AnnouncementCard from "@/components/cards/AnnouncementCard";

import PodiumTop123, { Winner } from "@/assets/PodiumTop123";
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
  ScrollView,
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

function makeBalloons(n = 14): BalloonSpec[] {
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
      {/* mảng gradient đậm nhẹ để tạo chiều sâu */}
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
      {/* film overlay giúp nội dung nổi bật */}
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

/* =================== Fancy Announcement Card =================== */
const FancyAnnouncement: React.FC<{
  a: Announcement;
  onPress?: () => void;
}> = ({ a, onPress }) => {
  const typeChip =
    a.type === "contest"
      ? { label: "Cuộc thi", color: "#22C55E" }
      : { label: "Kết quả", color: "#F59E0B" };
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={fancy.cardWrap}
    >
      <View style={fancy.borderGlow} />
      <ImageBackground
        source={{ uri: a.image }}
        resizeMode="cover"
        style={fancy.card}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.65)"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* header chips */}
        <View style={fancy.topRow}>
          <View
            style={[fancy.chip, { backgroundColor: `${typeChip.color}DD` }]}
          >
            <Ionicons
              name={a.type === "contest" ? "trophy" : "checkmark-done"}
              size={12}
              color="#fff"
            />
            <Text style={fancy.chipTxt}>{typeChip.label}</Text>
          </View>
          <View
            style={[
              fancy.chip,
              {
                backgroundColor: "rgba(0,0,0,0.35)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={12} color="#fff" />
            <Text style={fancy.chipTxt}>
              {new Date(a.date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* title + summary + CTA */}
        <View style={fancy.bottom}>
          <Text numberOfLines={2} style={fancy.title}>
            {a.title}
          </Text>
          <Text numberOfLines={2} style={fancy.summary}>
            {a.summary}
          </Text>

          <View style={fancy.ctaRow}>
            <View style={fancy.ctaGhost}>
              <Ionicons name="eye-outline" size={14} color="#fff" />
              <Text style={fancy.ctaGhostTxt}>Chi tiết</Text>
            </View>
            <View style={fancy.ctaPrimary}>
              <Ionicons name="chevron-forward" size={14} color="#111827" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const fancy = StyleSheet.create({
  cardWrap: { width: W * 0.82, marginRight: 14 },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: "transparent",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  card: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  bottom: { position: "absolute", left: 12, right: 12, bottom: 10 },
  title: { color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  summary: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginBottom: 10 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaGhostTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  ctaPrimary: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FDE68A",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

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
      {/* NỀN đẹp mắc: gradient + bóng bay (pointerEvents: none) */}
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

        {/* Thông báo mới — Carousel đẹp + List đơn giản */}
        <View style={themedStyles.section}>
          <View style={themedStyles.sectionHeader}>
            <Text style={themedStyles.sectionTitle}>Thông báo mới</Text>
            <TouchableOpacity
              style={themedStyles.seeAllBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/contests")}
            >
              <Text style={themedStyles.seeAllText}>Xem tất cả</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors[colorScheme].accentForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Carousel ngang */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
            snapToInterval={W * 0.82 + 14}
            decelerationRate="fast"
            snapToAlignment="start"
            style={{ marginBottom: 14 }}
          >
            <View style={{ flexDirection: "row", paddingLeft: 4 }}>
              {announcements.slice(0, 5).map((a) => (
                <FancyAnnouncement
                  key={a.id}
                  a={a}
                  onPress={() => router.push("/contests")}
                />
              ))}
            </View>
          </ScrollView>

          {/* Danh sách dọc gọn (tận dụng AnnouncementCard sẵn có) */}
          {announcements.slice(0, 4).map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              thumbSize={88}
              radius={3}
              showDivider={true}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
