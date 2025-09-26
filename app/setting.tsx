import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

const languages = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const Setting = () => {
  const colorScheme = useColorScheme() ?? "light";
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [language, setLanguage] = useState("vi");
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors[colorScheme].card,
          paddingHorizontal: 12,
          paddingTop: 36,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme].border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].primary}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: Colors[colorScheme].primary,
          }}
        >
          Cài đặt ứng dụng
        </Text>
      </View>

      <View style={{ flex: 1, padding: 24 }}>
        {/* Theme toggle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              color: Colors[colorScheme].foreground,
            }}
          >
            Chế độ tối
          </Text>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            thumbColor={isDark ? Colors.dark.primary : Colors.light.primary}
            trackColor={{ false: Colors.light.muted, true: Colors.dark.muted }}
          />
        </View>

        {/* Language selector */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: Colors[colorScheme].foreground,
              marginBottom: 8,
            }}
          >
            Ngôn ngữ
          </Text>
          <View style={{ flexDirection: "row" }}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                onPress={() => setLanguage(lang.value)}
                style={{
                  backgroundColor:
                    language === lang.value
                      ? Colors[colorScheme].primary
                      : Colors[colorScheme].muted,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color:
                      language === lang.value
                        ? Colors[colorScheme].primaryForeground
                        : Colors[colorScheme].foreground,
                  }}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification toggle (placeholder) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              color: Colors[colorScheme].foreground,
            }}
          >
            Nhận thông báo
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={
              notifications
                ? Colors[colorScheme].primary
                : Colors[colorScheme].muted
            }
            trackColor={{
              false: Colors[colorScheme].muted,
              true: Colors[colorScheme].primary,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Setting;
