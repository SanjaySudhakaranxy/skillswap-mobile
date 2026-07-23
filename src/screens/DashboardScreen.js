import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import Button from "../components/Button";
import TabBar from "../components/TabBar";

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setRefreshing(false);
      return;
    }

    const { data: p } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();
    setProfile(p);

    const { data: acc } = await supabase
      .from("sessions").select("*").eq("status", "accepted")
      .order("scheduled_time", { ascending: true });
    setUpcoming(acc || []);

    const { data: pend } = await supabase
      .from("sessions").select("id").eq("status", "pending").eq("teacher_id", user.id);
    setPendingCount((pend || []).length);

    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <Text style={styles.hi}>Hi, {profile?.name || "there"}</Text>
        <Text style={styles.sub}>Pull down to refresh.</Text>

        {profile && (profile.teach_skills || []).length === 0 && (
          <Card style={{ borderColor: colors.primary }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>
              You have not listed any teach skills, so nobody can book you. Open Profile
              and add some.
            </Text>
          </Card>
        )}

        <Card>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.balance}>{profile?.coin_balance ?? 0}</Text>
          <Text style={styles.label}>SkillCoins</Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={styles.label}>Completed</Text>
            <Text style={styles.stat}>{profile?.sessions_completed ?? 0}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={styles.label}>Waiting on you</Text>
            <Text style={styles.stat}>{pendingCount}</Text>
          </Card>
        </View>

        <Text style={styles.section}>Upcoming sessions</Text>
        {upcoming.length === 0 ? (
          <Card>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Nothing scheduled.</Text>
          </Card>
        ) : (
          upcoming.map((s) => (
            <Card key={s.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skill}>{s.skill}</Text>
                  <Text style={styles.label}>
                    {s.scheduled_time
                      ? new Date(s.scheduled_time).toLocaleString()
                      : "No time set"}
                  </Text>
                </View>
                <Text style={styles.coin}>{s.coin_amount} SC</Text>
              </View>
            </Card>
          ))
        )}

        <View style={{ marginTop: 12, gap: 10 }}>
          <Button title="Browse teachers" onPress={() => navigation.navigate("Browse")} />
          <Button title="Sign out" variant="ghost" onPress={signOut} />
        </View>
      </ScrollView>

      <TabBar navigation={navigation} active="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  hi: { color: colors.text, fontSize: 24, fontWeight: "800" },
  sub: { color: colors.dim, fontSize: 13, marginBottom: 16 },
  label: { color: colors.muted, fontSize: 13 },
  balance: { color: colors.coin, fontSize: 42, fontWeight: "800", marginVertical: 2 },
  stat: { color: colors.text, fontSize: 28, fontWeight: "700", marginTop: 4 },
  section: { color: colors.text, fontWeight: "700", fontSize: 16, marginTop: 12, marginBottom: 10 },
  skill: { color: colors.text, fontWeight: "600", fontSize: 15, textTransform: "capitalize" },
  coin: { color: colors.coin, fontWeight: "700" },
});
