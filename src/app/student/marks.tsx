import { useAuth } from "@/context/AuthContext";
import {
    getMarkGrade,
    getMarkTotal,
    getStudentRecordByUserId,
} from "@/services/studentService";
import { useFocusEffect } from "expo-router";
import { Award, BookOpen, TrendingUp } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MarkRecord, StudentRecord } from "@/types/student";

export default function MarksScreen() {
  const { user } = useAuth();
  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecord = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await getStudentRecordByUserId(user.id);
    setRecord(data);
    setIsLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadRecord();

      const interval = setInterval(() => {
        void loadRecord();
      }, 10000);

      return () => clearInterval(interval);
    }, [loadRecord]),
  );

  const subjectMarks = useMemo(() => {
    if (!record?.marks?.length) return [];

    const latestBySubject = new Map<string, MarkRecord>();

    for (const mark of record.marks) {
      const current = latestBySubject.get(mark.subject);
      if (!current || mark.createdAt >= current.createdAt) {
        latestBySubject.set(mark.subject, mark);
      }
    }

    return Array.from(latestBySubject.values())
      .map((mark) => ({
        name: mark.subject,
        credits: 4,
        internals: mark.internalMarks ?? 0,
        externals: mark.externalMarks ?? 0,
        total: Math.min(100, getMarkTotal(mark)),
        totalMax: 100,
        grade: getMarkGrade(mark),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [record]);

  const summary = useMemo(() => {
    if (!subjectMarks.length) {
      return {
        gpa: "0.0",
        topGrade: "-",
        credits: 0,
      };
    }

    const averageTotal =
      subjectMarks.reduce((sum, subject) => sum + subject.total, 0) /
      subjectMarks.length;

    const topGrade = subjectMarks.reduce((best, subject) => {
      const rank = ["F", "D", "C", "B", "A", "A+"].indexOf(subject.grade);
      const bestRank = ["F", "D", "C", "B", "A", "A+"].indexOf(best);
      return rank > bestRank ? subject.grade : best;
    }, subjectMarks[0]?.grade ?? "F");

    return {
      gpa: (averageTotal / 10).toFixed(1),
      topGrade,
      credits: subjectMarks.length * 4,
    };
  }, [subjectMarks]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <BookOpen color="#111827" size={28} />
            <Text style={styles.title}>Marks</Text>
          </View>
          <Text style={styles.subtitle}>Live academic performance</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Refreshing marks...</Text>
          </View>
        ) : null}

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryPurple]}>
            <Award color="#ffffff" size={20} style={styles.cardIcon} />
            <Text style={styles.cardValue}>{summary.gpa}</Text>
            <Text style={styles.cardLabel}>Current GPA</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryGreen]}>
            <TrendingUp color="#ffffff" size={20} style={styles.cardIcon} />
            <Text style={styles.cardValue}>{summary.topGrade}</Text>
            <Text style={styles.cardLabel}>Top Grade</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryOrange]}>
            <BookOpen color="#ffffff" size={20} style={styles.cardIcon} />
            <Text style={styles.cardValue}>{summary.credits}</Text>
            <Text style={styles.cardLabel}>Credits</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
          Current Semester
        </Text>

        {subjectMarks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No marks uploaded yet</Text>
            <Text style={styles.emptyText}>
              Staff uploads will appear here automatically when they are saved.
            </Text>
          </View>
        ) : (
          subjectMarks.map((subject, idx) => (
            <View key={`${subject.name}-${idx}`} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <View>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectCredits}>
                    Credits: {subject.credits}
                  </Text>
                </View>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{subject.grade}</Text>
                </View>
              </View>

              <View style={styles.marksGrid}>
                <View style={[styles.marksBox, styles.marksBoxBlue]}>
                  <Text style={styles.marksLabel}>Internals</Text>
                  <Text style={styles.marksValueBlue}>{subject.internals}</Text>
                </View>
                <View style={[styles.marksBox, styles.marksBoxPurple]}>
                  <Text style={styles.marksLabel}>Externals</Text>
                  <Text style={styles.marksValuePurple}>
                    {subject.externals}
                  </Text>
                </View>
                <View style={[styles.marksBox, styles.marksBoxGreen]}>
                  <Text style={styles.marksLabel}>Total</Text>
                  <Text style={styles.marksValueGreen}>
                    {subject.total}/100
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(subject.total / subject.totalMax) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))
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
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#334155",
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryPurple: { backgroundColor: "#7e22ce" },
  summaryGreen: { backgroundColor: "#16a34a" },
  summaryOrange: { backgroundColor: "#ea580c" },
  cardIcon: {
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  subjectCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subjectCredits: {
    fontSize: 13,
    color: "#6b7280",
  },
  gradeBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  marksGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  marksBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  marksBoxBlue: { backgroundColor: "#eff6ff" },
  marksBoxPurple: { backgroundColor: "#faf5ff" },
  marksBoxGreen: { backgroundColor: "#f0fdf4" },
  marksLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  marksValueBlue: { fontSize: 16, fontWeight: "600", color: "#1d4ed8" },
  marksValuePurple: { fontSize: 16, fontWeight: "600", color: "#7e22ce" },
  marksValueGreen: { fontSize: 16, fontWeight: "600", color: "#15803d" },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 3,
  },
});
