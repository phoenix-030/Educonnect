import { CalendarCheck, CheckCircle2, Download } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { downloadAttendanceWorkbook } from "@/services/attendanceExportService";
import {
  addAttendanceRecord,
  getAllStudentUsers,
} from "@/services/studentService";

type StudentAttendanceOption = {
  id: string;
  name: string;
  loginId: string;
  present: boolean;
};

export default function MarkAttendanceScreen() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentAttendanceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        const studentUsers = await getAllStudentUsers();
        if (!isMounted) {
          return;
        }

        setStudents(
          studentUsers.map((student) => ({
            id: student.id,
            name: student.name,
            loginId: student.loginId,
            present: false,
          })),
        );
      } catch {
        if (!isMounted) {
          return;
        }

        Alert.alert("Failed to load students", "Please try again.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAttendance = (index: number) => {
    setStudents((prev) =>
      prev.map((student, i) =>
        i === index ? { ...student, present: !student.present } : student,
      ),
    );
  };

  const className =
    user?.yearSection?.trim() || user?.department?.trim() || "General";
  const subjectName = user?.subject?.trim() || "Attendance";

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);
  const applyDateRange = (from: Date, to: Date) => {
    setDateFrom(formatDate(from));
    setDateTo(formatDate(to));
  };

  const setTodayRange = () => {
    const today = new Date();
    applyDateRange(today, today);
  };

  const setLast7DaysRange = () => {
    const today = new Date();
    const last7 = new Date(today);
    last7.setDate(today.getDate() - 6);
    applyDateRange(last7, today);
  };

  const setThisMonthRange = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    applyDateRange(firstOfMonth, today);
  };

  const setThisYearRange = () => {
    const today = new Date();
    const firstOfYear = new Date(today.getFullYear(), 0, 1);
    applyDateRange(firstOfYear, today);
  };
  // sign

  const handleSave = async () => {
    const trimmedSignature = signatureName.trim();

    if (!trimmedSignature) {
      Alert.alert(
        "Signature required",
        "Please type your name before submitting.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour12: false });

      await Promise.all(
        students.map((student) =>
          addAttendanceRecord(student.id, {
            date: today,
            time,
            subject: subjectName,
            className,
            studentId: student.loginId,
            studentName: student.name,
            status: student.present ? "present" : "absent",
            markedBy: trimmedSignature,
          }),
        ),
      );

      setStudents((prev) =>
        prev.map((student) => ({ ...student, present: false })),
      );
      setSignatureName("");
      Alert.alert("Attendance Saved", "Student attendance has been updated.");
    } catch {
      Alert.alert("Save failed", "Unable to save attendance right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      await downloadAttendanceWorkbook({
        dateFrom: dateFrom.trim() || undefined,
        dateTo: dateTo.trim() || undefined,
      });

      Alert.alert(
        "Download successfully",
        "The filtered Excel file has been generated.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate the Excel file.";

      Alert.alert("Download failed", message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <CalendarCheck color="#111827" size={28} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Mark Attendance</Text>
            <Text style={styles.subtitle}>
              Record student presence by name and ID
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : (
          students.map((student, index) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentLogin}>ID: {student.loginId}</Text>
                <Text style={styles.studentStatus}>
                  {student.present ? "Present" : "Absent"}
                </Text>
              </View>

              {/* present absent toggle */}
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: student.present ? "#dcfce7" : "#fee2e2",
                  },
                ]}
                onPress={() => toggleAttendance(index)}
              >

                <CheckCircle2
                  color={student.present ? "#16a34a" : "#ef4444"}
                  size={18}
                />
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: student.present ? "#166534" : "#991b1b",
                    },
                  ]}
                >
                  {student.present ? "Present" : "Absent"}
                </Text>
              </TouchableOpacity>
            </View>




          ))
        )}
{/* sign */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Staff Signature</Text>
          <Text style={styles.helperText}>
            Type your name and submit to save the attendance signature.
          </Text>
          <TextInput
            style={styles.signatureInput}
            value={signatureName}
            onChangeText={setSignatureName}
            placeholder="Enter your name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Submit Attendance</Text>
          )}
        </TouchableOpacity>



{/* download excel */}



        <View style={styles.exportCard}>
          <Text style={styles.sectionTitle}>Download Excel</Text>
          <Text style={styles.helperText}>
            Filter by date range before downloading.
          </Text>

          <View style={styles.rangeOptionsContainer}>
            <TouchableOpacity
              style={styles.rangeOption}
              onPress={setTodayRange}
            >
              <Text style={styles.rangeOptionText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rangeOption}
              onPress={setLast7DaysRange}
            >
              <Text style={styles.rangeOptionText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rangeOption}
              onPress={setThisMonthRange}
            >
              <Text style={styles.rangeOptionText}>This Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rangeOption}
              onPress={setThisYearRange}
            >
              <Text style={styles.rangeOptionText}>This Year</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.filterInput}
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="From (YYYY-MM-DD)"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.filterInput}
            value={dateTo}
            onChangeText={setDateTo}
            placeholder="To (YYYY-MM-DD)"
            placeholderTextColor="#94a3b8"
          />

          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloading && styles.saveButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.downloadButtonContent}>
                <Download color="#ffffff" size={18} />
                <Text style={styles.downloadButtonText}>Download Excel</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  headerText: { flex: 1 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: { color: "#64748b", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  helperText: { fontSize: 13, color: "#64748b", marginTop: 6 },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentInfo: { flex: 1, marginRight: 16 },
  studentName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  studentLogin: { fontSize: 13, color: "#64748b", marginTop: 4 },
  studentStatus: { fontSize: 12, color: "#64748b", marginTop: 4 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: { fontSize: 12, fontWeight: "600", color: "#4338ca" },
  rangeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    marginBottom: 16,
  },
  rangeOption: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  rangeOptionText: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  signatureSection: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  signatureInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  exportCard: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  filterInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  downloadButton: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  downloadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
