import AnnouncementCard from "@/components/cards/AnnouncementCard";
import HeroCarousel from "@/components/carousels/HeroCarousel";

import CollapsibleHeader, {
  HEADER_COLLAPSED,
  HEADER_EXPANDED,
} from "@/components/header/CollapsibleHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import themedStyles from "../../components/styleSheet/themeSheet";

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
  icon: any; // hoặc keyof typeof Ionicons.glyphMap nếu muốn chặt hơn
  label: string;
  color: string;
  badge?: string;
  onPress?: () => void; // <- thêm optional
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

// const categories = [
//   { id: "1", name: "Môi trường", icon: "🌱", color: "#10B981" },
//   { id: "2", name: "Đương đại", icon: "🎨", color: "#F97316" },
//   { id: "3", name: "Truyền thống", icon: "🏛️", color: "#1E40AF" },
//   { id: "4", name: "Thiếu nhi", icon: "👶", color: "#EC4899" },
// ];
export default function Home() {
  const colorScheme = useColorScheme() ?? "light";

  const W = Dimensions.get("window").width;

  const UTIL_COLS = 3;
  const GRID_GAP = 22;
  const GRID_PAD_H = 20;
  // giữ nguyên các const: W, GRID_PAD_H, GRID_GAP, UTIL_COLS
  const TILE_W = (W - GRID_PAD_H * 2 - GRID_GAP * (UTIL_COLS - 1)) / UTIL_COLS;

  const artUtilities: UtilityItem[] = [
    {
      id: "u1",
      icon: "color-palette-outline",
      label: "Chủ đề",
      color: "#a855f7",
      // onPress: () => router.push("/topics"),
    },
    {
      id: "u2",
      icon: "brush-outline",
      label: "Tạo\ncuộc thi",
      color: "#f97316",
      // onPress: () => router.push("/contest-create"),
    },
    {
      id: "u3",
      icon: "images-outline",
      label: "Tác phẩm",
      color: "#06b6d4",
      // onPress: () => router.push("/my-artworks"),
    },
    {
      id: "u4",
      icon: "play-outline",
      label: "Tham gia",
      color: "#22c55e",
      badge: "Mới",
      // onPress: () => router.push("/join"),
    },
    {
      id: "u5",
      icon: "trophy-outline",
      label: "Bảng xếp hạng",
      color: "#eab308",
      // onPress: () => router.push("/leaderboard"),
    },
    {
      id: "u6",
      icon: "book-outline",
      label: "Thể lệ",
      color: "#f43f5e",
      // onPress: () => router.push("/rules"),
    },
  ];

  // giữ lại scrollY nếu bạn còn dùng cho thứ khác
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1 = thu gọn, 0 = bung ra
  const headerProgress = useRef(new Animated.Value(1)).current;
  const lastY = useRef(0);
  const isOpen = useRef(false);

  const THRESHOLD = 60; // gần top bao nhiêu px thì mở
  const HYST = 14; // biên chống rung

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
    // TODO: gọi API / reload dữ liệu
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const headerHeight = 60;
  const heroSlides: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
  }[] = [
    {
      id: "h1",
      image:
        "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg",
      title: "Vẽ Sài Gòn Xanh",
      subtitle: "Thành phố xanh, bền vững và thân thiện với môi trường",
    },
    {
      id: "h2",
      image:
        "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
      title: "Nghệ Thuật Đường Phố",
      subtitle: "Sáng tạo qua nghệ thuật graffiti và street art",
    },
    {
      id: "h3",
      image:
        "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
      title: "Di Sản Văn Hóa",
      subtitle: "Bảo tồn và quảng bá di sản Việt Nam qua tranh vẽ",
    },
  ];

  // Use the custom hook from react-native-pager-view
  const { AnimatedPagerView, ref } = usePagerView();
  const page = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      page.current = (page.current + 1) % heroSlides.length;
      if (ref.current) {
        ref.current.setPage(page.current);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  const slides = heroSlides.map((s) => ({ id: s.id, image: s.image }));
  // Dynamic styles using Colors

  const headerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    padding: 20,
    paddingTop: 30,
    zIndex: 10,
    backgroundColor: scrollY.interpolate({
      inputRange: [0, Dimensions.get("window").height - headerHeight],
      outputRange: ["transparent", Colors[colorScheme].background],
      extrapolate: "clamp",
    }),
  } as any;
  useEffect(() => {
    // Mở rộng header khi app load
    Animated.timing(headerProgress, {
      toValue: 0, // expanded
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={themedStyles.container}>
      <CollapsibleHeader
        progress={headerProgress}
        username="Hoàng Trí"
        gradientMode="rainbow" // hoặc "rainbow" | "neon"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED + 160 * (1 - 0.5) + 16,
          paddingBottom: 80,
        }}
        scrollEventThrottle={16}
        // (tuỳ chọn) cho phép kéo dù nội dung không đủ dài
        bounces
        alwaysBounceVertical
        onScroll={(e) => {
          if (!refreshing) {
            handleScroll(e); // chỉ chạy logic header khi không refreshing
          }
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            // iOS
            tintColor="#f97316"
            titleColor="#f97316"
            // Android
            colors={["#f97316"]}
            progressBackgroundColor="#fff"
            // đẩy spinner xuống dưới phần safe area + header collapsed
            progressViewOffset={insets.top + HEADER_COLLAPSED / 2}
          />
        }
      >
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Tiện ích</Text>

          <View style={themedStyles.utilitiesGrid}>
            {artUtilities.map((u) => (
              <TouchableOpacity
                key={u.id}
                activeOpacity={0.9}
                onPress={() => u.onPress?.()}
                style={[themedStyles.utilTile, { width: TILE_W }]} // <- chỉ set width
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

        <View>
          <HeroCarousel
            data={slides}
            height={200}
            inset={16}
            radius={16}
            autoPlayInterval={3500}
          />
        </View>

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

          {announcements.map((item, i) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              thumbSize={96} // chỉnh 80–100 tuỳ ý
              radius={12}
              showDivider={i < announcements.length - 1}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
