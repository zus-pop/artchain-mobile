import { useWhoAmI } from "@/apis/auth";
import { usePosts } from "@/apis/post";
import PostCard from "@/components/cards/PostCard";
import CollapsibleHeader, {
  HEADER_COLLAPSED,
  HEADER_EXPANDED,
} from "@/components/header/CollapsibleHeader";
import PostCarousel from "@/components/PostCarousel";
import themedStyles from "@/components/styleSheet/themeSheet";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =================== Screen =================== */
export default function Home() {
  const { data, refetch: refetchMe } = useWhoAmI();
  const { data: postsData, refetch: refetchPosts } = usePosts();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";

  const posts = postsData?.data || [];

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerProgress = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        // Smooth progress from 0 to 1 based on scroll
        const progress = Math.min(Math.max(y / 100, 0), 1);
        headerProgress.setValue(progress);
      },
    }
  );

  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetchMe();
    refetchPosts();
    setRefreshing(false);
  }, []);

  return (
    <View
      style={[
        themedStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <CollapsibleHeader
        progress={headerProgress}
        username={data ? data.fullName : "Guest"}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED + 20,
          paddingBottom: 120,
        }}
        scrollEventThrottle={16}
        bounces
        alwaysBounceVertical
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            titleColor="#f97316"
            colors={["#f97316"]}
            progressBackgroundColor="#fff"
            progressViewOffset={insets.top + HEADER_COLLAPSED / 2}
          />
        }
      >
        <View style={themedStyles.section}>
          <View
            style={[themedStyles.sectionHeader, { alignItems: "baseline" }]}
          >
            <View>
              <Text style={themedStyles.sectionTitle}>Thông báo mới</Text>
            </View>
            <TouchableOpacity
              style={themedStyles.seeAllBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => router.push("/posts")}
            >
              <Text style={[themedStyles.seeAllText, { fontWeight: "800" }]}>
                Xem tất cả
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors[colorScheme].accentForeground}
              />
            </TouchableOpacity>
          </View>

          {posts.length > 0 ? (
            <>
              <PostCarousel
                data={posts.slice(0, 3)}
                scheme={colorScheme}
                onPressItem={(post) =>
                  router.push({
                    pathname: "/post-detail",
                    params: {
                      post: JSON.stringify({
                        ...post,
                        image_url: encodeURIComponent(post.image_url),
                      }),
                    },
                  })
                }
              />

              <View
                style={{
                  marginTop: 8,
                  marginHorizontal: 8,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {posts.slice(0, 4).map((item) => (
                  <View key={item.post_id.toString()} style={{ width: "48%" }}>
                    <PostCard
                      item={item}
                      thumbSize={88}
                      showDivider={false}
                      onPress={(post) =>
                        router.push({
                          pathname: "/post-detail",
                          params: {
                            post: JSON.stringify({
                              ...post,
                              image_url: encodeURIComponent(post.image_url),
                            }),
                          },
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors[colorScheme].mutedForeground}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: Colors[colorScheme].mutedForeground,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Chưa có thông báo nào
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme].mutedForeground,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Thông báo mới sẽ xuất hiện ở đây
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
