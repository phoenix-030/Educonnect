import { LinearGradient } from "expo-linear-gradient";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useAuth } from "@/context/AuthContext";
import {
  getStudentRecordByUserId,
  subscribeStudentData,
} from "@/services/studentService";
import type { AttendanceRecord, StudentRecord } from "@/types/student";

type AttendanceSummary = {
  percentage: number;
  presentCount: number;
  absentCount: number;
  total: number;
};

function CircularProgress({
  percentage,
  size = 80,
  isOverall = false,
}: {
  percentage: number;
  size?: number;
  isOverall?: boolean;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let strokeColor = "#22c55e";
  if (percentage < 75 && percentage >= 65) strokeColor = "#f97316";
  if (percentage < 65) strokeColor = "#ef4444";

  if (isOverall) {
    strokeColor = "#22c55e";
  }

  return (
    <View
      style={{ width: size, height: size, transform: [{ rotate: "-90deg" }] }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOverall ? "rgba(255,255,255,0.2)" : "#e5e7eb"}
          strokeWidth="8"
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function getAttendanceSummary(records: AttendanceRecord[]): AttendanceSummary {
  const total = records.length;
  const presentCount = records.filter(
    (record) => record.status === "present",
  ).length;
  const absentCount = total - presentCount;

  return {
    total,
    presentCount,
    absentCount,
    percentage: total ? Math.round((presentCount / total) * 100) : 0,
  };
}

function formatDate(value: string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecord = useCallback(async () => {
    if (!user) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const data = await getStudentRecordByUserId(user.id);
    setRecord(data);
    setIsLoading(false);
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

  const attendanceRecords = record?.attendance ?? [];

  const summary = useMemo(
    () => getAttendanceSummary(record?.attendance ?? []),
    [record?.attendance],
  );
  const latestAttendance = attendanceRecords.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Calendar color="#111827" size={28} />
            <Text style={styles.title}>Attendance</Text>
          </View>
          <Text style={styles.subtitle}>
            Live attendance updates from your staff
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={["#2563eb", "#9333ea"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.overallCard}
            >
              <View style={styles.overallContent}>
                <View>
                  <Text style={styles.overallLabel}>Overall Attendance</Text>
                  <Text style={styles.overallValue}>{summary.percentage}%</Text>
                  <View style={styles.statusRow}>
                    {summary.percentage >= 75 ? (
                      <>
                        <TrendingUp color="#ffffff" size={16} />
                        <Text style={styles.statusText}>Good Standing</Text>
                      </>
                    ) : (
                      <>
                        <TrendingDown color="#ffffff" size={16} />
                        <Text style={styles.statusText}>Needs Improvement</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.overallProgressContainer}>
                  <CircularProgress
                    percentage={summary.percentage}
                    size={90}
                    isOverall
                  />
                  <View style={styles.overallProgressTextContainer}>
                    <Text style={styles.overallProgressText}>
                      {summary.percentage}%
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.summaryCard}>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Present</Text>
                <Text style={styles.summaryValue}>{summary.presentCount}</Text>
              </View>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Absent</Text>
                <Text style={styles.summaryValue}>{summary.absentCount}</Text>
              </View>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{summary.total}</Text>
              </View>
            </View>

            <View style={styles.recordsSection}>
              <Text style={styles.sectionTitle}>Recent Records</Text>
              {latestAttendance.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No attendance records yet.
                  </Text>
                </View>
              ) : (
                latestAttendance.map((entry) => (
                  <View key={entry.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordSubject}>{entry.subject}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          entry.status === "present"
                            ? styles.statusPresent
                            : styles.statusAbsent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            entry.status === "present"
                              ? styles.statusPresentText
                              : styles.statusAbsentText,
                          ]}
                        >
                          {entry.status === "present" ? "Present" : "Absent"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recordMeta}>
                      Date: {formatDate(entry.date)}
                    </Text>
                    <Text style={styles.recordMeta}>
                      Staff Signature: {entry.markedBy}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
  },
  overallCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overallContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overallLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  overallProgressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  overallProgressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  overallProgressText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    transform: [{ rotate: "90deg" }],
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  summaryColumn: {
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  recordsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  recordCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordSubject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPresent: {
    backgroundColor: "#dcfce7",
  },
  statusAbsent: {
    backgroundColor: "#fee2e2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusPresentText: {
    color: "#166534",
  },
  statusAbsentText: {
    color: "#991b1b",
  },
  recordMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
});
