import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Award, Clock, MapPin, Star, Users } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Contest {
  id: string;
  title: string;
  description: string;
  category: string;
  prize: string;
  participants: number;
  deadline: string;
  status: "active" | "upcoming" | "ended";
  image: string;
  location: string;
  rating?: number;
}

interface ContestCardProps {
  contest: Contest;
  onPress?: () => void;
}

export function ContestCard({ contest, onPress }: ContestCardProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors[colorScheme].chart1;
      case "upcoming":
        return Colors[colorScheme].accent;
      case "ended":
        return Colors[colorScheme].mutedForeground;
      default:
        return Colors[colorScheme].mutedForeground;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang diễn ra";
      case "upcoming":
        return "Sắp diễn ra";
      case "ended":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={themedStyles.card} onPress={onPress}>
      <Image source={{ uri: contest.image }} style={themedStyles.image} />
      <View style={themedStyles.content}>
        <View style={themedStyles.header}>
          <View
            style={[
              themedStyles.statusBadge,
              { backgroundColor: getStatusColor(contest.status) },
            ]}
          >
            <Text style={themedStyles.statusText}>
              {getStatusText(contest.status)}
            </Text>
          </View>
          <View style={themedStyles.ratingContainer}>
            <Star
              size={14}
              color={Colors[colorScheme].accent}
              fill={Colors[colorScheme].accent}
            />
            <Text style={themedStyles.ratingText}>{contest.rating}</Text>
          </View>
        </View>

        <Text style={themedStyles.title}>{contest.title}</Text>
        <Text style={themedStyles.description} numberOfLines={2}>
          {contest.description}
        </Text>

        <View style={themedStyles.metaContainer}>
          <View style={themedStyles.metaItem}>
            <MapPin size={14} color={Colors[colorScheme].mutedForeground} />
            <Text style={themedStyles.metaText}>{contest.location}</Text>
          </View>
          <View style={themedStyles.metaItem}>
            <Users size={14} color={Colors[colorScheme].mutedForeground} />
            <Text style={themedStyles.metaText}>
              {contest.participants.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={themedStyles.footer}>
          <View style={themedStyles.prizeContainer}>
            <Award size={16} color={Colors[colorScheme].destructive} />
            <Text style={themedStyles.prizeText}>{contest.prize}</Text>
          </View>
          <View style={themedStyles.deadlineContainer}>
            <Clock size={14} color={Colors[colorScheme].destructive} />
            <Text style={themedStyles.deadlineText}>
              {new Date(contest.deadline).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: Colors[scheme].shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    image: {
      width: "100%",
      height: 200,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: Colors[scheme].primaryForeground,
      fontSize: 12,
      fontWeight: "600",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[scheme].foreground,
      marginLeft: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      lineHeight: 20,
      marginBottom: 12,
    },
    metaContainer: {
      marginBottom: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    metaText: {
      fontSize: 12,
      color: Colors[scheme].mutedForeground,
      marginLeft: 6,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    prizeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    prizeText: {
      fontSize: 14,
      fontWeight: "bold",
      color: Colors[scheme].destructive,
      marginLeft: 6,
    },
    deadlineContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    deadlineText: {
      fontSize: 12,
      color: Colors[scheme].destructive,
      marginLeft: 4,
      fontWeight: "500",
    },
  });
}
