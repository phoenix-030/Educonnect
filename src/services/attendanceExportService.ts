import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as XLSX from "xlsx";

import type { AttendanceRecord } from "@/types/student";

const ATTENDANCE_EXPORT = "educonnect_attendance_export_history";

export type AttendanceExportRow = {
  id: string;
  studentName: string;
  studentId: string;
  attendanceStatus: "Present" | "Absent";
  date: string;
  time: string;
  staffName: string;
  subject: string;
  className: string;
  createdAt: number;
};

export type AttendanceExportFilter = {
  dateFrom?: string;
  dateTo?: string;
};

function normalizeString(value?: string): string {
  return value?.trim() ?? "";
}

function buildWorkbook(rows: AttendanceExportRow[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      "Student Name",
      "Student ID",
      "Attendance Status",
      "Date",
      "Time",
      "Staff Name",
      "Subject",
      "Class",
    ],
    ...rows.map((row) => [
      row.studentName,
      row.studentId,
      row.attendanceStatus,
      row.date,
      row.time,
      row.staffName,
      row.subject,
      row.className,
    ]),
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  return workbook;
}

function createAttendanceFile(filename: string): File {
  return new File(Paths.document, "attendance_exports", filename);
}

async function writeWorkbookFile(
  rows: AttendanceExportRow[],
  filename: string,
): Promise<File> {
  const workbook = buildWorkbook(rows);
  const workbookBase64 = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "base64",
  });

  const file = createAttendanceFile(filename);
  await file.create({ intermediates: true, overwrite: true });
  await file.write(workbookBase64, { encoding: "base64" });

  return file;
}

async function loadStoredRows(): Promise<AttendanceExportRow[]> {
  const raw = await AsyncStorage.getItem(ATTENDANCE_EXPORT);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as AttendanceExportRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getAttendanceExportRows(): Promise<
  AttendanceExportRow[]
> {
  return loadStoredRows();
}

export async function saveAttendanceExportRows(
  rows: AttendanceExportRow[],
): Promise<File> {
  const serializedRows = rows.slice().sort((a, b) => b.createdAt - a.createdAt);

  await AsyncStorage.setItem(
    ATTENDANCE_EXPORT,
    JSON.stringify(serializedRows),
  );

  return writeWorkbookFile(serializedRows, "attendance_export.xlsx");
}

export async function appendAttendanceExportRow(
  row: AttendanceExportRow,
): Promise<File> {
  const rows = await loadStoredRows();
  rows.unshift(row);
  return saveAttendanceExportRows(rows);
}

export function normalizeAttendanceExportRow(
  record: AttendanceRecord,
): AttendanceExportRow {
  return {
    id: record.id,
    studentName: normalizeString(record.studentName),
    studentId: normalizeString(record.studentId),
    attendanceStatus: record.status === "present" ? "Present" : "Absent",
    date: normalizeString(record.date),
    time: normalizeString(record.time),
    staffName: normalizeString(record.markedBy),
    subject: normalizeString(record.subject),
    className: normalizeString(record.className),
    createdAt: record.createdAt,
  };
}

export async function getFilteredAttendanceExportRows(
  filter: AttendanceExportFilter,
): Promise<AttendanceExportRow[]> {
  const rows = await getAttendanceExportRows();
  const normalizedFilter = {
    dateFrom: normalizeString(filter.dateFrom),
    dateTo: normalizeString(filter.dateTo),
  };

  return rows.filter((row) => {
    const matchesDateFrom =
      !normalizedFilter.dateFrom || row.date >= normalizedFilter.dateFrom;
    const matchesDateTo =
      !normalizedFilter.dateTo || row.date <= normalizedFilter.dateTo;

    return matchesDateFrom && matchesDateTo;
  });
}

export async function downloadAttendanceWorkbook(
  filter: AttendanceExportFilter = {},
): Promise<string> {
  const filteredRows = await getFilteredAttendanceExportRows(filter);

  if (!filteredRows.length) {
    throw new Error("No attendance records match the selected filters.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (Platform.OS === "web") {
    const workbook = buildWorkbook(filteredRows);
    const workbookBytes = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    }) as Uint8Array;
    const blob = new Blob([new Uint8Array(workbookBytes)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `attendance_export_${timestamp}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
    return `attendance_export_${timestamp}.xlsx`;
  }

  const file = await writeWorkbookFile(
    filteredRows,
    `attendance_export_${timestamp}.xlsx`,
  );

  if (Platform.OS === "ios" || Platform.OS === "android") {
    await Sharing.shareAsync(file.uri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Download Attendance Export",
    });
  }

  return file.uri;
}
