import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Post } from "@/types/post";
import * as React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Post;
  onPress?: (item: Post) => void;
  showDivider?: boolean;
  thumbSize?: number; // <-- new
  radius?: number; // <-- new
};

export default function PostCard({
  item,
  onPress,
  showDivider = true,
  thumbSize = 84, // mặc định lớn hơn 64
  radius = 12,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const s = React.useMemo(
    () => styles(scheme, thumbSize, radius),
    [scheme, thumbSize, radius]
  );

  return (
    <View style={s.wrap}>
      <Pressable
        onPress={() => onPress?.(item)}
        android_ripple={{ color: Colors[scheme].muted }}
        style={s.row}
      >
        <View style={s.thumbWrap}>
          <Image
            source={{ uri: item.image_url }}
            style={s.thumb}
            resizeMode="cover"
          />
        </View>

        <View style={s.content}>
          <Text numberOfLines={1} style={s.title}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={s.summary}>
            {item.content}
          </Text>
          {/* Tags */}
          {item.postTags && item.postTags.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 6,
                marginBottom: 6,
              }}
            >
              {item.postTags.slice(0, 3).map((postTag, tagIndex) => (
                <View
                  key={tagIndex}
                  style={{
                    backgroundColor:
                      scheme === "dark"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(59, 130, 246, 0.1)",
                    borderWidth: 1,
                    borderColor:
                      scheme === "dark"
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(59, 130, 246, 0.2)",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      color: scheme === "dark" ? "#60A5FA" : "#2563EB",
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
                    backgroundColor:
                      scheme === "dark"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(59, 130, 246, 0.1)",
                    borderWidth: 1,
                    borderColor:
                      scheme === "dark"
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(59, 130, 246, 0.2)",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      color: scheme === "dark" ? "#60A5FA" : "#2563EB",
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
          <View style={s.meta}>
            <Text style={s.date}>
              {new Date(item.published_at).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={s.divider} />
    </View>
  );
}

// styles: dùng thumbSize & radius
const styles = (scheme: "light" | "dark", THUMB = 64, R = 10) =>
  StyleSheet.create({
    wrap: { backgroundColor: Colors[scheme].card },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 15,
    },
    thumbWrap: {
      width: THUMB,
      height: THUMB + 20,
      overflow: "hidden",
      marginRight: 12,
      borderRadius: R,
      backgroundColor: Colors[scheme].muted,
    },
    thumb: { width: "100%", height: "100%" }, // KHÔNG cần 120%
    content: { flex: 1 },
    title: {
      fontSize: 16,
      fontWeight: "800",
      color: Colors[scheme].foreground,
      marginBottom: 4,
    },
    summary: {
      fontSize: 13,
      color: Colors[scheme].mutedForeground,
      marginBottom: 6,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    date: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      fontStyle: "italic",
    },
    badge: {
      fontSize: 12,
      fontWeight: "700",
      color: Colors[scheme].accentForeground,
    },
    divider: {
      height: 1,
      width: "100%",
      backgroundColor: Colors[scheme].muted, // dùng màu nhạt từ theme
      //   marginLeft: 14 + THUMB + 12,
      marginHorizontal: 20,
    },
  });
