import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width: W } = Dimensions.get("window");
const CARD_W = W - 35; // Add horizontal padding
const CARD_H = 220; // Optimized height for balanced ratio and better content fit

export default function PostCarousel({
  data,
  onPressItem,
  scheme,
}: {
  data: Post[];
  onPressItem?: (post: Post) => void;
  scheme: "light" | "dark";
}) {
  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPressItem?.(item)}
      style={styles.touch}
    >
      <ImageBackground
        source={{ uri: item.image_url }}
        style={styles.cover}
        imageStyle={styles.coverImg}
      >
        {/* Enhanced gradient for better text contrast */}
        <LinearGradient
          colors={
            scheme === "dark"
              ? ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.75)"]
              : ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]
          }
          start={{ x: 0, y: 0.15 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Metadata Row: Date + Tags */}
        <View style={styles.chipsRow}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
            <Text style={styles.chipText}>
              {new Date(item.published_at).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          {/* Tags in metadata row */}
          {item.postTags?.length > 0 && (
            <View style={styles.tagsRowInChip}>
              {item.postTags.slice(0, 1).map((postTag, i) => (
                <View key={i} style={styles.tagInChip}>
                  <Ionicons
                    name="pricetag"
                    size={9}
                    color="rgba(255,255,255,0.8)"
                    style={{ marginRight: 2 }}
                  />
                  <Text numberOfLines={1} style={styles.tagTextInChip}>
                    {postTag.tag.tag_name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
            {item.title}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.desc}>
            {item.content.length > 100
              ? item.content.substring(0, 100) + "..."
              : item.content}
          </Text>

          {/* CTA Button */}
          <View style={styles.ctaRow}>
            <Pressable style={styles.detailBtn}>
              <Text style={styles.detailTxt}>Xem chi tiết</Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color="#FFFFFF"
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <>
          <Carousel
            loop
            width={CARD_W}
            height={CARD_H}
            autoPlay={true}
            autoPlayInterval={4000}
            data={data}
            scrollAnimationDuration={1000}
            renderItem={renderItem}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.92,
              parallaxScrollingOffset: 40,
              parallaxAdjacentItemScale: 0.85,
            }}
            style={styles.carousel}
          />

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {data.map((_, i) => (
              <View
                key={`dot_${i}`}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      scheme === "dark"
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.4)",
                  },
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="images-outline"
            size={56}
            color={
              scheme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"
            }
            style={{ marginBottom: 16 }}
          />
          <Text
            style={[
              styles.emptyTitle,
              {
                color:
                  scheme === "dark"
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.7)",
              },
            ]}
          >
            Chưa có thông báo nào
          </Text>
          <Text
            style={[
              styles.emptyDesc,
              {
                color:
                  scheme === "dark"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(0,0,0,0.5)",
              },
            ]}
          >
            Thông báo mới sẽ xuất hiện tại đây
          </Text>
        </View>
      )}
    </View>
  );
}

/* =================== Styles =================== */
const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  carousel: {
    alignItems: "center",
    justifyContent: "center",
  },
  touch: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cover: { flex: 1, borderRadius: 12 },
  coverImg: { borderRadius: 12 },
  chipsRow: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: "#FFFFFF", fontWeight: "600", fontSize: 12 },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tagsRowInChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  tagInChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    fontFamily: "Be Vietnam Pro",
  },
  tagTextInChip: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  content: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    gap: 6,
    maxHeight: 130,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 0,
    letterSpacing: 0.3,
    fontFamily: "Be Vietnam Pro",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  desc: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 0,
    fontFamily: "Be Vietnam Pro",
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 0 },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(226, 87, 82, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "rgba(226, 87, 82, 0.5)",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  detailTxt: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  nextBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FDE68A",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, opacity: 0.6 },
  empty: {
    height: CARD_H,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptyDesc: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 20,
  },
});
