import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Placeholder: Implement login logic
    alert(`Logged in as ${username}`);
    router.back(); // Go back to profile
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login (Optional)</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ width: "100%", borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ width: "100%", borderWidth: 1, marginBottom: 12, padding: 8 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
