import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  appendAttendanceExportRow,
  normalizeAttendanceExportRow,
} from "@/services/attendanceExportService";
import { getUsers } from "@/services/authStorage";
import type {
  AssignmentRecord,
  AttendanceRecord,
  FeePaymentRecord,
  MarkRecord,
  StudentRecord,
  StudentUser,
} from "@/types/student";

const STUDENT_DATA_KEY = "educonnect_student_data";
const DEFAULT_TOTAL_MAX = 100;
export const EXAM_FEE_PER_PAPER = 90;
export const REVALUATION_REQUEST_FEE = 400;

const studentDataListeners = new Set<() => void>();
let cachedStudentDataMap: Record<string, StudentRecord> | null = null;
let studentDataLoadPromise: Promise<Record<string, StudentRecord>> | null =
  null;

type FeePaymentCalculationInput = {
  examPaperCount: number;
  revaluationRequested?: boolean;
};

export type FeePaymentCalculation = {
  examPaperCount: number;
  examFeePerPaper: number;
  examFeeAmount: number;
  revaluationRequested: boolean;
  revaluationFeeAmount: number;
  totalAmount: number;
};

export type CreateFeePaymentInput = {
  examPaperCount: number;
  revaluationRequested?: boolean;
  revaluationSubject?: string;
};

function normalizeStudentRecord(
  record?: Partial<StudentRecord> | null,
): StudentRecord {
  return {
    attendance: Array.isArray(record?.attendance) ? record.attendance : [],
    marks: Array.isArray(record?.marks) ? record.marks : [],
    assignments: Array.isArray(record?.assignments) ? record.assignments : [],
    feePayments: Array.isArray(record?.feePayments)
      ? record.feePayments
      : [],
  };
}

function createDefaultRecord(): StudentRecord {
  return normalizeStudentRecord();
}

export function calculateFeePayment(
  input: FeePaymentCalculationInput,
): FeePaymentCalculation {
  const examPaperCount = Math.max(0, Math.floor(input.examPaperCount || 0));
  const revaluationRequested = Boolean(input.revaluationRequested);
  const examFeeAmount = examPaperCount * EXAM_FEE_PER_PAPER;
  const revaluationFeeAmount = revaluationRequested
    ? REVALUATION_REQUEST_FEE
    : 0;

  return {
    examPaperCount,
    examFeePerPaper: EXAM_FEE_PER_PAPER,
    examFeeAmount,
    revaluationRequested,
    revaluationFeeAmount,
    totalAmount: examFeeAmount + revaluationFeeAmount,
  };
}

export function getStudentFeePaymentTotal(
  record: Pick<StudentRecord, "feePayments">,
): number {
  return (record.feePayments ?? []).reduce((sum, payment) => {
    return payment.status === "paid" ? sum + payment.totalAmount : sum;
  }, 0);
}

async function loadStudentDataMap(): Promise<Record<string, StudentRecord>> {
  if (cachedStudentDataMap) {
    return cachedStudentDataMap;
  }

  if (!studentDataLoadPromise) {
    studentDataLoadPromise = (async () => {
      const raw = await AsyncStorage.getItem(STUDENT_DATA_KEY);
      if (!raw) {
        cachedStudentDataMap = {};
        return cachedStudentDataMap;
      }

      try {
        const parsed = JSON.parse(raw) as Record<
          string,
          Partial<StudentRecord>
        >;
        cachedStudentDataMap = Object.fromEntries(
          Object.entries(parsed).map(([userId, record]) => [
            userId,
            normalizeStudentRecord(record),
          ]),
        );
      } catch {
        cachedStudentDataMap = {};
      }

      return cachedStudentDataMap;
    })().finally(() => {
      studentDataLoadPromise = null;
    });
  }

  return studentDataLoadPromise;
}

async function saveStudentDataMap(
  map: Record<string, StudentRecord>,
): Promise<void> {
  cachedStudentDataMap = map;
  await AsyncStorage.setItem(STUDENT_DATA_KEY, JSON.stringify(map));
  studentDataListeners.forEach((listener) => listener());
}

export async function removeStudentRecord(userId: string): Promise<void> {
  const map = await loadStudentDataMap();
  if (!map[userId]) {
    return;
  }

  const updatedMap = { ...map };
  delete updatedMap[userId];
  await saveStudentDataMap(updatedMap);
}

export function subscribeStudentData(listener: () => void): () => void {
  studentDataListeners.add(listener);
  return () => {
    studentDataListeners.delete(listener);
  };
}

export function calculateTotalMarks(
  internalMarks: number,
  externalMarks: number,
): number {
  const total = Math.round(internalMarks + externalMarks / 2);
  return Math.max(0, Math.min(DEFAULT_TOTAL_MAX, total));
}

export function calculateGrade(totalMarks: number): string {
  if (totalMarks >= 90) return "A+";
  if (totalMarks >= 80) return "A";
  if (totalMarks >= 70) return "B";
  if (totalMarks >= 60) return "C";
  if (totalMarks >= 50) return "D";
  return "F";
}

