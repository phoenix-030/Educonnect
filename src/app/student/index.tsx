import { useAuth } from "@/context/AuthContext";
import {
  getMarkTotal,
  getStudentRecordByUserId,
  subscribeStudentData,
} from "@/services/studentService";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Clock,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import type { StudentRecord } from "@/types/student";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [record, setRecord] = useState<StudentRecord | null>(null);

  const loadRecord = useCallback(async () => {
    if (!user) {
      setRecord(null);
      return;
    }

    const data = await getStudentRecordByUserId(user.id);
    setRecord(data);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    void loadRecord();

    const unsubscribe = subscribeStudentData(() => {
      if (isMounted) {
        void loadRecord();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadRecord]);

  const attendancePercent = useMemo(() => {
    const attendance = record?.attendance ?? [];
    if (!attendance.length) return null;

    const present = attendance.filter(
      (item) => item.status?.toLowerCase() === "present",
    ).length;

    return Math.round((present / attendance.length) * 100);
  }, [record]);

  const currentGpa = useMemo(() => {
    if (!record?.marks?.length) return "8.5";
    const average =
      record.marks.reduce((sum, item) => {
        return sum + getMarkTotal(item);
      }, 0) / record.marks.length;
    return (average / 10).toFixed(1);
  }, [record]);

  const assignmentCount = useMemo(() => {
    return record?.assignments?.length ?? 0;
  }, [record]);

  const latestAssignment = useMemo(() => {
    return record?.assignments?.[0] ?? null;
  }, [record]);

  const latestFeePayment = useMemo(() => {
    return record?.feePayments?.[0] ?? null;
  }, [record]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name || "Student"}</Text>
          <Text style={styles.subtitle}>CSE - 3rd Year</Text>
        </View>

        {/* Four Box */}
        <View style={styles.grid}>
          <View style={[styles.card, styles.cardBlue]}>
            <Calendar color="#ffffff" size={24} style={styles.cardIcon} />
            <Text style={styles.cardValue}>
              {attendancePercent === null ? "--" : `${attendancePercent}%`}
            </Text>
            <Text style={styles.cardLabel}>Attendance</Text>
          </View>

          <View style={[styles.card, styles.cardPurple]}>
            <BookOpen color="#ffffff" size={24} style={styles.cardIcon} />
            <Text style={styles.cardValue}>{currentGpa}</Text>
            <Text style={styles.cardLabel}>CGPA</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.card,
              latestFeePayment ? styles.cardGreen : styles.cardRed,
            ]}
            onPress={() => router.push("/student/fees")}
          >
            {latestFeePayment ? (
              <CheckCircle color="#ffffff" size={24} style={styles.cardIcon} />
            ) : (
              <CreditCard color="#ffffff" size={24} style={styles.cardIcon} />
            )}
            <Text style={styles.cardValue}>
              {latestFeePayment ? "Paid" : "Due"}
            </Text>
            <Text style={styles.cardLabel}>Fee Status</Text>
          </TouchableOpacity>

          <View style={[styles.card, styles.cardOrange]}>
            <Clock color="#ffffff" size={24} style={styles.cardIcon} />
            <Text style={styles.cardValue}>{assignmentCount}</Text>
            <Text style={styles.cardLabel}>Assignments</Text>
          </View>
        </View>

        {/* daily time table  */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{"Today's Schedule"}</Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push("/student/timetable")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight color="#2563eb" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.timeText}>09:00 AM</Text>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Data Structures</Text>
              <Text style={styles.scheduleSubtitle}>Dr. Smith • CS-101</Text>
            </View>
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.timeText}>11:00 AM</Text>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Web Development</Text>
              <Text style={styles.scheduleSubtitle}>
                Prof. Johnson • CS-203
              </Text>
            </View>
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.timeText}>02:00 PM</Text>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Database Systems</Text>
              <Text style={styles.scheduleSubtitle}>Dr. Williams • CS-105</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Bell color="#ea580c" size={20} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
          </View>

          {latestAssignment ? (
            <View style={styles.notificationCard}>
              <AlertCircle color="#2563eb" size={20} />
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>
                  {latestAssignment.title}
                </Text>
                <Text style={styles.notificationSubtitle}>
                  {latestAssignment.subject} • Due {latestAssignment.dueDate}
                </Text>
              </View>
              <Text style={styles.notificationTime}>New</Text>
            </View>
          ) : (
            <View style={styles.notificationCard}>
              <AlertCircle color="#2563eb" size={20} />
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>No new assignments</Text>
                <Text style={styles.notificationSubtitle}>
                  Your instructor will post assignments here.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", 
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: "47%", 
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBlue: { backgroundColor: "#2563eb" },
  cardPurple: { backgroundColor: "#9333ea" },
  cardGreen: { backgroundColor: "#16a34a" },
  cardRed: { backgroundColor: "#dc2626" },
  cardOrange: { backgroundColor: "#ea580c" },
  cardIcon: {
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  section: {
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
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  timeText: {
    width: 80,
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  scheduleInfo: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
    paddingLeft: 16,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
