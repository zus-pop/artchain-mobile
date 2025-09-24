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
interface Contest {
  id: string;
  title: string;
  description: string;
  category: string;
  prize: string;
  participants: number;
  deadline: string;
  startDate: string;
  status: "active" | "upcoming" | "ended";
  image: string;
  location: string;
  organizer: string;
}

const allContests: Contest[] = [
  {
    id: "1",
    title: "Vẽ Sài Gòn Xanh",
    description:
      "Cuộc thi vẽ về một thành phố xanh, bền vững và thân thiện với môi trường. Hãy thể hiện tầm nhìn của bạn về một Sài Gòn trong tương lai.",
    category: "Môi trường",
    prize: "50,000,000 VNĐ",
    participants: 1247,
    deadline: "2025-02-15",
    startDate: "2025-01-01",
    status: "active",
    image: "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
    location: "TP. Hồ Chí Minh",
    organizer: "Sở Văn hóa và Thể thao TPHCM",
  },
  {
    id: "2",
    title: "Nghệ Thuật Đường Phố",
    description:
      "Thể hiện tinh thần sáng tạo qua nghệ thuật đường phố và graffiti. Tôn vinh văn hóa hip-hop và street art.",
    category: "Đương đại",
    prize: "30,000,000 VNĐ",
    participants: 892,
    deadline: "2025-01-30",
    startDate: "2024-12-15",
    status: "active",
    image: "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
    location: "Quận 1, TPHCM",
    organizer: "Trung tâm Văn hóa Quận 1",
  },
  {
    id: "3",
    title: "Di Sản Văn Hóa",
    description:
      "Bảo tồn và quảng bá di sản văn hóa Việt Nam qua tranh vẽ. Khám phá vẻ đẹp truyền thống qua góc nhìn hiện đại.",
    category: "Truyền thống",
    prize: "40,000,000 VNĐ",
    participants: 567,
    deadline: "2025-03-01",
    startDate: "2025-02-01",
    status: "upcoming",
    image: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
    location: "Quận 3, TPHCM",
    organizer: "Bảo tàng Mỹ thuật TPHCM",
  },
  {
    id: "4",
    title: "Thiên Nhiên Việt Nam",
    description:
      "Vẽ về cảnh đẹp thiên nhiên Việt Nam, từ núi rừng đến biển cả. Tôn vinh vẻ đẹp quê hương.",
    category: "Môi trường",
    prize: "25,000,000 VNĐ",
    participants: 423,
    deadline: "2025-02-28",
    startDate: "2025-01-15",
    status: "active",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
    location: "Quận 7, TPHCM",
    organizer: "Hội Mỹ thuật TPHCM",
  },
  {
    id: "5",
    title: "Tương Lai Trẻ Em",
    description:
      "Cuộc thi dành cho các em nhỏ từ 6-12 tuổi. Vẽ về ước mơ và tương lai của các em.",
    category: "Thiếu nhi",
    prize: "15,000,000 VNĐ",
    participants: 1156,
    deadline: "2025-01-25",
    startDate: "2024-12-20",
    status: "active",
    image: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
    location: "Quận Bình Thạnh, TPHCM",
    organizer: "Trung tâm Giáo dục Nghệ thuật",
  },
];

const filterOptions = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

export default function ContestsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [showFilters, setShowFilters] = useState(false);
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  const filteredContests = allContests.filter((contest) => {
    const matchesSearch =
      contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contest.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "Tất cả" ||
      (selectedFilter === "Đang diễn ra" && contest.status === "active") ||
      (selectedFilter === "Sắp diễn ra" && contest.status === "upcoming") ||
      (selectedFilter === "Đã kết thúc" && contest.status === "ended");

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={themedStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
      <ScrollView
        style={themedStyles.contestList}
        showsVerticalScrollIndicator={false}
      >
        {filteredContests.map((contest) => (
          <ContestCard
            onPress={() => router.push("/contest-detail")}
            contest={contest}
            key={contest.id}
          />
        ))}
      </ScrollView>
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
