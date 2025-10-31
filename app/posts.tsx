import { usePosts } from "@/apis/post";
import PostCard from "@/components/cards/PostCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- Rainbow tokens ---------- */
const RAINBOW = [
  ["#60A5FA", "#7C3AED"],
  ["#22D3EE", "#06B6D4"],
  ["#34D399", "#10B981"],
  ["#FBBF24", "#F59E0B"],
  ["#F472B6", "#EC4899"],
  ["#F87171", "#EF4444"],
  ["#A78BFA", "#8B5CF6"],
] as const;
const pickGrad = (i: number) => RAINBOW[i % RAINBOW.length];

type FilterType = "all" | "tag";

export default function PostsScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  // ------- STATES -------
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ------- API -------
  const {
    data: postsData,
    isLoading,
    refetch,
  } = usePosts({
    search: searchQuery || undefined,
    tag_id: selectedTagId,
  });
  const posts = postsData?.data || [];

  // ------- HELPERS -------
  const getTagId = (tagName: string, list: any[]): number | undefined => {
    for (const post of list) {
      const t = post.postTags?.find((pt: any) => pt.tag.tag_name === tagName);
      if (t) return t.tag.tag_id;
    }
    return undefined;
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p: any) =>
      p.postTags?.forEach((pt: any) => set.add(pt.tag.tag_name))
    );
    return Array.from(set).sort();
  }, [posts]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.resolve(refetch?.()).finally(() => setRefreshing(false));
  }, [refetch]);

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedFilter("all");
    setSelectedTag(null);
    setSelectedTagId(undefined);
  };

  // ------- RENDERERS -------
  const renderPostItem = ({ item }: { item: any }) => (
    <PostCard
      item={item}
      thumbSize={120}
      showDivider={false}
      onPress={(post) =>
        router.push({
          pathname: "/post-detail",
          params: { post: JSON.stringify(post) },
        })
      }
    />
  );

  const Loading = () => (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={pickGrad(0)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingBadge}
      >
        <ActivityIndicator size="small" color="#fff" />
        <Text style={styles.loadingText}>Đang tải bài viết…</Text>
      </LinearGradient>
    </View>
  );

  const Empty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={pickGrad(4)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyBadge}
      >
        <Ionicons name="sparkles-outline" size={18} color="#fff" />
        <Text style={styles.emptyBadgeText}>Không có bài phù hợp</Text>
      </LinearGradient>

      <Text style={[styles.emptyTitle, { color: C.foreground }]}>
        {searchQuery || selectedTag
          ? "Không tìm thấy bài viết"
          : "Chưa có bài viết"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: C.mutedForeground }]}>
        {searchQuery || selectedTag
          ? "Thử từ khóa khác, đổi thẻ hoặc xóa bộ lọc."
          : "Bài viết mới sẽ xuất hiện tại đây."}
      </Text>

      {(searchQuery || selectedTag) && (
        <TouchableOpacity
          onPress={clearFilters}
          activeOpacity={0.9}
          style={[styles.clearButton, { borderColor: C.border }]}
        >
          <Ionicons name="refresh" size={16} color={C.primary} />
          <Text style={[styles.clearButtonText, { color: C.primary }]}>
            Xóa bộ lọc
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ------- UI -------
  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {/* ẨN HEADER HỆ THỐNG */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* BACK BUTTON trắng (trên cùng, trái) */}
      <View
        style={[styles.backWrap, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backTxt}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Hero gradient header mềm mượt, nghệ thuật */}
      <LinearGradient
        colors={
          scheme === "dark" ? ["#0EA5E9", "#6366F1"] : ["#60A5FA", "#A78BFA"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 52 }]} // chừa chỗ back
      >
        <Text style={styles.heroTitle}>Khám phá bài viết</Text>
        <Text style={styles.heroSub}>Cảm hứng mỗi ngày từ cộng đồng</Text>

        {/* Search pill */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.9)" />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Tìm kiếm bài viết..."
              placeholderTextColor="rgba(255,255,255,0.75)"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchInput ? (
              <TouchableOpacity
                onPress={() => setSearchInput("")}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="rgba(255,255,255,0.9)"
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter tabs */}
          <View style={styles.tabRow}>
            {(["all", "tag"] as FilterType[]).map((ft, idx) => {
              const active = selectedFilter === ft;
              const colors = pickGrad(idx + 1);
              return (
                <TouchableOpacity
                  key={ft}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedFilter(ft);
                    if (ft === "all") {
                      setSelectedTag(null);
                      setSelectedTagId(undefined);
                    }
                  }}
                  style={styles.tabBtnOuter}
                >
                  <LinearGradient
                    colors={
                      active
                        ? colors
                        : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.12)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tabBtn}
                  >
                    <Text style={[styles.tabText, { color: "#fff" }]}>
                      {ft === "all" ? "Tất cả" : "Theo thẻ"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tag chips */}
          {selectedFilter === "tag" && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={allTags}
              keyExtractor={(t) => t}
              contentContainerStyle={styles.tagRow}
              renderItem={({ item, index }) => {
                const active = selectedTag === item;
                const grad = pickGrad(index + 2);
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (active) {
                        setSelectedTag(null);
                        setSelectedTagId(undefined);
                      } else {
                        const id = getTagId(item, posts);
                        setSelectedTag(item);
                        setSelectedTagId(id);
                      }
                    }}
                    style={styles.tagChipOuter}
                  >
                    <LinearGradient
                      colors={
                        active
                          ? grad
                          : ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.1)"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tagChip}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={12}
                        color="#fff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.tagText}>{item}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </LinearGradient>

      {/* Result summary bar */}
      <View style={styles.summaryRow}>
        <LinearGradient
          colors={pickGrad(6)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryPill}
        >
          <Text style={styles.summaryText}>
            {posts.length} bài viết
            {searchQuery ? ` • “${searchQuery}”` : ""}
            {selectedTag ? ` • #${selectedTag}` : ""}
          </Text>
        </LinearGradient>

        {(searchQuery || selectedTag) && (
          <TouchableOpacity
            onPress={clearFilters}
            activeOpacity={0.9}
            style={styles.summaryReset}
          >
            <Ionicons name="refresh" size={16} color="#64748B" />
            <Text style={styles.summaryResetText}>Làm mới</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_id.toString()}
        renderItem={renderPostItem}
        ListEmptyComponent={isLoading ? <Loading /> : <Empty />}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Back button (ẩn header hệ thống, tự render) */
  backWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 20,
    alignItems: "flex-start",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  backTxt: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12.5,
    letterSpacing: 0.3,
  },

  /* Hero */
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  heroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
  },

  /* Search pill */
  searchWrap: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 2,
  },

  /* Tabs */
  tabRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  tabBtnOuter: { borderRadius: 999 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
    color: "#fff",
  },

  /* Tag chips */
  tagRow: { paddingTop: 10, paddingBottom: 4 },
  tagChipOuter: { marginRight: 8, borderRadius: 999 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tagText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* Summary */
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  summaryPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryText: { color: "#fff", fontSize: 12.5, fontWeight: "900" },
  summaryReset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
  },
  summaryResetText: { color: "#64748B", fontSize: 12.5, fontWeight: "900" },

  /* List */
  listContainer: { paddingHorizontal: 16, paddingTop: 8 },

  /* Loading */
  loadingContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  loadingBadge: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loadingText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  /* Empty */
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  emptyBadgeText: { color: "#fff", fontSize: 12.5, fontWeight: "900" },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearButtonText: { fontSize: 14, fontWeight: "900" },
});
