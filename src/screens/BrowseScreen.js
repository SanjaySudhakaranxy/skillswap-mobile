import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import Chip from "../components/Chip";
import Field from "../components/Field";
import TabBar from "../components/TabBar";
import { filterTeachers } from "../lib/appLogic";

export default function BrowseScreen({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("profiles").select("*").neq("id", user.id)
      .order("sessions_completed", { ascending: false });

    setTeachers((data || []).filter((p) => (p.teach_skills || []).length > 0));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.teach_skills || []).some((s) => s.includes(q))
    );
  }, [query, teachers]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or skill"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              {loading
                ? "Loading..."
                : "No teachers found. Another account needs to add teach skills."}
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Teacher", { teacherId: item.id })}
          >
            <Card>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.sessions_completed} sessions completed
                  </Text>
                </View>
                <Text style={styles.coin}>{item.cost_per_session} SC</Text>
              </View>

              {item.bio ? (
                <Text numberOfLines={2} style={styles.bio}>
                  {item.bio}
                </Text>
              ) : null}

              <View style={styles.chips}>
                {(item.teach_skills || []).map((s) => (
                  <Chip key={s} label={s} />
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      <TabBar navigation={navigation} active="Browse" />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontWeight: "700", fontSize: 16 },
  meta: { color: colors.dim, fontSize: 12, marginTop: 2 },
  coin: { color: colors.coin, fontWeight: "700", fontSize: 15 },
  bio: { color: colors.muted, fontSize: 13, marginTop: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
});
