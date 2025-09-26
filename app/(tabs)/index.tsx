import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";

interface Announcement {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  type: "contest" | "result";
}

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
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
      borderWidth: 0.8,
      borderColor: Colors[colorScheme].border,
      shadowColor: Colors[colorScheme].border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
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
      <Animated.View style={[themedStyles.heroHeaderOverlay, headerStyle]}>
        <View>
          <Text style={themedStyles.greeting}>Chào mừng</Text>
          <Text style={themedStyles.appName}>Guest</Text>
        </View>
        <TouchableOpacity>
          <Image
            source={{ uri: "https://via.placeholder.com/40" }}
            style={themedStyles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Animated.View>
      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={themedStyles.heroContainer}>
          <AnimatedPagerView
            style={themedStyles.heroSlider}
            initialPage={0}
            ref={ref}
            onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
          >
            {heroSlides.map((slide, idx) => (
              <Pressable
                onPress={() => router.push("/announcement-detail")}
                key={slide.id}
                style={themedStyles.heroSlide}
              >
                <Image
                  source={{ uri: slide.image }}
                  style={themedStyles.heroImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </AnimatedPagerView>

          <LinearGradient
            pointerEvents="none"
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.6)"]}
            style={themedStyles.heroGradient}
          />

          {/* Fixed Content Overlay */}
          <View style={themedStyles.heroContentOverlay}>
            <Text style={themedStyles.heroTitle}>
              {heroSlides[currentPage]?.title}
            </Text>
            <Text style={themedStyles.heroSubtitle}>
              {heroSlides[currentPage]?.subtitle}
            </Text>
          </View>

          {/* Fixed Indicators Overlay */}
          <View style={themedStyles.indicatorsContainer}>
            {heroSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  themedStyles.indicator,
                  index === currentPage && themedStyles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
        {/* <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={themedStyles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={themedStyles.categoryCard}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
              >
                <Text style={themedStyles.categoryIcon}>{category.icon}</Text>
                <Text style={themedStyles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}
        <View style={themedStyles.section}>
          <View style={themedStyles.sectionHeader}>
            <Text style={themedStyles.sectionTitle}>Thông báo mới</Text>
          </View>
          {announcements.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={themedStyles.announcementCard}
            >
              <Image
                source={{ uri: post.image }}
                style={themedStyles.announcementImage}
                resizeMode="cover"
              />
              <View style={themedStyles.announcementContent}>
                <Text style={themedStyles.announcementTitle}>{post.title}</Text>
                <Text
                  style={themedStyles.announcementSummary}
                  numberOfLines={2}
                >
                  {post.summary}
                </Text>
                <View style={themedStyles.announcementMeta}>
                  <Text style={themedStyles.announcementDate}>
                    {new Date(post.date).toLocaleDateString("vi-VN")}
                  </Text>
                  <Text style={themedStyles.announcementType}>
                    {post.type === "contest" ? "Cuộc thi" : "Kết quả"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={themedStyles.showAllButton}
            onPress={() => router.push("/contests")}
          >
            <Text style={themedStyles.showAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Hành động nhanh</Text>
          <View style={themedStyles.quickActions}>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Ionicons
                name="create-outline"
                size={32}
                color={Colors[colorScheme].foreground}
                style={themedStyles.quickActionIcon}
              />
              <Text style={themedStyles.quickActionText}>Tạo cuộc thi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Ionicons
                name="play-outline"
                size={32}
                color={Colors[colorScheme].foreground}
                style={themedStyles.quickActionIcon}
              />
              <Text style={themedStyles.quickActionText}>Tham gia ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Ionicons
                name="trophy-outline"
                size={32}
                color={Colors[colorScheme].foreground}
                style={themedStyles.quickActionIcon}
              />
              <Text style={themedStyles.quickActionText}>Xem kết quả</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
