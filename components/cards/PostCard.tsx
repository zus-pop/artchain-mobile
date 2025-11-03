import { gradients, palette, radius } from "@/components/ui/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Post;
  onPress?: (item: Post) => void;
  showDivider?: boolean;
  thumbSize?: number; // ↔️ bề ngang ảnh (cũng là bề cao vì ảnh vuông)
  radiusOverride?: number;
};

const fmtVNDate = (d?: string | Date | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function PostCard({
  item,
  onPress,
  showDivider = true,
  radiusOverride,
}: Props) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = palette[scheme];
  const R = radiusOverride ?? radius.lg;
  const dateStr = useMemo(
    () => fmtVNDate(item.published_at),
    [item.published_at]
  );
  const firstTag = item.postTags?.[0]?.tag?.tag_name;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onPress?.(item)}
        android_ripple={{
          color:
            scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
        style={styles.touch}
      >
        {/* Thumbnail (TOP) */}
        <View style={styles.thumbWrap}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={[styles.thumbnail, { borderRadius: 8 }]}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={gradients.softIndigo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.thumbnail,
                {
                  borderRadius: R,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Ionicons name="image-outline" size={24} color="#fff" />
            </LinearGradient>
          )}

          {firstTag ? (
            <View
              style={[
                styles.tagChip,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(255,255,255,0.78)",
                },
              ]}
            >
              <Ionicons
                name="pricetag-outline"
                size={10}
                color={scheme === "dark" ? "#fff" : C.text}
                style={{ marginRight: 3 }}
              />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 9,
                  fontWeight: "800",
                  color: scheme === "dark" ? "#fff" : C.text,
                }}
              >
                {firstTag}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Content (BOTTOM) */}
        <View style={styles.content}>
          <Text numberOfLines={2} style={[styles.title, { color: C.text }]}>
            {item.title}
          </Text>

          {dateStr && (
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={10} color={C.textMuted} />
              <Text style={[styles.dateText, { color: C.textMuted }]}>
                {dateStr}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {showDivider && (
        <View style={[styles.divider, { backgroundColor: C.border }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // ⬅️ FILL column width
  touch: { padding: 4 }, // ⬅️ REDUCED for tighter grid
  thumbWrap: {
    width: "100%", // ⬅️ CONSTRAIN width for grid
    alignItems: "center",
    marginBottom: 8,
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 1,
  },
  tagChip: {
    position: "absolute",
    left: 6,
    top: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginTop: 8,
  },
});
