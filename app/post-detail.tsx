// app/post-detail.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Post } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import type { MarkdownProps } from "react-native-markdown-display";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetail() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { post: postParam } = useLocalSearchParams();
  const post: Post | null = postParam ? JSON.parse(postParam as string) : null;

  const [viewerOpen, setViewerOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Ẩn/hiện StatusBar khi bật/tắt viewer => tránh hở đỉnh
  useEffect(() => {
    StatusBar.setHidden(viewerOpen, "fade");
    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, [viewerOpen]);

  const published = useMemo(
    () =>
      post?.published_at
        ? new Date(post.published_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
    [post?.published_at]
  );

  if (!post) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text style={{ color: C.mutedForeground, fontSize: 16 }}>
          Không tìm thấy bài viết
        </Text>
      </View>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content?.slice(0, 200) ?? ""}…`,
      });
    } catch {}
  };

  const gradientFrom = scheme === "dark" ? "#0EA5E9" : "#60A5FA";
  const gradientTo = scheme === "dark" ? "#6366F1" : "#2563EB";

  const ViewerHeaderComp: React.FC<{ imageIndex: number }> = () => (
    <View style={[styles.viewerTop, { paddingTop: insets.top + 8 }]}>
      {/* Đóng viewer (quay lại bài viết) */}
      <Pressable
        onPress={() => setViewerOpen(false)}
        style={[styles.viewerBtn, { marginLeft: 10 }]}
        hitSlop={10}
      >
        <Ionicons name="close" size={22} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <>
      {/* StatusBar sẽ bị ẩn khi viewerOpen = true (ở useEffect) */}
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* ======= HERO ======= */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[gradientFrom, gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGrad}
          />

          {/* Nút Back trắng ở góc trái trên ảnh */}
          <View style={[styles.headerActions, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={() => router.back()}
              style={styles.whiteBackBtn}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
          </View>

          {post.image_url ? (
            <Pressable
              style={styles.heroImageWrap}
              onPress={() => setViewerOpen(true)}
            >
              <Image
                source={{ uri: post.image_url }}
                style={styles.heroImg}
                resizeMode="cover"
              />
              <View style={styles.heroGlass} />
            </Pressable>
          ) : (
            <View style={[styles.heroImageWrap, { overflow: "hidden" }]}>
              <View style={styles.heroGlass} />
            </View>
          )}

          {/* Floating actions */}
          <View style={styles.fabRow}>
            <Pressable
              onPress={onShare}
              style={[styles.fab, { backgroundColor: "#00000055" }]}
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => setBookmarked((b) => !b)}
              style={[styles.fab, { backgroundColor: "#00000055" }]}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>

        {/* ======= TITLE + META ======= */}
        <View style={styles.outerPad}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: C.card,
                shadowColor: scheme === "dark" ? "#000" : "#1e293b",
              },
            ]}
          >
            <Text style={[styles.title, { color: C.foreground }]}>
              {post.title}
            </Text>

            <View style={styles.metaRow}>
              {!!published && (
                <View
                  style={[
                    styles.metaPill,
                    {
                      backgroundColor:
                        scheme === "dark"
                          ? "rgba(148,163,184,0.12)"
                          : "rgba(2,6,23,0.06)",
                      borderColor:
                        scheme === "dark"
                          ? "rgba(148,163,184,0.25)"
                          : "rgba(2,6,23,0.10)",
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={C.mutedForeground}
                  />
                  <Text style={[styles.metaText, { color: C.mutedForeground }]}>
                    {published}
                  </Text>
                </View>
              )}

              {!!post.creator?.fullName && (
                <View
                  style={[
                    styles.metaPill,
                    {
                      backgroundColor:
                        scheme === "dark"
                          ? "rgba(148,163,184,0.12)"
                          : "rgba(2,6,23,0.06)",
                      borderColor:
                        scheme === "dark"
                          ? "rgba(148,163,184,0.25)"
                          : "rgba(2,6,23,0.10)",
                    },
                  ]}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={14}
                    color={C.mutedForeground}
                  />
                  <Text style={[styles.metaText, { color: C.mutedForeground }]}>
                    {post.creator.fullName}
                  </Text>
                </View>
              )}
            </View>

            {!!post.postTags?.length && (
              <View style={styles.tagsRow}>
                {post.postTags.map((pt, i) => (
                  <View
                    key={`${pt.tag.tag_id ?? i}`}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor:
                          scheme === "dark"
                            ? "rgba(59,130,246,0.18)"
                            : "rgba(59,130,246,0.12)",
                        borderColor:
                          scheme === "dark"
                            ? "rgba(59,130,246,0.35)"
                            : "rgba(59,130,246,0.25)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={12}
                      color={scheme === "dark" ? "#93C5FD" : "#2563EB"}
                    />
                    <Text
                      style={[
                        styles.tagText,
                        { color: scheme === "dark" ? "#BFDBFE" : "#1D4ED8" },
                      ]}
                    >
                      {pt.tag.tag_name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor:
                  scheme === "dark"
                    ? "rgba(148,163,184,0.18)"
                    : "rgba(2,6,23,0.08)",
                marginVertical: 12,
              }}
            />

            <Markdown style={mdStyles(scheme, C)}>
              {post.content || ""}
            </Markdown>
          </View>
        </View>
      </ScrollView>

      {/* ======= FULLSCREEN VIEWER ======= */}
      <ImageViewing
        images={post.image_url ? [{ uri: post.image_url }] : []}
        imageIndex={0}
        visible={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
        doubleTapToZoomEnabled
        swipeToCloseEnabled
        presentationStyle="fullScreen"
        backgroundColor="#000"
        HeaderComponent={ViewerHeaderComp}
        // fix hở đỉnh Android (Modal -> statusBarTranslucent)
        // @ts-expect-error: modalProps là prop pass-through của thư viện
        modalProps={{ statusBarTranslucent: true }}
      />
    </>
  );
}

/* =================== STYLES =================== */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  heroWrap: { width: "100%", paddingBottom: 16 },
  heroGrad: { position: "absolute", left: 0, right: 0, top: 0, height: 220 },

  headerActions: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  whiteBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },

  heroImageWrap: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    overflow: "hidden",
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImg: { width: "100%", height: "100%" },
  heroGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  fabRow: {
    position: "absolute",
    right: 22,
    bottom: 10,
    flexDirection: "row",
    gap: 10,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },

  outerPad: { paddingHorizontal: 16, marginTop: 8 },
  card: {
    borderRadius: 18,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  title: { fontSize: 24, fontWeight: "900", letterSpacing: 0.2 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaText: { fontSize: 12.5, fontWeight: "700" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12.5, fontWeight: "800", letterSpacing: 0.2 },

  // Header trong fullscreen viewer
  viewerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  viewerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});

/* =================== MARKDOWN THEME =================== */
function mdStyles(
  scheme: "light" | "dark",
  C: Record<string, string>
): MarkdownProps["style"] {
  const fg = C.foreground;
  const link = scheme === "dark" ? "#93C5FD" : "#2563EB";
  const codeBg =
    scheme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(2,6,23,0.05)";
  const calloutBg =
    scheme === "dark" ? "rgba(59,130,246,0.12)" : "rgba(37,99,235,0.08)";
  const hr = scheme === "dark" ? "rgba(148,163,184,0.25)" : "rgba(2,6,23,0.08)";

  return {
    body: { color: fg, fontSize: 16, lineHeight: 25 },
    heading1: { color: fg, fontSize: 28, fontWeight: "900", marginBottom: 8 },
    heading2: { color: fg, fontSize: 22, fontWeight: "800", marginVertical: 8 },
    heading3: { color: fg, fontSize: 18, fontWeight: "800", marginVertical: 6 },
    paragraph: { color: fg, marginBottom: 10 },
    strong: { fontWeight: "900" },
    em: { fontStyle: "italic" },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { color: fg, marginVertical: 2 },
    list_item_text: { color: fg },

    blockquote: {
      backgroundColor: calloutBg,
      borderLeftWidth: 3,
      borderLeftColor: link,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      marginVertical: 10,
      color: fg,
    },

    link: { color: link, textDecorationLine: "none", fontWeight: "800" },

    code_inline: {
      backgroundColor: codeBg,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      color: fg,
    },
    code_block: {
      backgroundColor: codeBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: fg,
    },
    fence: {
      backgroundColor: codeBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: fg,
    },

    image: { borderRadius: 14, overflow: "hidden", marginVertical: 10 },

    table: {
      borderColor: hr,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      marginVertical: 10,
      backgroundColor: C.card,
    },
    th: {
      backgroundColor:
        scheme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(2,6,23,0.05)",
      borderColor: hr,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: fg,
      fontWeight: "800",
    },
    tr: { borderColor: hr, borderBottomWidth: StyleSheet.hairlineWidth },
    td: { paddingHorizontal: 10, paddingVertical: 8, color: fg },

    hr: {
      backgroundColor: hr,
      height: StyleSheet.hairlineWidth,
      marginVertical: 16,
    },
  };
}
