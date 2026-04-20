// app/(tabs)/_layout.tsx
import { useWhoAmI } from "@/apis/auth";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";

import { EnhancedTabBar } from "@/components/tabs/EnhancedTabBar";

export default function TabLayout() {
  const { data: user } = useWhoAmI();

  const contestsTabTitle = useMemo(() => {
    return user?.role === "EXAMINER" ? "Chấm Thi" : "Cuộc thi";
  }, [user?.role]);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      backBehavior="history"
      tabBar={(p) => <EnhancedTabBar {...p} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: contestsTabTitle,
          tabBarIcon: ({ color }) => (
            <Ionicons name="brush" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
