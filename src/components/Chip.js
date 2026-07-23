import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function Chip({ label, onRemove }) {
  return (
    <TouchableOpacity
      activeOpacity={onRemove ? 0.7 : 1}
      onPress={onRemove}
      style={styles.chip}
    >
      <Text style={styles.text}>
        {label}
        {onRemove ? "   x" : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  text: { color: colors.text, fontSize: 13 },
});
