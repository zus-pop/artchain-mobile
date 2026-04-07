import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  scheme?: "light" | "dark";
}

const COLORS = {
  light: {
    bg: "#FFFFFF",
    card: "#F5F5F5",
    text: "#2C2C2C",
    border: "#E0E0E0",
  },
  dark: {
    bg: "#1A1A1A",
    card: "#2D2D2D",
    text: "#FFFFFF",
    border: "#404040",
  },
};

const ALERT_COLORS: Record<AlertType, { icon: string; gradient: string[] }> = {
  success: {
    icon: "checkmark-circle",
    gradient: ["#10B981", "#059669"],
  },
  error: {
    icon: "close-circle",
    gradient: ["#EF4444", "#DC2626"],
  },
  warning: {
    icon: "warning",
    gradient: ["#F59E0B", "#D97706"],
  },
  info: {
    icon: "information-circle",
    gradient: ["#3B82F6", "#2563EB"],
  },
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  buttons = [{ text: "OK", style: "default" }],
  onDismiss,
  scheme = "dark",
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const colors = COLORS[scheme];
  const alertColor = ALERT_COLORS[type];

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onDismiss?.();
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: opacityAnim,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdropTouchable}
          onPress={onDismiss}
        />
      </Animated.View>

      {/* Alert Container */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.alertBox, { backgroundColor: colors.bg }]}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: alertColor.gradient[0] },
            ]}
          >
            <Ionicons name={alertColor.icon as any} size={48} color="white" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const isDestructive = button.style === "destructive";
              const isCancel = button.style === "cancel";
              const buttonBgColor = isDestructive
                ? "#EF4444"
                : isCancel
                  ? colors.card
                  : "#3B82F6";
              const buttonTextColor = isCancel ? colors.text : "white";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    {
                      backgroundColor: buttonBgColor,
                      flex:
                        buttons.length > 2
                          ? 1
                          : buttons.length === 2
                            ? 0.48
                            : 1,
                      marginRight: buttons.length === 2 && index === 0 ? 8 : 0,
                    },
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: buttonTextColor,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertBox: {
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    alignItems: "center",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "center",
    opacity: 0.85,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  buttonText: {
    fontSize: 14,
    textAlign: "center",
  },
});
