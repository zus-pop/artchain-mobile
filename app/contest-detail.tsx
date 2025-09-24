import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ContestDetail = () => {
  const { id } = useLocalSearchParams();

  // Mock contest data
  const contest = {
    id,
    title: `Contest ${id}`,
    description: `Details for contest ${id}. This is a painting competition.`,
    deadline: "October 15, 2025",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{contest.title}</Text>
      <Text style={styles.description}>{contest.description}</Text>
      <Text style={styles.deadline}>Deadline: {contest.deadline}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  description: { fontSize: 16, marginBottom: 16 },
  deadline: { fontSize: 14, color: "#666" },
});

export default ContestDetail;
