import { usePosts } from "@/apis/post";
import PostCard from "@/components/cards/PostCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterType = "all" | "tag";

export default function PostsScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>(
    undefined
  );
  const [refreshing, setRefreshing] = useState(false);

  // Get tag_id from tag_name helper function
  const getTagId = (tagName: string, posts: any[]): number | undefined => {
    for (const post of posts) {
      const tag = post.postTags?.find(
        (postTag: any) => postTag.tag.tag_name === tagName
      );
      if (tag) {
        return tag.tag.tag_id;
      }
    }
    return undefined;
  };

  // Single usePosts call with all filters
  const { data: postsData, isLoading } = usePosts({
    search: searchQuery.trim() || undefined,
    tag_id: selectedTagId,
  });

  const posts = postsData?.data || [];

  // Get all unique tags from current posts data (filtered results)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.postTags?.forEach((postTag) => {
        tagSet.add(postTag.tag.tag_name);
      });
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, you'd refetch the data here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
    setSelectedTag(null);
    setSelectedTagId(undefined);
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={Colors[colorScheme].primary}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={[
          styles.loadingText,
          { color: Colors[colorScheme].mutedForeground },
        ]}
      >
        Đang tải...
      </Text>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <PostCard
      item={item}
      thumbSize={80}
      radius={8}
      showDivider
      onPress={(post) =>
        router.push({
          pathname: "/post-detail",
          params: { post: JSON.stringify(post) },
        })
      }
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={Colors[colorScheme].mutedForeground}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={[styles.emptyTitle, { color: Colors[colorScheme].foreground }]}
      >
        {searchQuery || selectedTag
          ? "Không tìm thấy bài viết"
          : "Chưa có bài viết nào"}
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: Colors[colorScheme].mutedForeground },
        ]}
      >
        {searchQuery || selectedTag
          ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
          : "Bài viết mới sẽ xuất hiện ở đây"}
      </Text>
      {(searchQuery || selectedTag) && (
        <TouchableOpacity
          style={[
            styles.clearButton,
            { borderColor: Colors[colorScheme].border },
          ]}
          onPress={clearFilters}
        >
          <Text
            style={[
              styles.clearButtonText,
              { color: Colors[colorScheme].primary },
            ]}
          >
            Xóa bộ lọc
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Danh sách bài viết",
          headerStyle: { backgroundColor: Colors[colorScheme].card },
          headerTintColor: Colors[colorScheme].foreground,
        }}
      />

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: Colors[colorScheme].card },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: Colors[colorScheme].muted },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={Colors[colorScheme].mutedForeground}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: Colors[colorScheme].foreground },
            ]}
            placeholder="Tìm kiếm bài viết..."
            placeholderTextColor={Colors[colorScheme].mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors[colorScheme].mutedForeground}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View
        style={[
          styles.filtersContainer,
          { backgroundColor: Colors[colorScheme].card },
        ]}
      >
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "all" && [
                styles.filterTabActive,
                { backgroundColor: Colors[colorScheme].primary },
              ],
            ]}
            onPress={() => {
              setSelectedFilter("all");
              setSelectedTag(null);
              setSelectedTagId(undefined);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    selectedFilter === "all"
                      ? Colors[colorScheme].primaryForeground
                      : Colors[colorScheme].foreground,
                },
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "tag" && [
                styles.filterTabActive,
                { backgroundColor: Colors[colorScheme].primary },
              ],
            ]}
            onPress={() => setSelectedFilter("tag")}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color:
                    selectedFilter === "tag"
                      ? Colors[colorScheme].primaryForeground
                      : Colors[colorScheme].foreground,
                },
              ]}
            >
              Theo thẻ
            </Text>
          </TouchableOpacity>
        </View>

        {selectedFilter === "tag" && (
          <View style={styles.tagFilters}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={allTags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor:
                        selectedTag === item
                          ? Colors[colorScheme].primary
                          : Colors[colorScheme].muted,
                      borderColor:
                        selectedTag === item
                          ? Colors[colorScheme].primary
                          : Colors[colorScheme].border,
                    },
                  ]}
                  onPress={() => {
                    if (selectedTag === item) {
                      // Deselecting
                      setSelectedTag(null);
                      setSelectedTagId(undefined);
                    } else {
                      // Selecting - find the tag_id
                      const tagId = getTagId(item, posts);
                      setSelectedTag(item);
                      setSelectedTagId(tagId);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      {
                        color:
                          selectedTag === item
                            ? Colors[colorScheme].primaryForeground
                            : Colors[colorScheme].foreground,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.tagFiltersContent}
            />
          </View>
        )}
      </View>

      {/* Results Count */}
      <View
        style={[
          styles.resultsContainer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <Text
          style={[
            styles.resultsText,
            { color: Colors[colorScheme].mutedForeground },
          ]}
        >
          {posts.length} bài viết
          {searchQuery && ` cho "${searchQuery}"`}
          {selectedTag && ` với thẻ "${selectedTag}"`}
        </Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_id.toString()}
        renderItem={renderPostItem}
        ListEmptyComponent={isLoading ? renderLoadingState : renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    // backgroundColor is set dynamically
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tagFilters: {
    maxHeight: 60,
  },
  tagFiltersContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
  },
});
