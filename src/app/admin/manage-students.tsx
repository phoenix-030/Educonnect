import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

export default function ManageStudentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [students, setStudents] = useState<StoredUser[]>([]);

  const loadStudents = useCallback(async () => {
    const allUsers = await getUsers();
    setStudents(allUsers.filter((entry) => entry.role === "student"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStudents();
    }, [loadStudents]),
  );

  const handleDelete = (student: StoredUser) => {
    if (student.id === user?.id) {
      Alert.alert("Notice", "You cannot remove your own admin account here.");
      return;
    }

    Alert.alert(
      "Remove student",
      `Delete ${student.name} (${student.loginId}) from the system?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeUser(student.id);
              await loadStudents();
              Alert.alert("Removed", "Student account deleted successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to remove student account.",
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
            <Text style={styles.backText}> Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Students</Text>
        </View>

        <Text style={styles.subtitle}>
          Review and remove student accounts in real time.
        </Text>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            students.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No student accounts found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.student_D}>Student ID: {item.loginId}</Text>
                <Text style={styles.student_D}>Email: {item.email}</Text>
                {item.department ? (
                  <Text style={styles.student_D}>
                    Department: {item.department}
                  </Text>
                ) : null}
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

  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },

  backText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 15,
  },

  title: {
    fontSize: 22,

    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
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
  cardTextWrap: {
    flex: 1,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  student_D: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
  },
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
