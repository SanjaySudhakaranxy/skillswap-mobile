import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import { validateAuthInput } from "../lib/appLogic";
import Field from "../components/Field";
import Button from "../components/Button";
import Card from "../components/Card";

export default function LoginScreen() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (mode === "signup" && !name.trim()) return setError("Please enter your name.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      // App.js listens to onAuthStateChange and swaps the navigator.
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>
          Skill<Text style={{ color: colors.primary }}>Swap</Text>
        </Text>
        <Text style={styles.tagline}>Teach. Earn. Learn.</Text>

        <Card>
          <View style={styles.toggle}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("signin")}
              style={[styles.toggleBtn, mode === "signin" && styles.toggleActive]}
            >
              <Text style={styles.toggleText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("signup")}
              style={[styles.toggleBtn, mode === "signup" && styles.toggleActive]}
            >
              <Text style={styles.toggleText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {mode === "signup" && (
            <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          )}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={mode === "signup" ? "Create account" : "Sign in"}
            onPress={submit}
            loading={busy}
          />

          {mode === "signup" && (
            <Text style={styles.hint}>You will receive 100 SkillCoins on signup.</Text>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logo: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  tagline: { color: colors.muted, textAlign: "center", marginTop: 6, marginBottom: 24 },
  toggle: { flexDirection: "row", marginBottom: 16, gap: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { color: colors.text, fontWeight: "600" },
  error: { color: colors.bad, fontSize: 13, marginBottom: 10 },
  hint: { color: colors.dim, fontSize: 12, textAlign: "center", marginTop: 10 },
});
