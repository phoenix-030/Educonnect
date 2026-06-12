import { useAuth } from "@/context/AuthContext";
import {
  addFeePaymentRecord,
  calculateFeePayment,
  EXAM_FEE_PER_PAPER,
  getStudentRecordByUserId,
  REVALUATION_REQUEST_FEE,
  subscribeStudentData,
} from "@/services/studentService";
import type { FeePaymentRecord, StudentRecord } from "@/types/student";
import {
  CheckCircle,
  CreditCard,
  FileText,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatAmount(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function formatPaymentDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PaymentHistoryItem({ payment }: { payment: FeePaymentRecord }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Receipt color="#2563eb" size={18} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>
          {payment.revaluationRequested
            ? "Exam fee + revaluation"
            : "Exam fee"}
        </Text>
        <Text style={styles.historyMeta}>
          {formatPaymentDate(payment.createdAt)} - {payment.examPaperCount}{" "}
          papers
        </Text>
        <Text selectable style={styles.referenceText}>
          Ref: {payment.referenceNumber}
        </Text>
      </View>
      <View style={styles.historyAmountWrap}>
        <Text style={styles.historyAmount}>
          {formatAmount(payment.totalAmount)}
        </Text>
        <Text style={styles.paidLabel}>Paid</Text>
      </View>
    </View>
  );
}

export default function StudentFeesScreen() {
  const { user } = useAuth();
  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paperCount, setPaperCount] = useState(5);
  const [revaluationRequested, setRevaluationRequested] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [didApplySubjectDefault, setDidApplySubjectDefault] = useState(false);

  const loadRecord = useCallback(async () => {
    if (!user) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    const data = await getStudentRecordByUserId(user.id);
    setRecord(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      await loadRecord();
    };

    void refresh();

    const unsubscribe = subscribeStudentData(() => {
      if (isMounted) {
        void refresh();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadRecord]);

  const subjectNames = useMemo(() => {
    const names = new Set<string>();

    for (const mark of record?.marks ?? []) {
      if (mark.subject?.trim()) {
        names.add(mark.subject.trim());
      }
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [record]);

  useEffect(() => {
    if (didApplySubjectDefault || subjectNames.length === 0) {
      return;
    }

    setPaperCount(subjectNames.length);
    setSelectedSubject(subjectNames[0]);
    setDidApplySubjectDefault(true);
  }, [didApplySubjectDefault, subjectNames]);

  const calculation = useMemo(
    () =>
      calculateFeePayment({
        examPaperCount: paperCount,
        revaluationRequested,
      }),
    [paperCount, revaluationRequested],
  );

  const payments = record?.feePayments ?? [];
  const latestPayment = payments[0] ?? null;
  const canPay = calculation.totalAmount > 0 && !isSubmitting;

  const handlePaperCountChange = useCallback((nextCount: number) => {
    setPaperCount(Math.max(0, Math.min(12, nextCount)));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!user || !canPay) {
      return;
    }

    Alert.alert(
      "Confirm fee payment",
      `Total: ${formatAmount(calculation.totalAmount)}\nExam papers: ${
        calculation.examPaperCount
      }\nRevaluation: ${
        calculation.revaluationRequested ? "Included" : "Not included"
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const updatedRecord = await addFeePaymentRecord(user.id, {
                examPaperCount: calculation.examPaperCount,
                revaluationRequested: calculation.revaluationRequested,
                revaluationSubject: selectedSubject,
              });
              setRecord(updatedRecord);
              Alert.alert(
                "Payment recorded",
                `Receipt total: ${formatAmount(calculation.totalAmount)}`,
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  }, [calculation, canPay, selectedSubject, user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <CreditCard color="#111827" size={28} />
            <Text style={styles.title}>Fee Payment</Text>
          </View>
          <Text style={styles.subtitle}>Exam fee and revaluation request</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Refreshing fee details...</Text>
          </View>
        ) : null}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <CheckCircle color="#16a34a" size={22} />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>
              {latestPayment ? "Latest payment recorded" : "No payment yet"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {latestPayment
                ? `${formatAmount(latestPayment.totalAmount)} on ${formatPaymentDate(
                    latestPayment.createdAt,
                  )}`
                : "Exam fees can be paid from this screen."}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <FileText color="#2563eb" size={20} />
              <Text style={styles.sectionTitle}>Exam Papers</Text>
            </View>
            <Text style={styles.rateText}>
              {formatAmount(EXAM_FEE_PER_PAPER)} / paper
            </Text>
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.stepperButton}
              onPress={() => handlePaperCountChange(paperCount - 1)}
            >
              <Minus color="#111827" size={18} />
            </TouchableOpacity>
            <View style={styles.paperCountBox}>
              <Text style={styles.paperCount}>{paperCount}</Text>
              <Text style={styles.paperCountLabel}>papers</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.stepperButton}
              onPress={() => handlePaperCountChange(paperCount + 1)}
            >
              <Plus color="#111827" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.revaluationTopRow}>
            <View style={styles.sectionTitleWrap}>
              <RotateCcw color="#7e22ce" size={20} />
              <View>
                <Text style={styles.sectionTitle}>Revaluation</Text>
                <Text style={styles.revaluationSubtitle}>
                  Fixed {formatAmount(REVALUATION_REQUEST_FEE)} request charge
                </Text>
              </View>
            </View>
            <Switch
              value={revaluationRequested}
              onValueChange={setRevaluationRequested}
              trackColor={{ false: "#d1d5db", true: "#c4b5fd" }}
              thumbColor={revaluationRequested ? "#7e22ce" : "#f9fafb"}
            />
          </View>

          {revaluationRequested && subjectNames.length > 0 ? (
            <View style={styles.subjectList}>
              {subjectNames.map((subject) => {
                const isSelected = selectedSubject === subject;

                return (
                  <TouchableOpacity
                    key={subject}
                    activeOpacity={0.8}
                    style={[
                      styles.subjectChip,
                      isSelected ? styles.subjectChipSelected : null,
                    ]}
                    onPress={() => setSelectedSubject(subject)}
                  >
                    <Text
                      style={[
                        styles.subjectChipText,
                        isSelected ? styles.subjectChipTextSelected : null,
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.totalCard}>
          <Text style={[styles.sectionTitle, styles.totalTitle]}>
            Payment Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Exam fee ({calculation.examPaperCount} x{" "}
              {formatAmount(calculation.examFeePerPaper)})
            </Text>
            <Text style={styles.summaryValue}>
              {formatAmount(calculation.examFeeAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Revaluation request</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(calculation.revaluationFeeAmount)}
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatAmount(calculation.totalAmount)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          disabled={!canPay}
          style={[styles.payButton, !canPay ? styles.payButtonDisabled : null]}
          onPress={handleSubmit}
        >
          <CreditCard color="#ffffff" size={20} />
          <Text style={styles.payButtonText}>
            {isSubmitting ? "Recording..." : "Pay Fees"}
          </Text>
        </TouchableOpacity>

        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {payments.length === 0 ? (
            <Text style={styles.emptyText}>No payment receipts yet.</Text>
          ) : (
            payments.map((payment) => (
              <PaymentHistoryItem key={payment.id} payment={payment} />
            ))
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  loadingText: {
    color: "#334155",
    fontWeight: "600",
  },
  statusCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusSubtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionTitleWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
  rateText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
  },
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  paperCountBox: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 110,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  paperCount: {
    color: "#1d4ed8",
    fontSize: 28,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  paperCountLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  revaluationTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  revaluationSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
  },
  subjectList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  subjectChip: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectChipSelected: {
    backgroundColor: "#f3e8ff",
    borderColor: "#a855f7",
  },
  subjectChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  subjectChipTextSelected: {
    color: "#7e22ce",
  },
  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  totalTitle: {
    color: "#ffffff",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 14,
  },
  summaryLabel: {
    color: "#d1d5db",
    flex: 1,
    fontSize: 13,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  totalDivider: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  payButton: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 16,
  },
  payButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  payButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  historyItem: {
    alignItems: "flex-start",
    borderBottomColor: "#f1f5f9",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
  },
  historyIcon: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  historyMeta: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  referenceText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  historyAmountWrap: {
    alignItems: "flex-end",
  },
  historyAmount: {
    color: "#111827",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  paidLabel: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 12,
  },
});
