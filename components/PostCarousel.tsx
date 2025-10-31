import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Post } from "../types/post";

/* =================== Post Carousel (thẳng hàng) =================== */
const { width: W } = Dimensions.get("window");
const CARD_W = Math.round(W * 0.78);
const CARD_H = 210; // CHIỀU CAO CỐ ĐỊNH -> thẳng hàng
const SPACING = 14;
const SNAP_W = CARD_W + SPACING;
const SPACER = Math.max(0, Math.round((W - CARD_W) / 2));

export default function PostCarousel({
  data,
  onPressItem,
  scheme,
}: {
  data: Post[];
  onPressItem?: (post: Post) => void;
  scheme: "light" | "dark";
}) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    const inputRange = [
      (index - 1) * SNAP_W,
      index * SNAP_W,
      (index + 1) * SNAP_W,
    ];
    // chỉ scale nhẹ – KHÔNG translate/rotate để giữ hàng
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.96, 1, 0.96],
      extrapolate: "clamp",
    });

    const isResult =
      /kết quả|result|winner|champion/i.test(item.title) ||
      /kết quả|result|winner|champion/i.test(item.content);
    const typeChip = isResult
      ? { label: "Kết quả", color: "#F59E0B" }
      : { label: "Cuộc thi", color: "#22C55E" };

    return (
      <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
        {/* viền gradient mờ */}
        <LinearGradient
          colors={["#ffffff55", "#ffffff10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        />

        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            onPressItem?.(item);
            router.push({
              pathname: "/post-detail",
              params: { post: JSON.stringify(item) },
            });
          }}
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
              <View
                style={[
                  styles.chip,
                  { backgroundColor: `${typeChip.color}E6` },
                ]}
              >
                <Ionicons
                  name={isResult ? "checkmark-done" : "trophy"}
                  size={12}
                  color="#fff"
                />
                <Text style={styles.chipText}>{typeChip.label}</Text>
              </View>
              <View style={styles.dateChip}>
                <Ionicons name="calendar-outline" size={12} color="#fff" />
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
                <View style={styles.detailBtn}>
                  <Ionicons name="eye-outline" size={14} color="#fff" />
                  <Text style={styles.detailTxt}>Chi tiết</Text>
                </View>
                <LinearGradient
                  colors={["#FDE68A", "#F59E0B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextBtn}
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
      {data.length > 0 ? (
        <>
          <Animated.FlatList
            horizontal
            data={data}
            keyExtractor={(it) => it.post_id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: SPACER }, // canh giữa card đầu/cuối
            ]}
            renderItem={renderItem}
            snapToInterval={SNAP_W}
            decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
            snapToAlignment="start"
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          />

          {/* dots */}
          <View style={styles.dotsRow}>
            {data.map((_, i) => {
              // vị trí tâm i: SPACER + i*SNAP_W
              const inputRange = [
                SPACER + (i - 1) * SNAP_W,
                SPACER + i * SNAP_W,
                SPACER + (i + 1) * SNAP_W,
              ];
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
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        scheme === "dark" ? "#ffffff" : "#111827",
                      opacity: dotOpacity,
                      transform: [{ scale: dotScale }],
                    },
                  ]}
                />
              );
            })}
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
  listContent: {
    alignItems: "center", // thẳng hàng theo trục dọc
    paddingVertical: 6,
  },
  cardWrap: {
    width: CARD_W,
    height: CARD_H, // cố định -> các card đều nhau
    marginRight: SPACING,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  touch: { flex: 1, borderRadius: 20, overflow: "hidden" },
  cover: { flex: 1 },
  coverImg: { borderRadius: 20 },
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
  chipText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  content: { position: "absolute", left: 12, right: 12, bottom: 12 },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  desc: { color: "rgba(255,255,255,0.92)", fontSize: 13, marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailBtn: {
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
