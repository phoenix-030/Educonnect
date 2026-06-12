import type { StoredUser } from "@/types/auth";

export type AttendanceRecord = {
  id: string;
  date: string;
  time: string;
  subject: string;
  className: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent";
  markedBy: string;
  createdAt: number;
};

export type MarkRecord = {
  id: string;
  subject: string;
  internalMarks?: number;
  externalMarks?: number;
  totalMarks?: number;
  score?: number;
  maxScore: number;
  grade: string;
  remarks?: string;
  uploadedBy: string;
  createdAt: number;
};

export type AssignmentRecord = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  description: string;
  uploadedBy: string;
  createdAt: number;
};

export type FeePaymentRecord = {
  id: string;
  examPaperCount: number;
  examFeePerPaper: number;
  examFeeAmount: number;
  revaluationRequested: boolean;
  revaluationSubject?: string;
  revaluationFeeAmount: number;
  totalAmount: number;
  status: "paid";
  referenceNumber: string;
  createdAt: number;
};

export type StudentRecord = {
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  assignments: AssignmentRecord[];
  feePayments: FeePaymentRecord[];
};

export type StudentUser = Pick<
  StoredUser,
  "id" | "name" | "email" | "loginId" | "role"
>;
