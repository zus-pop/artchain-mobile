import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const sample = {
  title: "ArtChain Painting Contest 2024",
  image:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  date: "June 10, 2024",
  summary:
    "Showcase your talent in our annual painting contest. Exciting prizes await!",
  description:
    "This year, ArtChain invites artists from all backgrounds to participate in our annual painting contest. Submit your best work and stand a chance to win exciting prizes, be featured in our gallery, and connect with fellow artists. The contest is open to all ages and styles. Deadline for submission is June 10, 2024. Don't miss out!",
};

const AnnouncementDetail = () => {
  const colorScheme = useColorScheme() ?? "light";
  const themedStyles = getThemedStyles(colorScheme);
  return (
    <>
      <Stack.Screen
        options={{
          title: sample.title,
          headerStyle: { backgroundColor: Colors[colorScheme].card },
        }}
      />
      <ScrollView style={themedStyles.container}>
        <Image source={{ uri: sample.image }} style={themedStyles.image} />
        <View style={themedStyles.content}>
          <Text style={themedStyles.title}>{sample.title}</Text>
          <Text style={themedStyles.date}>{sample.date}</Text>
          <Text style={themedStyles.summary}>{sample.summary}</Text>
          <Text style={themedStyles.description}>{sample.description}</Text>
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
    summary: {
      fontSize: 17,
      color: Colors[scheme].foreground,
      marginBottom: 14,
      lineHeight: 22,
    },
    description: {
      fontSize: 16,
      color: Colors[scheme].mutedForeground,
      lineHeight: 24,
    },
  });
}
export default AnnouncementDetail;
