import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { removeUser } from "@/services/authService";
import { getUsers } from "@/services/authStorage";
import type { StoredUser } from "@/types/auth";

export default function ManageStaffScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StoredUser[]>([]);

  const loadStaff = useCallback(async () => {
    const allUsers = await getUsers();
    setStaff(allUsers.filter((entry) => entry.role === "staff"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStaff();
    }, [loadStaff]),
  );

  const handleDelete = (member: StoredUser) => {
    if (member.id === user?.id) {
      Alert.alert("Notice", "You cannot remove your own admin account here.");
      return;
    }

    Alert.alert(
      "Remove staff",
      `Delete ${member.name} (${member.email}) from the system?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeUser(member.id);
              await loadStaff();
              Alert.alert("Removed", "Staff account deleted successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to remove staff account.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Staff</Text>
        </View>

        <Text style={styles.subtitle}>
          Review and remove staff accounts in real time.
        </Text>

        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            staff.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No staff accounts found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>Email: {item.email}</Text>
                <Text style={styles.meta}>
                  Subject: {item.subject || "Not set"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backButton: { marginRight: 12 },
  backText: { color: "#2563eb", fontWeight: "700", fontSize: 15 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  list: { paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTextWrap: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  meta: { fontSize: 12, color: "#4b5563", marginBottom: 2 },
  deleteButton: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  deleteButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  emptyText: { color: "#6b7280", fontSize: 14 },
});
