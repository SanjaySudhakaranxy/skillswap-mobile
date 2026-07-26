import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import Field from "../components/Field";
import Button from "../components/Button";
import TabBar from "../components/TabBar";
import { filterSessions } from "../lib/appLogic";

const TABS = ["pending", "accepted", "completed", "declined"];

export default function SessionsScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [names, setNames] = useState({});
  const [tab, setTab] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [links, setLinks] = useState({});

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("sessions").select("*").order("created_at", { ascending: false });
    const list = data || [];
    setSessions(list);

    const ids = Array.from(
      new Set(list.flatMap((s) => [s.teacher_id, s.learner_id]))
    ).filter((id) => id !== user.id);

    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles").select("id, name").in("id", ids);
      const map = {};
      (profs || []).forEach((p) => {
        map[p.id] = p.name;
      });
      setNames(map);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function respond(session, accept) {
    setError("");
    setBusyId(session.id);
    const { error } = await supabase.rpc("respond_session", {
      p_session_id: session.id,
      p_accept: accept,
      p_meeting_link: accept ? links[session.id] || null : null,
    });
    setBusyId(null);
    if (error) return setError(error.message);
    await load();
  }

  async function confirm(session) {
    setError("");
    setBusyId(session.id);
    const { error } = await supabase.rpc("confirm_session", { p_session_id: session.id });
    setBusyId(null);
    if (error) return setError(error.message);
    await load();
  }

  const visible = filterSessions(sessions, tab);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const count = sessions.filter((s) => s.status === t).length;
            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabActive]}
              >
                <Text style={styles.tabText}>
                  {t} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {visible.length === 0 ? (
          <Card>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Nothing here yet.</Text>
          </Card>
        ) : (
          visible.map((s) => {
            const isTeacher = s.teacher_id === userId;
            const other = names[isTeacher ? s.learner_id : s.teacher_id] || "Unknown";
            const myConfirm = isTeacher ? s.teacher_confirmed : s.learner_confirmed;
            const theirConfirm = isTeacher ? s.learner_confirmed : s.teacher_confirmed;

            return (
              <Card key={s.id}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.skill}>{s.skill}</Text>
                    <Text style={styles.meta}>
                      {isTeacher ? "You teach " + other : other + " teaches you"}
                    </Text>
                  </View>
                  <Text style={[styles.coin, { color: isTeacher ? colors.good : colors.coin }]}>
                    {isTeacher ? "+" : "-"}
                    {s.coin_amount} SC
                  </Text>
                </View>

                {s.scheduled_time ? (
                  <Text style={styles.meta}>
                    Time: {new Date(s.scheduled_time).toLocaleString()}
                  </Text>
                ) : null}

                {s.message ? <Text style={styles.msg}>"{s.message}"</Text> : null}

                {s.meeting_link ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(s.meeting_link)}
                  >
                    <Text style={styles.link}>Open meeting link</Text>
                  </TouchableOpacity>
                ) : null}

                {s.status === "pending" && isTeacher && (
                  <View style={{ marginTop: 14 }}>
                    <Field
                      value={links[s.id] || ""}
                      onChangeText={(v) => setLinks({ ...links, [s.id]: v })}
                      placeholder="Google Meet / Zoom link (optional)"
                      autoCapitalize="none"
                    />
                    <View style={{ gap: 8 }}>
                      <Button
                        title="Accept"
                        onPress={() => respond(s, true)}
                        loading={busyId === s.id}
                      />
                      <Button
                        title="Decline and refund"
                        variant="danger"
                        onPress={() => respond(s, false)}
                        disabled={busyId === s.id}
                      />
                    </View>
                  </View>
                )}

                {s.status === "pending" && !isTeacher && (
                  <Text style={styles.note}>
                    Waiting for {other} to respond. Your coins are in escrow.
                  </Text>
                )}

                {s.status === "accepted" && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.meta}>
                      You: {myConfirm ? "confirmed" : "not confirmed"} | {other}:{" "}
                      {theirConfirm ? "confirmed" : "not confirmed"}
                    </Text>
                    <View style={{ height: 10 }} />
                    <Button
                      title={myConfirm ? "Waiting for " + other : "Confirm session completed"}
                      onPress={() => confirm(s)}
                      disabled={myConfirm}
                      loading={busyId === s.id}
                    />
                  </View>
                )}

                {s.status === "completed" && (
                  <Text style={[styles.note, { color: colors.good }]}>
                    Completed. {isTeacher ? "Coins paid to you." : "Coins sent to " + other + "."}
                  </Text>
                )}

                {s.status === "declined" && (
                  <Text style={styles.note}>
                    Declined. {isTeacher ? "Learner was refunded." : "You were refunded."}
                  </Text>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      <TabBar navigation={navigation} active="Sessions" />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  tab: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.text, fontSize: 13, textTransform: "capitalize" },
  skill: { color: colors.text, fontWeight: "700", fontSize: 16, textTransform: "capitalize" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  msg: { color: colors.text, fontSize: 13, fontStyle: "italic", marginTop: 8 },
  link: { color: colors.primary, fontSize: 13, marginTop: 8, textDecorationLine: "underline" },
  note: { color: colors.dim, fontSize: 13, marginTop: 12 },
  coin: { fontWeight: "700", fontSize: 15 },
  error: { color: colors.bad, fontSize: 13, marginBottom: 10 },
});
