import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import Chip from "../components/Chip";
import Field from "../components/Field";
import Button from "../components/Button";
import TabBar from "../components/TabBar";

function SkillEditor({ label, value, onChange, placeholder, max = 5 }) {
  const [text, setText] = useState("");

  function add() {
    const skill = text.trim().toLowerCase();
    if (!skill || value.length >= max || value.includes(skill)) {
      setText("");
      return;
    }
    onChange([...value, skill]);
    setText("");
  }

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>
        {label} ({value.length}/{max})
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            autoCapitalize="none"
            onSubmitEditing={add}
            editable={value.length < max}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={add}
          disabled={value.length >= max}
          style={[styles.addBtn, value.length >= max && { opacity: 0.4 }]}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {value.map((s) => (
          <Chip key={s} label={s} onRemove={() => onChange(value.filter((x) => x !== s))} />
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [cost, setCost] = useState("20");
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (error) setError(error.message);
      if (data) {
        setName(data.name || "");
        setBio(data.bio || "");
        setCost(String(data.cost_per_session));
        setTeach(data.teach_skills || []);
        setLearn(data.learn_skills || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setError("");
    setMessage("");
    if (!name.trim()) return setError("Name cannot be empty.");

    const costNum = parseInt(cost, 10);
    if (isNaN(costNum) || costNum < 0 || costNum > 500)
      return setError("Cost per session must be a number between 0 and 500.");

    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        bio: bio.trim(),
        cost_per_session: costNum,
        teach_skills: teach,
        learn_skills: learn,
      })
      .eq("id", auth.user.id);
    setSaving(false);

    if (error) return setError(error.message);
    setMessage("Profile saved.");
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Field label="Name" value={name} onChangeText={setName} />

          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Who you are and how you teach."
            multiline
            style={{ height: 90, textAlignVertical: "top" }}
          />

          <Field
            label="Cost per session (SkillCoins)"
            value={cost}
            onChangeText={setCost}
            keyboardType="number-pad"
          />

          <SkillEditor
            label="Skills I can teach"
            value={teach}
            onChange={setTeach}
            placeholder="e.g. react, guitar, sql"
          />

          <SkillEditor
            label="Skills I want to learn"
            value={learn}
            onChange={setLearn}
            placeholder="e.g. figma, spanish"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.ok}>{message}</Text> : null}

          <Button title="Save profile" onPress={save} loading={saving} />
        </Card>
      </ScrollView>

      <TabBar navigation={navigation} active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    height: 45,
  },
  error: { color: colors.bad, fontSize: 13, marginBottom: 10 },
  ok: { color: colors.good, fontSize: 13, marginBottom: 10 },
});
