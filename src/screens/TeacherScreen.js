import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import Chip from "../components/Chip";
import Field from "../components/Field";
import Button from "../components/Button";
import { parsePreferredTime } from "../lib/appLogic";

export default function TeacherScreen({ route, navigation }) {
  const { teacherId } = route.params;

  const [teacher, setTeacher] = useState(null);
  const [balance, setBalance] = useState(0);
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: me } = await supabase
        .from("profiles").select("coin_balance").eq("id", user.id).single();
      setBalance(me?.coin_balance ?? 0);

      const { data: t } = await supabase
        .from("profiles").select("*").eq("id", teacherId).single();
      setTeacher(t);
      setSkill((t?.teach_skills || [])[0] || "");
      if (t?.name) navigation.setOptions({ title: t.name });
    }
    load();
  }, [teacherId, navigation]);

  function parseWhen() {
    if (!when.trim()) return null;
    // Expected format: YYYY-MM-DD HH:MM
    const iso = when.trim().replace(" ", "T");
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "invalid";
    return d.toISOString();
  }

  async function request() {
    setError("");
    if (!skill) return setError("Pick a skill.");

    const scheduled = parsePreferredTime(when);
    if (scheduled === "invalid")
      return setError("Time must look like 2026-08-01 18:30, or leave it empty.");

    setBusy(true);
    const { error } = await supabase.rpc("request_session", {
      p_teacher_id: teacherId,
      p_skill: skill,
      p_message: message,
      p_scheduled_time: scheduled,
      p_meeting_link: "",
    });
    setBusy(false);

    if (error) return setError(error.message);

    Alert.alert("Request sent", "Your coins are held in escrow until the teacher responds.");
    navigation.navigate("Sessions");
  }

  if (!teacher) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  const tooPoor = balance < teacher.cost_per_session;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{teacher.name}</Text>
            <Text style={styles.meta}>
              {teacher.sessions_completed} sessions completed
            </Text>
          </View>
          <Text style={styles.price}>{teacher.cost_per_session} SC</Text>
        </View>

        {teacher.bio ? <Text style={styles.bio}>{teacher.bio}</Text> : null}

        <Text style={styles.label}>Teaches</Text>
        <View style={styles.chips}>
          {(teacher.teach_skills || []).map((s) => (
            <Chip key={s} label={s} />
          ))}
        </View>

        {(teacher.learn_skills || []).length > 0 && (
          <>
            <Text style={styles.label}>Wants to learn</Text>
            <View style={styles.chips}>
              {teacher.learn_skills.map((s) => (
                <Chip key={s} label={s} />
              ))}
            </View>
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.section}>Request a session</Text>

        <Text style={styles.label}>Skill</Text>
        <View style={styles.chips}>
          {(teacher.teach_skills || []).map((s) => (
            <TouchableOpacity
              key={s}
              activeOpacity={0.8}
              onPress={() => setSkill(s)}
              style={[styles.pick, skill === s && styles.pickActive]}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 14 }} />

        <Field
          label="Preferred time (optional)"
          value={when}
          onChangeText={setWhen}
          placeholder="2026-08-01 18:30"
          autoCapitalize="none"
        />

        <Field
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="What do you want to cover?"
          multiline
          style={{ height: 90, textAlignVertical: "top" }}
        />

        <Text style={styles.meta}>
          Your balance: {balance} SC. {teacher.cost_per_session} SC will be held in
          escrow until the session is confirmed or declined.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ height: 12 }} />

        <Button
          title={tooPoor ? "Not enough SkillCoins" : "Request session"}
          onPress={request}
          loading={busy}
          disabled={tooPoor}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 20, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  price: { color: colors.coin, fontSize: 20, fontWeight: "800" },
  bio: { color: colors.text, fontSize: 14, marginTop: 12, lineHeight: 20 },
  label: { color: colors.muted, fontSize: 13, marginTop: 16, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  section: { color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 6 },
  pick: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  pickActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.bad, fontSize: 13, marginTop: 10 },
});
