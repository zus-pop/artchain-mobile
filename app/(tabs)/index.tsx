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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingBottom: 8,
      backgroundColor: Colors[colorScheme].background,
      marginTop: 12,
    },
    greeting: {
      fontSize: 20,
      color: Colors[colorScheme].primary,
      fontWeight: "800",
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    appName: {
      fontSize: 30,
      fontWeight: "bold",
      color: Colors[colorScheme].primary,
      marginTop: 2,
      letterSpacing: 1,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primary,
    },
    scrollView: {
      flex: 1,
      paddingBottom: 80, // Account for bottom tab bar
    },
    heroSlider: {
      width: "100%",
      height: Dimensions.get("window").height - headerHeight, // Full screen minus safe area and tabs
    },
    heroContainer: {
      position: "relative",
      width: "100%",
      height: Dimensions.get("window").height - headerHeight,
    },
    heroHeaderOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingTop: 25,
      borderBottomStartRadius: 12,
      borderBottomEndRadius: 12,
    },
    heroContentOverlay: {
      position: "absolute",
      bottom: 60,
      left: 0,
      right: 0,
      padding: 20,
    },
    heroGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroSlide: {
      width: "100%",
      height: "100%",
      overflow: "hidden",
      position: "relative",
      backgroundColor: Colors[colorScheme].muted,
    },
    heroImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroOverlay: {
      flex: 1,
      justifyContent: "space-between",
      padding: 20,
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: Colors[colorScheme].primaryForeground,
      marginBottom: 4,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 1,
    },
    heroSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].primaryForeground,
      lineHeight: 20,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 1,
    },
    indicatorsContainer: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: "rgba(255,255,255,0.5)",
    },
    activeIndicator: {
      backgroundColor: Colors[colorScheme].primaryForeground,
    },
    section: {
      backgroundColor: Colors[colorScheme].card,
      marginVertical: 8,
      marginHorizontal: 4,
      borderRadius: 6,
      paddingVertical: 18,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[colorScheme].primary,
      marginBottom: 12,
      paddingHorizontal: 20,
      letterSpacing: 0.5,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    categoriesContainer: {
      paddingLeft: 20,
    },
    categoryCard: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 80,
      marginRight: 12,
      borderWidth: 2,
      backgroundColor: Colors[colorScheme].card,
      borderColor: Colors[colorScheme].border,
    },
    categoryIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      color: Colors[colorScheme].foreground,
    },
    announcementCard: {
      backgroundColor: Colors[colorScheme].card,
      marginHorizontal: 8,
      marginBottom: 8,
      overflow: "hidden",
      shadowColor: Colors[colorScheme].border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
      flexDirection: "row",
      borderColor: Colors[colorScheme].border,
      borderWidth: 0.5,
    },
    announcementImage: {
      width: 90,
      height: "100%",
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
    },
    announcementContent: {
      flex: 1,
      padding: 8,
      justifyContent: "center",
    },
    announcementTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: Colors[colorScheme].primary,
      marginBottom: 4,
    },
    announcementSummary: {
      fontSize: 13,
      color: Colors[colorScheme].mutedForeground,
      marginBottom: 6,
    },
    announcementMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
    },
    announcementDate: {
      fontSize: 12,
      color: Colors[colorScheme].mutedForeground,
      fontStyle: "italic",
    },
    announcementType: {
      fontSize: 12,
      color: Colors[colorScheme].accentForeground,
      fontWeight: "600",
    },
    showAllButton: {
      alignSelf: "center",
      padding: 12,
      marginTop: 8,
    },
    showAllText: {
      color: Colors[colorScheme].primaryForeground,
      fontWeight: "600",
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 20,
    },
    quickActionButton: {
      alignItems: "center",
      padding: 16,
      backgroundColor: Colors[colorScheme].card,
      borderWidth: 2,
      borderColor: Colors[colorScheme].border,
      borderRadius: 16,
      minWidth: 100,
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors[colorScheme].foreground,
      textAlign: "center",
    },
    seeAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].muted,
    },
    seeAllText: {
      marginRight: 4,
      fontSize: 13,
      fontWeight: "700",
      color: Colors[colorScheme].accentForeground,
    },
    utilitiesGrid: {
      paddingHorizontal: GRID_PAD_H,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between", // <- chia đều khoảng trống trong từng hàng
      rowGap: 10, // RN >= 0.71 sẽ hỗ trợ; nếu chưa có, xem fallback ở dưới
    },

    utilTile: {
      alignItems: "center",
      marginBottom: 18,
    },

    // khối chứa icon – bo tròn + đổ bóng rất nhẹ
    utilCircleWrap: {
      width: 72,
      height: 72,
      marginBottom: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    // nền tròn
    utilCircle: {
      position: "absolute",
      width: 64,
      height: 64,
      borderRadius: 32,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    // viền nét đứt tạo cảm giác “cọ vẽ”
    utilRing: {
      position: "absolute",
      width: 68,
      height: 68,
      borderRadius: 34,
      borderWidth: 2,
      borderStyle: "dashed",
    },

    utilLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: Colors[colorScheme].foreground,
      textAlign: "center",
      lineHeight: 16,
    },

    // badge “Mới”
    utilBadge: {
      position: "absolute",
      top: -6,
      right: -6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#fff",
    },
    utilBadgeTxt: {
      fontSize: 10,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: 0.2,
    },
  });

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

  return (
    <View style={themedStyles.container}>
      <CollapsibleHeader
        progress={headerProgress}
        username="Hoàng Trí"
        gradientMode="rainbow" // hoặc "rainbow" | "neon"
      />

      <Animated.ScrollView
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
