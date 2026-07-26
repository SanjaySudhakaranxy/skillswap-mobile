import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { colors } from "../theme";
import Card from "../components/Card";
import TabBar from "../components/TabBar";
import { calculateWalletTotals, transactionLabel } from "../lib/appLogic";

const LABELS = {
  welcome: "Welcome bonus",
  escrow_hold: "Held in escrow",
  refund: "Refund",
  earning: "Teaching payout",
};

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [tx, setTx] = useState([]);
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
      .from("profiles").select("coin_balance").eq("id", user.id).single();
    setBalance(p?.coin_balance ?? 0);

    const { data: t } = await supabase
      .from("transactions").select("*").order("created_at", { ascending: false });
    setTx(t || []);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const earned = tx
    .filter((t) => t.type === "earning")
    .reduce((a, b) => a + b.amount, 0);
  const spent = tx
    .filter((t) => t.amount < 0)
    .reduce((a, b) => a + Math.abs(b.amount), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <Card>
          <Text style={styles.label}>Current balance</Text>
          <Text style={styles.balance}>{balance}</Text>
          <Text style={styles.label}>SkillCoins</Text>

          <View style={styles.split}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Earned teaching</Text>
              <Text style={{ color: colors.good, fontWeight: "700" }}>+{earned}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Spent learning</Text>
              <Text style={{ color: colors.bad, fontWeight: "700" }}>-{spent}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.section}>Transaction history</Text>

        {tx.length === 0 ? (
          <Card>
            <Text style={{ color: colors.muted, fontSize: 14 }}>No transactions yet.</Text>
          </Card>
        ) : (
          tx.map((t) => (
            <Card key={t.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.txTitle}>{transactionLabel(t.type)}</Text>
                  <Text style={styles.txMeta}>
                    {t.note ? t.note + " - " : ""}
                    {new Date(t.created_at).toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{
                    color: t.amount >= 0 ? colors.good : colors.bad,
                    fontWeight: "700",
                  }}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount} SC
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <TabBar navigation={navigation} active="Wallet" />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 13 },
  balance: { color: colors.coin, fontSize: 46, fontWeight: "800", marginVertical: 2 },
  split: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  section: { color: colors.text, fontWeight: "700", fontSize: 16, marginTop: 8, marginBottom: 10 },
  txTitle: { color: colors.text, fontWeight: "600", fontSize: 14 },
  txMeta: { color: colors.dim, fontSize: 12, marginTop: 3 },
});
