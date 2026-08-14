import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GraduationCap, LogOut } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student Dashboard",
  staff: "Staff Dashboard",
  admin: "Admin Dashboard",
};

type RoleDashboardProps = {
  role: UserRole;
};

export function RoleDashboard({ role }: RoleDashboardProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2563eb", "#9333ea", "#4338ca"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <GraduationCap size={48} color="#2563eb" strokeWidth={1.5} />
        </View>

        <Text style={styles.badge}>{role.toUpperCase()}</Text>
        <Text style={styles.title}>{ROLE_LABELS[role]}</Text>
        <Text style={styles.welcome}>Welcome, {user.name}</Text>
        <Text style={styles.meta}>ID: {user.loginId}</Text>
        <Text style={styles.meta}>Email: {user.email}</Text>

        <Text style={styles.hint}>
          You are signed in as {role}. ERP modules can be added here next.
        </Text>

        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  welcome: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  meta: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
