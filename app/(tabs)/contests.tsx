import { useContest } from "@/apis/contest";
import { ContestCard } from "@/components/ContestCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const filterOptions = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

export default function ContestsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [showFilters, setShowFilters] = useState(false);
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  // Use real API
  const {
    data: contests = [],
    isLoading,
    isError,
  } = useContest({
    status:
      selectedFilter === "Tất cả"
        ? "all"
        : selectedFilter === "Đang diễn ra"
        ? "active"
        : selectedFilter === "Sắp diễn ra"
        ? "upcoming"
        : "ended",
  });

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar />

      {/* Header */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.headerTitle}>Cuộc thi</Text>
        <Text style={themedStyles.headerSubtitle}>
          Khám phá các cuộc thi vẽ hấp dẫn
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={themedStyles.searchSection}>
        <View style={themedStyles.searchContainer}>
          <Search
            size={20}
            color={Colors[colorScheme].icon}
            style={themedStyles.searchIcon}
          />
          <TextInput
            style={themedStyles.searchInput}
            placeholder="Tìm kiếm cuộc thi..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors[colorScheme].mutedForeground}
          />
        </View>
        <TouchableOpacity
          style={themedStyles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors[colorScheme].primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={themedStyles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  themedStyles.filterOption,
                  selectedFilter === option && themedStyles.filterOptionActive,
                ]}
                onPress={() => setSelectedFilter(option)}
              >
                <Text
                  style={[
                    themedStyles.filterOptionText,
                    selectedFilter === option &&
                      themedStyles.filterOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contest List */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors[colorScheme].background,
          }}
        >
          <Text
            style={{ color: Colors[colorScheme].mutedForeground, fontSize: 16 }}
          >
            Đang tải cuộc thi...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={themedStyles.contestList}
          showsVerticalScrollIndicator={false}
        >
          {contests.map((contest) => (
            <ContestCard
              onPress={() => router.push("/contest-detail")}
              contest={contest}
              key={contest.id}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Dynamic themed styles
function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    header: {
      backgroundColor: Colors[scheme].card,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: Colors[scheme].cardForeground,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: Colors[scheme].mutedForeground,
    },
    searchSection: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: Colors[scheme].card,
      alignItems: "center",
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[scheme].input,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginRight: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: Colors[scheme].foreground,
    },
    filterButton: {
      padding: 12,
      backgroundColor: Colors[scheme].primary,
      borderRadius: 12,
    },
    filterOptions: {
      backgroundColor: Colors[scheme].card,
      paddingVertical: 8,
      paddingLeft: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    filterOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: Colors[scheme].input,
      borderRadius: 20,
      marginRight: 8,
    },
    filterOptionActive: {
      backgroundColor: Colors[scheme].primary,
    },
    filterOptionText: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      fontWeight: "500",
    },
    filterOptionTextActive: {
      color: Colors[scheme].primaryForeground,
    },
    contestList: {
      flex: 1,
      paddingTop: 8,
    },
  });
}
