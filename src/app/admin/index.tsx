import { getUsers } from "@/services/authStorage";
import {
  getStudentFeePaymentTotal,
  getStudentRecordByUserId,
} from "@/services/studentService";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bell,DollarSign,FileText,GraduationCap,TrendingUp,UserCog,Users,}from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminBarChart, AdminLineChart } from "@/components/AdminCharts";

function formatRevenueAmount(amount: number): string {
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }

  return `Rs. ${amount}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [revenueValue, setRevenueValue] = useState("Rs. 0");
  const [attendanceRate, setAttendanceRate] = useState("0%");

  const refreshDashboardData = useCallback(async () => {
    const users = await getUsers();
    const students = users.filter((user) => user.role === "student");
    const staff = users.filter((user) => user.role === "staff");

    setStudentCount(students.length);
    setStaffCount(staff.length);

    const studentRecords = await Promise.all(
      students.map(async (student) => {
        return getStudentRecordByUserId(student.id);
      }),
    );

    const paidRevenue = studentRecords.reduce((sum, record) => {
      return sum + getStudentFeePaymentTotal(record);
    }, 0);
    setRevenueValue(formatRevenueAmount(paidRevenue));

    let totalAttendance = 0;
    let totalPresent = 0;

    for (const record of studentRecords) {
      const attendanceRecords = record.attendance ?? [];

      totalAttendance += attendanceRecords.length;
      totalPresent += attendanceRecords.filter(
        (item) => item.status === "present",
      ).length;
    }

    const averageAttendance =
      totalAttendance > 0
        ? Math.round((totalPresent / totalAttendance) * 100)
        : 0;

    setAttendanceRate(`${averageAttendance}%`);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshDashboardData();

      const interval = setInterval(() => {
        void refreshDashboardData();
      }, 10000);

      return () => clearInterval(interval);
    }, [refreshDashboardData]),
  );

  const stats = [
    {
      label: "Total Students",
      value: `${studentCount}`,
      change: "Live",
      colors: ["#2563eb", "#3b82f6"] as [string, string],
      icon: Users,
    },
    {
      label: "Total Staff",
      value: `${staffCount}`,
      change: "Live",
      colors: ["#7c3aed", "#a855f7"] as [string, string],
      icon: Users,
    },
    {
      label: "Fee Revenue",
      value: revenueValue,
      change: "Live",
      colors: ["#16a34a", "#22c55e"] as [string, string],
      icon: DollarSign,
    },
    {
      label: "Avg Attendance",
      value: attendanceRate,
      change: "Live",
      colors: ["#ea580c", "#f97316"] as [string, string],
      icon: TrendingUp,
    },
  ];

  const deptData = [
    { name: "CSE", value: 850 },
    { name: "ECE", value: 640 },
    { name: "MECH", value: 470 },
    { name: "CIVIL", value: 290 },
    { name: "EEE", value: 200 },
  ];

  const revenueData = [25, 30, 38, 32, 45];

  const notices = [
    { title: "Semester Exam Schedule Released", date: "May 15, 2026" },
    { title: "Holiday Notice - May 20", date: "May 10, 2026" },
    { title: "Faculty Meeting Scheduled", date: "May 8, 2026" },
  ];


  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Admin Dashboard</Text>
          <Text style={styles.headerTitle}>EduConnect College</Text>
          <Text style={styles.headerSubtitle}>Management Overview</Text>
        </View>

        {/* Stats Grid */}
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
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{item.change}</Text>
                </View>
              </LinearGradient>
            );
          })}
        </View>

        {/*STUDENTS */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Students by Department</Text>
          <AdminBarChart deptData={deptData} />
        </View>

        {/* FEES*/}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Revenue Trend (Lakhs)</Text>
          <AdminLineChart revenueData={revenueData} />
        </View>

        {/* Recent Notices */}
        <View style={styles.sectionCard}>
          <View style={styles.noticeHeader}>
            <Bell color="#ea580c" size={20} />
            <Text style={styles.sectionTitle}> Recent Notices</Text>
          </View>
          {notices.map((n, i) => (
            <View key={i} style={styles.noticeItem}>
              <FileText color="#6366f1" size={18} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.noticeTitle}>{n.title}</Text>
                <Text style={styles.noticeDate}>{n.date}</Text>
              </View>
            </View>
          ))}
          <LinearGradient
            colors={["#6366f1", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.manageNoticesBtn}
          >
            <Text style={styles.manageNoticesText}>Manage Notices</Text>
          </LinearGradient>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/admin/manage-students")}
          >
            <GraduationCap
              color="#6366f1"
              size={28}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.quickActionText}>Manage Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/admin/manage-staff")}
          >
            <UserCog color="#a855f7" size={28} style={{ marginBottom: 8 }} />
            <Text style={styles.quickActionText}>Manage Staff</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "#6b7280" },
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
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 10 },
  statBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  chartCard: {
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
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  axisText: { fontSize: 10, color: "#64748b" },
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
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  noticeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  noticeDate: { fontSize: 12, color: "#64748b" },
  manageNoticesBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  manageNoticesText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
  quickActions: { flexDirection: "row", gap: 14, marginBottom: 0 },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
