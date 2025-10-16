import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { View } from "react-native";
import { Toaster } from "sonner-native";
export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = {
    dark: colorScheme === "dark",
    colors: {
      background: Colors[colorScheme ?? "light"].background,
      card: Colors[colorScheme ?? "light"].card,
      text: Colors[colorScheme ?? "light"].foreground,
      border: Colors[colorScheme ?? "light"].border,
      notification: Colors[colorScheme ?? "light"].primary,
      primary: Colors[colorScheme ?? "light"].primary,
    },
    fonts: {
      regular: { fontFamily: Fonts.sans, fontWeight: "400" as "400" },
      medium: { fontFamily: Fonts.sans, fontWeight: "500" as "500" },
      light: { fontFamily: Fonts.sans, fontWeight: "300" as "300" },
      thin: { fontFamily: Fonts.sans, fontWeight: "200" as "200" },
      bold: { fontFamily: Fonts.sans, fontWeight: "700" as "700" },
      heavy: { fontFamily: Fonts.sans, fontWeight: "800" as "800" },
    },
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top, // đúng bằng safe-area
            backgroundColor: "#fff", // hoặc Colors[colorScheme].background
            zIndex: 9999,
          }}
        />
        <QueryClientProvider client={queryClient}>
          <StatusBar translucent animated backgroundColor="transparent" />
          <ThemeProvider value={theme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="login"
                options={{
                  title: "Login",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  title: "Signup",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="setting"
                options={{
                  title: "Setting",
                  headerShown: false,
                  presentation: "formSheet",
                }}
              />
              <Stack.Screen
                name="notifications"
                options={{
                  title: "Notification",
                  headerShown: false,
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="contest-detail"
                options={{ title: "Contest Detail", headerShown: false }}
              />
              <Stack.Screen
                name="searchContest"
                options={{ title: "Search Contest", headerShown: false }}
              />
              <Stack.Screen
                name="results"
                options={{ title: "Search Results", headerShown: false }}
              />
              <Stack.Screen
                name="competitor-signup"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="guard-signup"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="painting-upload"
                options={{ title: "Bài vẽ dự thi", headerShown: true }}
              />
            </Stack>
            <Toaster richColors />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
