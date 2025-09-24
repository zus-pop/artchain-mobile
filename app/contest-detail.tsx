import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const contestData = {
  "1": {
    title: "Summer Painting Contest",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    date: "July 20, 2024",
    status: "Active",
    organizer: "ArtChain Foundation",
    location: "ArtChain Gallery, New York",
    prize: "$2,000 + Gallery Exhibition",
    participants: 120,
    description:
      "Join our summer painting contest and showcase your creativity! Open to all ages and styles. Submit your best work and stand a chance to win exciting prizes. Deadline: July 20, 2024.",
    rules:
      "Each participant may submit one painting. All styles and mediums are accepted. The painting must be original and not previously exhibited.",
  },
  "2": {
    title: "Winter Art Challenge",
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
    date: "December 10, 2024",
    status: "Upcoming",
    organizer: "ArtChain Foundation",
    location: "Online Event",
    prize: "$1,000 + Feature in Magazine",
    participants: 85,
    description:
      "Submit your winter-themed masterpieces and win prizes. Open to all ages. Deadline: December 10, 2024.",
    rules:
      "Artwork must be original and themed around winter. All mediums accepted. One entry per participant.",
  },
  "3": {
    title: "Abstract Art Competition",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    date: "August 5, 2024",
    status: "Closed",
    organizer: "ArtChain Foundation",
    location: "ArtChain Gallery, New York",
    prize: "$1,500 + Art Supplies",
    participants: 102,
    description:
      "Explore the world of abstract art. Winners announced soon. Thank you for your submissions!",
    rules:
      "Open to all styles of abstract art. One entry per participant. Deadline has passed.",
  },
};

function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    meta: {
      fontSize: 15,
      color: Colors[scheme].mutedForeground,
      marginBottom: 2,
    },
    metaValue: {
      color: Colors[scheme].primary,
      fontWeight: "bold",
    },
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    image: {
      width: "100%",
      height: 220,
    },
    content: {
      padding: 22,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 10,
    },
    date: {
      fontSize: 15,
      color: Colors[scheme].accent,
      marginBottom: 12,
      fontWeight: "600",
    },
    status: {
      fontWeight: "bold",
    },
    statusActive: {
      color: Colors[scheme].chart1,
    },
    statusUpcoming: {
      color: Colors[scheme].accent,
    },
    statusClosed: {
      color: Colors[scheme].destructive,
    },
    description: {
      fontSize: 16,
      color: Colors[scheme].foreground,
      lineHeight: 24,
      marginBottom: 18,
    },
    rulesHeader: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 6,
    },
    rules: {
      fontSize: 15,
      color: Colors[scheme].mutedForeground,
      lineHeight: 22,
    },
    participateBtn: {
      backgroundColor: Colors[scheme].chart1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 18,
      marginTop: 8,
    },
    participateBtnText: {
      color: Colors[scheme].primaryForeground,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    rewardsSection: {
      marginBottom: 18,
      marginTop: 8,
      alignItems: "flex-start",
    },
    rewardsHeader: {
      fontSize: 16,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 6,
    },
    rewardsBtn: {
      backgroundColor: Colors[scheme].accent,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 18,
      alignItems: "center",
    },
    rewardsBtnText: {
      color: Colors[scheme].primaryForeground,
      fontWeight: "bold",
      fontSize: 15,
    },
  });
}

const ContestDetail = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);
  const contest =
    contestData[id as keyof typeof contestData] || contestData["1"];

  return (
    <ScrollView style={themedStyles.container}>
      <Image source={{ uri: contest.image }} style={themedStyles.image} />
      <View style={themedStyles.content}>
        <Text style={themedStyles.title}>{contest.title}</Text>
        <Text style={themedStyles.date}>
          {contest.date}{" "}
          <Text
            style={[
              themedStyles.status,
              contest.status === "Active"
                ? themedStyles.statusActive
                : contest.status === "Upcoming"
                ? themedStyles.statusUpcoming
                : themedStyles.statusClosed,
            ]}
          >
            {contest.status}
          </Text>
        </Text>
        <Text style={themedStyles.meta}>
          Organizer:{" "}
          <Text style={themedStyles.metaValue}>{contest.organizer}</Text>
        </Text>
        <Text style={themedStyles.meta}>
          Location:{" "}
          <Text style={themedStyles.metaValue}>{contest.location}</Text>
        </Text>
        <Text style={themedStyles.meta}>
          Prize: <Text style={themedStyles.metaValue}>{contest.prize}</Text>
        </Text>
        <Text style={themedStyles.meta}>
          Participants:{" "}
          <Text style={themedStyles.metaValue}>{contest.participants}</Text>
        </Text>
        <Text style={themedStyles.description}>{contest.description}</Text>
        {contest.status === "Active" && (
          <TouchableOpacity
            style={themedStyles.participateBtn}
            onPress={() => alert("Participate logic goes here!")}
          >
            <Text style={themedStyles.participateBtnText}>
              Participate in Contest
            </Text>
          </TouchableOpacity>
        )}
        {["Active", "Closed"].includes(contest.status) && (
          <View style={themedStyles.rewardsSection}>
            <Text style={themedStyles.rewardsHeader}>
              See Award-Winning Paintings
            </Text>
            <TouchableOpacity
              style={themedStyles.rewardsBtn}
              onPress={() => router.push("/reward-painting")}
            >
              <Text style={themedStyles.rewardsBtnText}>Go to Rewards</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={themedStyles.rulesHeader}>Rules</Text>
        <Text style={themedStyles.rules}>{contest.rules}</Text>
      </View>
    </ScrollView>
  );
};

export default ContestDetail;
