import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { usePagerView } from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Contest {
  id: string;
  title: string;
  description: string;
  category: string;
  prize: string;
  participants: number;
  deadline: string;
  status: "active" | "upcoming" | "ended";
  image: string;
  location: string;
  rating: number;
}

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
];

const categories = [
  { id: "1", name: "Môi trường", icon: "🌱", color: "#10B981" },
  { id: "2", name: "Đương đại", icon: "🎨", color: "#F97316" },
  { id: "3", name: "Truyền thống", icon: "🏛️", color: "#1E40AF" },
  { id: "4", name: "Thiếu nhi", icon: "👶", color: "#EC4899" },
];
export default function Home() {
  const colorScheme = useColorScheme() ?? "light";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const heroSlides: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
  }[] = [
    {
      id: "h1",
      image:
        "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
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
      backgroundColor: Colors[colorScheme].background, // softer, neutral background
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 20,
      backgroundColor: Colors[colorScheme].cardAlt, // lighter card background
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    greeting: {
      fontSize: 14,
      color: Colors[colorScheme].mutedForeground,
      fontWeight: "400",
    },
    appName: {
      fontSize: 32,
      fontWeight: "bold",
      color: Colors[colorScheme].primary,
      marginTop: 2,
      letterSpacing: 1,
    },
    scrollView: {
      flex: 1,
    },
    heroSlider: {
      width: "100%",
      height: 300,
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
      justifyContent: "flex-end",
      padding: 18,
      backgroundColor: Colors[colorScheme].muted, // more subtle overlay
      opacity: 0.85,
      zIndex: 2,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginBottom: 2,
      textShadowColor: Colors[colorScheme].shadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
      zIndex: 1,
    },
    heroSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].mutedForeground,
      lineHeight: 20,
      textShadowColor: Colors[colorScheme].shadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
      zIndex: 1,
    },
    section: {
      backgroundColor: Colors[colorScheme].card,
      marginBottom: 12,
      paddingVertical: 18,
      borderWidth: 1,
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
      paddingHorizontal: 24,
      letterSpacing: 0.5,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
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
      borderRadius: 16,
      borderWidth: 2,
      backgroundColor: Colors[colorScheme].cardAlt,
      borderColor: Colors[colorScheme].cardBorder,
    },
    categoryIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
    announcementCard: {
      backgroundColor: Colors[colorScheme].cardAlt,
      borderWidth: 1,
      borderColor: Colors[colorScheme].cardBorder,
      marginHorizontal: 24,
      marginBottom: 12,
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: Colors[colorScheme].border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
      flexDirection: "row",
    },
    announcementImage: {
      width: 90,
      height: "100%",
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
    },
    announcementContent: {
      flex: 1,
      padding: 16,
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
      color: Colors[colorScheme].accent,
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
      backgroundColor: Colors[colorScheme].cardAlt,
      borderWidth: 2,
      borderColor: Colors[colorScheme].cardBorder,
      borderRadius: 16,
      minWidth: 100,
    },
    quickActionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].background}
      />
      <View style={themedStyles.header}>
        <View>
          <Text style={themedStyles.greeting}>Chào mừng đến với</Text>
          <Text style={themedStyles.appName}>Artchain</Text>
        </View>
      </View>
      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedPagerView
          style={themedStyles.heroSlider}
          initialPage={0}
          ref={ref}
        >
          {heroSlides.map((slide, idx) => (
            <Pressable
              onPress={() => router.push("/announcement-detail")}
              key={slide.id}
            >
              <View style={themedStyles.heroSlide}>
                <Image
                  source={{ uri: slide.image }}
                  style={themedStyles.heroImage}
                />
                <View style={themedStyles.heroOverlay}>
                  <Text style={themedStyles.heroTitle}>{slide.title}</Text>
                  <Text style={themedStyles.heroSubtitle}>
                    {slide.subtitle}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </AnimatedPagerView>
        <View style={themedStyles.section}>
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
        </View>
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
        </View>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Hành động nhanh</Text>
          <View style={themedStyles.quickActions}>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Text style={themedStyles.quickActionIcon}>📝</Text>
              <Text style={themedStyles.quickActionText}>Tạo cuộc thi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Text style={themedStyles.quickActionIcon}>🎯</Text>
              <Text style={themedStyles.quickActionText}>Tham gia ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themedStyles.quickActionButton}>
              <Text style={themedStyles.quickActionIcon}>🏆</Text>
              <Text style={themedStyles.quickActionText}>Xem kết quả</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
