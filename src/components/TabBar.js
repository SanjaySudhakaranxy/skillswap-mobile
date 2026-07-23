import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";

const TABS = [
  { route: "Dashboard", label: "Home" },
  { route: "Browse", label: "Browse" },
  { route: "Sessions", label: "Sessions" },
  { route: "Wallet", label: "Wallet" },
  { route: "Profile", label: "Profile" },
];

export default function TabBar({ navigation, active }) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const isActive = t.route === active;
        return (
          <TouchableOpacity
            key={t.route}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) navigation.navigate(t.route);
            }}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.panel,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  label: { color: colors.dim, fontSize: 12 },
  labelActive: { color: colors.text, fontWeight: "700" },
});
