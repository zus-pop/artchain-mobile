import { useWhoAmI } from "@/apis/auth";
import { useAssignCompetitors } from "@/apis/guardian";
import AddChildBottomSheet from "@/components/modals/AddChildBottomSheet";
import { Colors, withOpacity } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RegisterRequest } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Type for competitor registration data (subset of RegisterRequest)
type CompetitorFormData = Pick<
  RegisterRequest,
  | "username"
  | "password"
  | "email"
  | "fullName"
  | "schoolName"
  | "grade"
  | "ward"
  | "birthday"
  | "phone"
>;

// Local type for UI state management (competitor data with local id for editing)
type ChildFormData = CompetitorFormData & { localId: string };

export default function AddChildScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const [showAddChildSheet, setShowAddChildSheet] = useState(false);
  const [children, setChildren] = useState<ChildFormData[]>([]);
  const [editingChild, setEditingChild] = useState<ChildFormData | null>(null);

  const { data: user } = useWhoAmI();
  const assignCompetitors = useAssignCompetitors(() => {
    // Callback after successful assignment
    setChildren([]);
    router.back();
  });

  const handleAddChild = (childData: Omit<ChildFormData, "localId">) => {
    const newChild: ChildFormData = {
      ...childData,
      localId: Date.now().toString(), // Simple ID generation
    };
    setChildren((prev) => [...prev, newChild]);
    setShowAddChildSheet(false);
  };

  const handleEditChild = (childData: ChildFormData) => {
    setChildren((prev) =>
      prev.map((child) =>
        child.localId === childData.localId ? childData : child
      )
    );
    setEditingChild(null);
    setShowAddChildSheet(false);
  };

  const handleDeleteChild = (childId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa thông tin con em này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setChildren((prev) =>
            prev.filter((child) => child.localId !== childId)
          );
        },
      },
    ]);
  };

  const handleSubmitAll = () => {
    if (children.length === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm ít nhất một con em");
      return;
    }

    if (!user?.userId) {
      Alert.alert("Lỗi", "Không thể xác định thông tin người dùng");
      return;
    }

    Alert.alert(
      "Xác nhận",
      `Bạn có muốn thêm ${children.length} con em vào hệ thống?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            // Convert children data to RegisterRequest format
            const studentData: RegisterRequest[] = children.map((child) => ({
              username: child.username,
              password: child.password,
              email: child.email,
              fullName: child.fullName,
              role: "COMPETITOR",
              schoolName: child.schoolName,
              grade: child.grade,
              ward: child.ward,
              birthday: child.birthday,
              phone: child.phone,
            }));

            assignCompetitors.mutate({
              studentData,
              guardianId: user.userId,
            });
          },
        },
      ]
    );
  };

  const openEditSheet = (child: ChildFormData) => {
    setEditingChild(child);
    setShowAddChildSheet(true);
  };

  const closeSheet = () => {
    setShowAddChildSheet(false);
    setEditingChild(null);
  };

  const handleBottomSheetSubmit = (
    data: CompetitorFormData | (CompetitorFormData & { localId: string })
  ) => {
    if (editingChild) {
      // When editing, data should be the full ChildFormData with localId
      handleEditChild(data as ChildFormData);
    } else {
      // When adding, data should be CompetitorFormData without localId
      handleAddChild(data as CompetitorFormData);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.card,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: C.foreground,
            flex: 1,
          }}
        >
          Thêm con em
        </Text>
        {children.length > 0 && (
          <TouchableOpacity
            onPress={handleSubmitAll}
            style={{
              backgroundColor: C.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: C.primaryForeground,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Hoàn thành ({children.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {children.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 32,
            }}
          >
            <Ionicons name="people-outline" size={80} color={C.muted} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: C.foreground,
                marginTop: 16,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Chưa có thông tin con em
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: C.mutedForeground,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              Thêm thông tin con em để đăng ký tham gia các cuộc thi nghệ thuật
            </Text>
          </View>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.localId}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  backgroundColor: C.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: [
                        "#FF6B6B",
                        "#4ECDC4",
                        "#45B7D1",
                        "#96CEB4",
                        "#FFEAA7",
                        "#DDA0DD",
                        "#98D8C8",
                        "#F7DC6F",
                        "#BB8FCE",
                        "#85C1E9",
                      ][index % 10],
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="person-outline" size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: C.foreground,
                        marginBottom: 4,
                      }}
                    >
                      {item.fullName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: C.mutedForeground,
                      }}
                    >
                      {item.grade} - {item.schoolName}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => openEditSheet(item)}
                      style={{
                        padding: 8,
                        backgroundColor: withOpacity(C.muted, 0.4),
                        borderRadius: 6,
                      }}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={16}
                        color={C.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteChild(item.localId)}
                      style={{
                        padding: 8,
                        backgroundColor: withOpacity(C.destructive, 0.2),
                        borderRadius: 6,
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={C.destructiveForeground}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {/* Add Child Button */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => {
              setEditingChild(null);
              setShowAddChildSheet(true);
            }}
            style={{
              backgroundColor: C.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="add" size={20} color={C.primaryForeground} />
            <Text
              style={{
                color: C.primaryForeground,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Thêm con em
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Child Bottom Sheet */}
      <AddChildBottomSheet
        visible={showAddChildSheet}
        onClose={closeSheet}
        onSubmit={handleBottomSheetSubmit}
        editingChild={editingChild}
      />
    </SafeAreaView>
  );
}
