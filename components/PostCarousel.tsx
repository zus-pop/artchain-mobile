import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Post } from "../types/post";

/* =================== Announcement Carousel (đẹp & mượt) =================== */
const { width: W } = Dimensions.get("window");
const CARD_W = W * 0.78;
const SPACING = 14;
const SNAP_W = CARD_W + SPACING;

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

    // Determine type based on title/content keywords
    const isResult =
      /kết quả|result|winner|champion/i.test(item.title) ||
      /kết quả|result|winner|champion/i.test(item.content);
    const typeChip = isResult
      ? { label: "Kết quả", color: "#F59E0B" }
      : { label: "Cuộc thi", color: "#22C55E" };

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
          onPress={() => {
            router.push({
              pathname: "/post-detail",
              params: {
                post: JSON.stringify(item),
              },
            });
          }}
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <ImageBackground
            source={{ uri: item.image_url }}
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
                  name={isResult ? "checkmark-done" : "trophy"}
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
                  {new Date(item.published_at).toLocaleDateString()}
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
                  marginBottom: 8,
                }}
              >
                {item.content.length > 150
                  ? item.content.substring(0, 150) + "..."
                  : item.content}
              </Text>
              {/* Tags */}
              {item.postTags && item.postTags.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  {item.postTags.slice(0, 3).map((postTag, tagIndex) => (
                    <View
                      key={tagIndex}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.3)",
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {postTag.tag.tag_name}
                      </Text>
                    </View>
                  ))}
                  {item.postTags.length > 3 && (
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.3)",
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        +{item.postTags.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
      {data.length > 0 ? (
        <>
          <Animated.FlatList
            data={data}
            keyExtractor={(it) => it.post_id.toString()}
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
              const inputRange = [
                (i - 1) * SNAP_W,
                i * SNAP_W,
                (i + 1) * SNAP_W,
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
        </>
      ) : (
        <View
          style={{
            height: 210,
            borderRadius: 20,
            backgroundColor:
              scheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            borderWidth: 1,
            borderColor:
              scheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Ionicons
            name="images-outline"
            size={48}
            color={
              scheme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
            }
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              color:
                scheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Chưa có thông báo nào
          </Text>
          <Text
            style={{
              color:
                scheme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Thông báo mới sẽ xuất hiện ở đây
          </Text>
        </View>
      )}
    </View>
  );
}
