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
const CARD_W = W;
const CARD_H = 210;

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
      activeOpacity={0.95}
      onPress={() => onPressItem?.(item)}
      style={styles.touch}
    >
      <ImageBackground
        source={{ uri: item.image_url }}
        style={styles.cover}
        imageStyle={styles.coverImg}
      >
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
        <View style={styles.chipsRow}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={12} color="#423137" />
            <Text style={styles.chipText}>
              {new Date(item.published_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* nội dung */}
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={styles.desc}>
            {item.content.length > 150
              ? item.content.substring(0, 150) + "..."
              : item.content}
          </Text>

          {item.postTags?.length > 0 && (
            <View style={styles.tagsRow}>
              {item.postTags.slice(0, 3).map((postTag, i) => (
                <View key={i} style={styles.tag}>
                  <Ionicons
                    name="pricetag-outline"
                    size={10}
                    color="#fff"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.tagText}>{postTag.tag.tag_name}</Text>
                </View>
              ))}
              {item.postTags.length > 3 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    +{item.postTags.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.ctaRow}>
            <Pressable style={styles.detailBtn}>
              <Text style={styles.detailTxt}>Chi tiết</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View>
      {data.length > 0 ? (
        <>
          <Carousel
            loop
            width={CARD_W}
            height={CARD_H}
            autoPlay={true}
            autoPlayInterval={3500}
            data={data}
            scrollAnimationDuration={1000}
            renderItem={renderItem}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
              parallaxAdjacentItemScale: 0.8,
            }}
            style={styles.carousel}
          />

          {/* dots */}
          <View style={styles.dotsRow}>
            {data.map((_, i) => (
              <View
                key={`dot_${i}`}
                style={[
                  styles.dot,
                  {
                    backgroundColor: scheme === "dark" ? "#ffffff" : "#111827",
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
            size={48}
            color={
              scheme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
            }
            style={{ marginBottom: 16 }}
          />
          <Text
            style={[
              styles.emptyTitle,
              {
                color:
                  scheme === "dark"
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)",
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
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(0,0,0,0.4)",
              },
            ]}
          >
            Thông báo mới sẽ xuất hiện ở đây
          </Text>
        </View>
      )}
    </View>
  );
}

/* =================== Styles =================== */
const styles = StyleSheet.create({
  carousel: {
    alignItems: "center",
  },
  touch: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cover: { flex: 1 },
  coverImg: { borderRadius: 12 },
  chipsRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: "#423137", fontWeight: "800", fontSize: 12 },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  content: { position: "absolute", left: 12, right: 12, bottom: 12 },
  title: {
    color: "#423137",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 0.2,
    fontFamily: "Be Vietnam Pro",
  },
  desc: {
    color: "#423137",
    fontSize: 13,
    marginBottom: 8,
    fontFamily: "Be Vietnam Pro",
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "Be Vietnam Pro",
  },
  tagText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "hsl(15 85% 55%)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  detailTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
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
    gap: 6,
    marginTop: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  empty: {
    height: CARD_H,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDesc: { fontSize: 14, textAlign: "center" },
});
