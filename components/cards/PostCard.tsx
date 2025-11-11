// ✅ PostCard — phiên bản card ngang
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
    <View style={[styles.container]}>
      <Pressable
        onPress={() => onPress?.(item)}
        android_ripple={{
          color:
            scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
        style={[styles.cardRow, {}]}
      >
        {/* Ảnh bên trái */}
        <View style={[styles.thumbBox, { borderRadius: R }]}>
          <View style={[styles.thumbClip, { borderRadius: R }]}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={[styles.thumbnail, { borderRadius: R }]}
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
                      scheme === "dark" ? "hsl(15 85% 50%)" : "hsl(15 85% 50%)",
                  },
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={10}
                  color="#fff"
                  style={{ marginRight: 3 }}
                />
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}
                >
                  {firstTag}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.contentBox}>
          <Text numberOfLines={2} style={[styles.title, { color: C.text }]}>
            {item.title}
          </Text>

          <Text numberOfLines={1} style={[{ color: C.text }]}>
            {item.content}
          </Text>

          <View style={styles.footerRow}>
            <View>
              {!!dateStr && (
                <View style={styles.dateRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={scheme === "dark" ? "#bbb" : "#666"}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: scheme === "dark" ? "#bbb" : "#666" },
                    ]}
                  >
                    {dateStr}
                  </Text>
                </View>
              )}
            </View>
            <Pressable style={styles.ctaBtn}>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 10 }}>
                Chi tiết
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </Pressable>
          </View>

          {showDivider && (
            <View style={[styles.divider, { backgroundColor: "#9CA3AF" }]} />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const THUMB_W = 97;
const THUMB_H = 97;

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 16 },

  cardRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,

    borderRadius: 12,

    shadowOpacity: 0.12,
  },

  thumbBox: {
    width: THUMB_W,
    height: THUMB_H,
    overflow: "hidden",
  },
  thumbClip: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
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

  contentBox: { flex: 1, justifyContent: "space-between" },
  title: { fontSize: 14, fontWeight: "800", lineHeight: 18 },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 11, fontWeight: "600" },
  spacer: { flex: 1, justifyContent: "space-between" },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "hsl(15 85% 55%)",
    borderRadius: 8,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
    marginTop: 10,
  },
});
