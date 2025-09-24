import { Stack } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  return (
    <>
      <Stack.Screen
        options={{
          title: sample.title,
          headerStyle: {},
        }}
      />
      <ScrollView style={styles.container}>
        <Image source={{ uri: sample.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{sample.title}</Text>
          <Text style={styles.date}>{sample.date}</Text>
          <Text style={styles.summary}>{sample.summary}</Text>
          <Text style={styles.description}>{sample.description}</Text>
        </View>
      </ScrollView>
    </>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8fc",
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
    color: "#2d2d4a",
    marginBottom: 10,
  },
  date: {
    fontSize: 15,
    color: "#6c63ff",
    marginBottom: 12,
    fontWeight: "600",
  },
  summary: {
    fontSize: 17,
    color: "#444",
    marginBottom: 14,
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
});
export default AnnouncementDetail;
