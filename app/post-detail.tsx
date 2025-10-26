import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Post } from "@/types/post";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const PostDetail = () => {
  const colorScheme = useColorScheme() ?? "light";
  const themedStyles = getThemedStyles(colorScheme);
  const { post: postParam } = useLocalSearchParams();

  // Parse the post data from route params
  const post: Post = postParam ? JSON.parse(postParam as string) : null;

  if (!post) {
    return (
      <View
        style={[
          themedStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text
          style={{ color: Colors[colorScheme].mutedForeground, fontSize: 16 }}
        >
          Không tìm thấy bài viết
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: post.title,
          headerStyle: { backgroundColor: Colors[colorScheme].card },
        }}
      />
      <ScrollView style={themedStyles.container}>
        <Image source={{ uri: post.image_url }} style={themedStyles.image} />
        <View style={themedStyles.content}>
          <Text style={themedStyles.title}>{post.title}</Text>
          <Text style={themedStyles.date}>
            {new Date(post.published_at).toLocaleDateString("vi-VN")}
          </Text>
          <View style={themedStyles.metaRow}>
            {post.creator && (
              <Text style={themedStyles.creator}>
                Bởi {post.creator.fullName}
              </Text>
            )}
          </View>

          {/* Tags */}
          {post.postTags && post.postTags.length > 0 && (
            <View style={themedStyles.tagsContainer}>
              {post.postTags.map((postTag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(59, 130, 246, 0.1)",
                    borderWidth: 1,
                    borderColor:
                      colorScheme === "dark"
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(59, 130, 246, 0.2)",
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colorScheme === "dark" ? "#60A5FA" : "#2563EB",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {postTag.tag.tag_name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={themedStyles.description}>{post.content}</Text>
        </View>
      </ScrollView>
    </>
  );
};

function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    image: {
      width: "100%",
      height: 260,
    },
    content: {
      padding: 22,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: Colors[scheme].primary,
      marginBottom: 10,
    },
    date: {
      fontSize: 15,
      color: Colors[scheme].mutedForeground,
      marginBottom: 12,
      fontWeight: "600",
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    creator: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      fontStyle: "italic",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 20,
    },
    description: {
      fontSize: 16,
      color: Colors[scheme].foreground,
      lineHeight: 24,
    },
  });
}
export default PostDetail;
