import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Award, Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Contest } from "../types";

interface ContestCardProps {
  contest: Contest;
  onPress?: () => void;
}

export function ContestCard({ contest, onPress }: ContestCardProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return Colors[colorScheme].chart1;
      case "UPCOMING":
        return Colors[colorScheme].accent;
      case "ENDED":
        return Colors[colorScheme].mutedForeground;
      default:
        return Colors[colorScheme].mutedForeground;
    }
    // thiếu trường hợp
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Đang diễn ra";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "ENDED":
        return "Đã kết thúc";
      default:
        return status;
    }
    // thiếu trường hợp
  };

  return (
    <TouchableOpacity style={themedStyles.card} onPress={onPress}>
      {/* Dưới Database chưa có hình, style thì add tạm ảnh sample nha em Trí */}
      {/* <Image source={{ uri: contest.image }} style={themedStyles.image} /> */}
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
            <Award
              size={16}
              color={Colors[colorScheme].destructive}
              fill={Colors[colorScheme].destructive}
            />
            <Text style={themedStyles.ratingText}>{contest.numOfAward}</Text>
          </View>
        </View>

        <Text style={themedStyles.title}>{contest.title}</Text>
        <Text style={themedStyles.description} numberOfLines={2}>
          {contest.description}
        </Text>

        <View style={themedStyles.footer}>
          <View style={themedStyles.deadlineContainer}>
            <Clock size={14} color={Colors[colorScheme].destructive} />
            <Text style={themedStyles.deadlineText}>
              {new Date(contest.endDate).toLocaleDateString("vi-VN")}
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
      borderRadius: 6,
      overflow: "hidden",
      shadowColor: Colors[scheme].border,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      marginHorizontal: 6,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
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
