import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = {
    dark: colorScheme === "dark",
    colors: {
      background: Colors[colorScheme ?? "light"].background,
      card: Colors[colorScheme ?? "light"].card,
      text: Colors[colorScheme ?? "light"].text,
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
      <QueryClientProvider client={queryClient}>
        <StatusBar animated backgroundColor="transparent" />
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
              options={{ title: "Contest Detail" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