export function getMarkTotal(
  mark: Pick<
    MarkRecord,
    "totalMarks" | "score" | "internalMarks" | "externalMarks" | "maxScore"
  >,
): number {
  const computedTotal = calculateTotalMarks(
    mark.internalMarks ?? 0,
    mark.externalMarks ?? 0,
  );

  if (typeof mark.totalMarks === "number") {
    if (mark.maxScore === 150) {
      return computedTotal;
    }
    return Math.max(0, Math.min(DEFAULT_TOTAL_MAX, mark.totalMarks));
  }

  if (typeof mark.score === "number") {
    if (mark.maxScore === 150) {
      return computedTotal;
    }
    return Math.max(0, Math.min(DEFAULT_TOTAL_MAX, mark.score));
  }

  return computedTotal;
}

export function getMarkGrade(
  mark: Pick<
    MarkRecord,
    | "grade"
    | "totalMarks"
    | "score"
    | "internalMarks"
    | "externalMarks"
    | "maxScore"
  >,
): string {
  if (mark.grade) return mark.grade;
  return calculateGrade(getMarkTotal(mark));
}

export async function getAllStudentUsers(): Promise<StudentUser[]> {
  const users = await getUsers();
  return users
    .filter((user) => user.role === "student")
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
    }));
}

export async function findStudentByLoginId(
  loginId: string,
): Promise<StudentUser | undefined> {
  const normalized = loginId.trim().toLowerCase();
  const students = await getAllStudentUsers();
  return students.find(
    (student) => student.loginId.trim().toLowerCase() === normalized,
  );
}

export async function getStudentRecordByUserId(
  userId: string,
): Promise<StudentRecord> {
  const map = await loadStudentDataMap();
  return normalizeStudentRecord(map[userId]);
}

export async function addAttendanceRecord(
  userId: string,
  record: Omit<AttendanceRecord, "id" | "createdAt">,
): Promise<StudentRecord> {
  const map = await loadStudentDataMap();
  const current = normalizeStudentRecord(map[userId]);
  const newRecord: AttendanceRecord = {
    ...record,
    date: record.date ?? new Date().toISOString().slice(0, 10),
    time:
      record.time ?? new Date().toLocaleTimeString("en-US", { hour12: false }),
    className: record.className ?? "General",
    studentId: record.studentId ?? userId,
    studentName: record.studentName ?? "Student",
    id: `${Date.now()}-${Math.random()}`,
    createdAt: Date.now(),
  };

  current.attendance.unshift(newRecord);
  map[userId] = current;
  await saveStudentDataMap(map);
  await appendAttendanceExportRow(normalizeAttendanceExportRow(newRecord));

  return current;
}

export async function addMarkRecord(
  userId: string,
  record: Omit<MarkRecord, "id" | "createdAt">,
): Promise<StudentRecord> {
  const map = await loadStudentDataMap();
  const current = normalizeStudentRecord(map[userId]);
  const internalMarks = record.internalMarks ?? 0;
  const externalMarks = record.externalMarks ?? 0;
  const totalMarks = calculateTotalMarks(internalMarks, externalMarks);
  const newRecord: MarkRecord = {
    ...record,
    internalMarks,
    externalMarks,
    totalMarks,
    score: totalMarks,
    maxScore: DEFAULT_TOTAL_MAX,
    grade: record.grade,
    id: `${Date.now()}-${Math.random()}`,
    createdAt: Date.now(),
  };
  current.marks.unshift(newRecord);
  map[userId] = current;
  await saveStudentDataMap(map);
  return current;
}

export async function addAssignmentRecord(
  userId: string,
  record: Omit<AssignmentRecord, "id" | "createdAt">,
): Promise<StudentRecord> {
  const map = await loadStudentDataMap();
  const current = normalizeStudentRecord(map[userId]);
  const newRecord: AssignmentRecord = {
    ...record,
    id: `${Date.now()}-${Math.random()}`,
    createdAt: Date.now(),
  };
  current.assignments.unshift(newRecord);
  map[userId] = current;
  await saveStudentDataMap(map);
  return current;
}

export async function addFeePaymentRecord(
  userId: string,
  record: CreateFeePaymentInput,
): Promise<StudentRecord> {
  const map = await loadStudentDataMap();
  const current = normalizeStudentRecord(map[userId]);
  const calculation = calculateFeePayment(record);
  const trimmedSubject = record.revaluationSubject?.trim();
  const newRecord: FeePaymentRecord = {
    ...calculation,
    revaluationSubject:
      calculation.revaluationRequested && trimmedSubject
        ? trimmedSubject
        : undefined,
    status: "paid",
    referenceNumber: `FEE-${Date.now().toString(36).toUpperCase()}`,
    id: `${Date.now()}-${Math.random()}`,
    createdAt: Date.now(),
  };

  current.feePayments.unshift(newRecord);
  map[userId] = current;
  await saveStudentDataMap(map);
  return current;
}

export async function getStudentRecordByLoginId(
  loginId: string,
): Promise<StudentRecord | null> {
  const student = await findStudentByLoginId(loginId);
  if (!student) return null;
  return getStudentRecordByUserId(student.id);
}

export async function getStudentById(
  userId: string,
): Promise<StudentUser | undefined> {
  const students = await getAllStudentUsers();
  return students.find((student) => student.id === userId);
}
