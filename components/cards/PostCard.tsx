import {
  elevation,
  gradients,
  palette,
  radius,
  spacing,
  type,
} from "@/components/ui/design";
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
  thumbSize = 132, // ⬅️ LỚN HƠN (trước là 96)
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
    <View style={{ backgroundColor: C.surfaceAlt }}>
      <Pressable
        onPress={() => onPress?.(item)}
        android_ripple={{
          color:
            scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
        style={styles.touch}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: C.surface,
              borderColor: C.border,
              borderRadius: R,
              ...elevation.card,
            },
          ]}
        >
          {/* Thumbnail (TO HƠN) + tag */}
          <View style={[styles.thumbCol, { width: thumbSize }]}>
            <View
              style={[
                styles.thumbWrap,
                {
                  height: thumbSize, // ảnh vuông: to theo thumbSize
                  borderRadius: R - 4,
                  backgroundColor: C.surfaceAlt,
                },
              ]}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: "100%", borderRadius: R - 4 }}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={gradients.softIndigo}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: R - 4,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Ionicons name="image-outline" size={28} color="#fff" />
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
                    size={12}
                    color={scheme === "dark" ? "#fff" : C.text}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: scheme === "dark" ? "#fff" : C.text,
                    }}
                  >
                    {firstTag}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentCol}>
            <Text numberOfLines={2} style={[type.title, { color: C.text }]}>
              {item.title}
            </Text>

            {!!item.content && (
              <Text
                numberOfLines={2}
                style={[
                  type.body,
                  { color: C.textMuted, marginTop: spacing.xs },
                ]}
              >
                {String(item.content).replace(/\s+/g, " ").trim()}
              </Text>
            )}

            {/* Chips (≤3 + “+n”) */}
            {!!item.postTags?.length && (
              <View style={styles.chipsRow}>
                {item.postTags.slice(0, 3).map((pt, i) => (
                  <View
                    key={`${pt.tag?.tag_id ?? i}`}
                    style={[
                      styles.smallChip,
                      {
                        borderColor: C.border,
                        backgroundColor:
                          scheme === "dark" ? "#0F172A" : "#F9FAFB",
                      },
                    ]}
                  >
                    <Text
                      style={{ fontSize: 11, fontWeight: "700", color: C.text }}
                    >
                      {pt.tag?.tag_name}
                    </Text>
                  </View>
                ))}
                {item.postTags.length > 3 && (
                  <View
                    style={[
                      styles.smallChip,
                      { borderColor: C.border, backgroundColor: C.surfaceAlt },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: C.textMuted,
                      }}
                    >
                      +{item.postTags.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Meta */}
            <View style={styles.metaRow}>
              {dateStr ? (
                <View
                  style={[
                    styles.metaPill,
                    { borderColor: C.border, backgroundColor: C.surfaceAlt },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={C.textMuted}
                  />
                  <Text style={[type.meta, { color: C.textMuted }]}>
                    {dateStr}
                  </Text>
                </View>
              ) : (
                <View />
              )}

              <LinearGradient
                colors={gradients.softBlue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </LinearGradient>
            </View>
          </View>
        </View>
      </Pressable>

      {showDivider && (
        <View style={[styles.divider, { backgroundColor: C.border }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  touch: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  card: {
    flexDirection: "row",
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumbCol: { marginRight: spacing.md },
  thumbWrap: { overflow: "hidden", width: "100%" },
  tagChip: {
    position: "absolute",
    left: 8,
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  contentCol: { flex: 1 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cta: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});
