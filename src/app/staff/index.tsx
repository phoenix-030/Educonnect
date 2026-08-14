import { useAuth } from "@/context/AuthContext";
import { getCurrentDayName, WEEKLY_SCHEDULE } from "@/lib/timetable";
import { getUsers } from "@/services/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
    BarChart3,
    Calendar,
    ClipboardList,
    FileText,
    MapPin,
    Upload,
    UserCheck,
    Users,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [studentList, setStudentList] = useState<
    { name: string; loginId: string }[]
  >([]);

  const selectedSubject =
    user?.role === "staff" ? user.subject?.trim().toLowerCase() : undefined;

  const refreshStudents = useCallback(async () => {
    const users = await getUsers();
    setStudentList(
      users
        .filter((storedUser) => storedUser.role === "student")
        .map((storedUser) => ({
          name: storedUser.name,
          loginId: storedUser.loginId,
        })),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStudents();

      const interval = setInterval(() => {
        void refreshStudents();
      }, 10000);

      return () => clearInterval(interval);
    }, [refreshStudents]),
  );

  const assignmentList = [
    { title: "Data Structures Homework" },
    { title: "Web Dev Project" },
    { title: "Database Systems Quiz" },
  ];

  const todayName = getCurrentDayName();
  const classes = WEEKLY_SCHEDULE[todayName];

  const stats = [
    {
      label: "Registered Students",
      value: `${studentList.length}`,
      colors: ["#2563eb", "#3b82f6"] as [string, string],
      icon: Users,
    },
    {
      label: "Classes Today",
      value: `${classes.length}`,
      colors: ["#7c3aed", "#a855f7"] as [string, string],
      icon: Calendar,
    },
    {
      label: "Assignments",
      value: `${assignmentList.length}`,
      colors: ["#16a34a", "#22c55e"] as [string, string],
      icon: FileText,
    },
    {
      label: "Live Students",
      value: `${studentList.length}`,
      colors: ["#ea580c", "#f97316"] as [string, string],
      icon: BarChart3,
    },
  ];

  const quickActions = [
    {
      label: "Mark Attendance",
      icon: UserCheck,
      color: "#2563eb",
      route: "/staff/mark-attendance",
    },
    {
      label: "Upload Marks",
      icon: Upload,
      color: "#16a34a",
      route: "/staff/upload-marks",
    },
    {
      label: "Assignments",
      icon: ClipboardList,
      color: "#f97316",
      route: "/staff/assignments",
    },
  ] as const;

  const activities = [
    {
      text: "Uploaded marks for Data Structures",
      time: "2 hours ago",
      color: "#3b82f6",
    },
    {
      text: "Marked attendance for Web Development",
      time: "4 hours ago",
      color: "#22c55e",
    },
    {
      text: "Created assignment for Database Systems",
      time: "1 day ago",
      color: "#f97316",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || "Staff Member"}</Text>
          <Text style={styles.dept}>Computer Science Department</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item, i) => {
            const Icon = item.icon;
            return (
              <LinearGradient
                key={i}
                colors={item.colors}
                style={styles.statCard}
              >
                <Icon color="#ffffff" size={24} style={{ marginBottom: 12 }} />
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </LinearGradient>
            );
          })}
        </View>

        <View style={styles.actionsRow}>
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={i}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
              >
                <Icon
                  color={action.color}
                  size={28}
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View></View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {"Today's Classes — "}
            {todayName}
          </Text>
          {classes.length === 0 ? (
            <Text style={styles.emptyText}>
              No classes scheduled for today.
            </Text>
          ) : (
            classes.map((cls, i) => {
              const isSelectedSubject =
                selectedSubject !== undefined &&
                cls.subject.toLowerCase() === selectedSubject;

              return (
                <View
                  key={i}
                  style={[
                    styles.classItem,
                    isSelectedSubject && styles.classItemHighlighted,
                  ]}
                >
                  <View style={styles.classInfo}>
                    <Text
                      style={[
                        styles.className,
                        isSelectedSubject && styles.classNameHighlighted,
                      ]}
                    >
                      {cls.subject}
                    </Text>
                    <Text style={styles.classSection}>{cls.section}</Text>
                    <View style={styles.classMetaRow}>
                      <Users color="#64748b" size={14} />
                      <Text style={styles.classMeta}>
                        {cls.students} students
                      </Text>
                    </View>
                  </View>
                  <View style={styles.classRight}>
                    <Text
                      style={[
                        styles.classTime,
                        isSelectedSubject && styles.classTimeHighlighted,
                      ]}
                    >
                      {cls.time}
                    </Text>
                    <View style={styles.classRoomRow}>
                      <MapPin
                        color={isSelectedSubject ? "#166534" : "#64748b"}
                        size={12}
                      />
                      <Text style={styles.classMeta}>{cls.room}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.sectionCard, { marginBottom: 0 }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.map((act, i) => (
            <View key={i} style={styles.activityItem}>
              <View
                style={[styles.activityDot, { backgroundColor: act.color }]}
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{act.text}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, color: "#4b5563", fontWeight: "500" },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    marginBottom: 4,
  },
  dept: { fontSize: 14, color: "#6b7280" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  classItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  classItemHighlighted: {
    backgroundColor: "#ecfdf3",
    borderColor: "#86efac",
  },
  classInfo: { flex: 1 },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  classNameHighlighted: {
    color: "#166534",
  },
  classSection: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  classMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  classMeta: { fontSize: 12, color: "#64748b" },
  classRight: { alignItems: "flex-end" },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 20,
  },
  classTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 8,
  },
  classTimeHighlighted: {
    color: "#166534",
  },
  classRoomRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  activityInfo: { flex: 1 },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  activityTime: { fontSize: 12, color: "#64748b" },
});
