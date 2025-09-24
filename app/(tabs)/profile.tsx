import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("Logged out");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      {isLoggedIn ? (
        <View>
          <Text>Welcome, User!</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          <Text>Please log in to access competitor features.</Text>
          <Button title="Login" onPress={handleLogin} />
          <Text style={styles.settings}>App Settings: Coming Soon</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  settings: { marginTop: 16, fontSize: 16, color: "#666" },
});
