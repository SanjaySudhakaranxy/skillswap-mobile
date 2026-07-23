import React from "react";
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function Button({ title, onPress, variant = "primary", disabled, loading }) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, variant === "ghost" && { color: colors.text }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  danger: { backgroundColor: colors.bad },
  disabled: { opacity: 0.45 },
  text: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
