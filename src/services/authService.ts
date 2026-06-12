// mock auth
import * as Crypto from "expo-crypto";

import { hashPassword, validatePasswordStrength, verifyPassword,} from "@/lib/password";
import { clearPasswordResetRequest,  clearSession,  deleteUser,  getPasswordResetRequest,  getSession,
  getUsers,  savePasswordResetRequest,  saveSession,
  saveUsers,} from "@/services/authStorage";
import { removeStudentRecord } from "@/services/studentService";
import type {  AuthUser,  ProfileUpdate,  Session,  SignUpInput,  StoredUser,  UserRole,} from "@/types/auth";

const REMEMBER_ME_MS = 365 * 24 * 60 * 60 * 1000;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_OTP_MS = 10 * 60 * 1000;
// 1 y
// 30 day

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function toAuthUser(user: StoredUser): AuthUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

function isSessionValid(session: Session): boolean {
  return session.expiresAt > Date.now();
}

async function createSession(
  user: StoredUser,
  rememberMe: boolean,
): Promise<Session> {
  const session: Session = {
    token: Crypto.randomUUID(),
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + (rememberMe ? REMEMBER_ME_MS : SESSION_MS),
  };
  await saveSession(session);
  return session;
}

export async function restoreSession(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session || !isSessionValid(session)) {
    if (session) await clearSession();
    return null;
  }

  const users = await getUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    await clearSession();
    return null;
  }

  return toAuthUser(user);
}

export async function signIn(
  loginId: string,
  password: string,
  role: UserRole,
  rememberMe: boolean,
): Promise<AuthUser> {
  const normalizedInput = loginId.trim().toLowerCase();
  const users = await getUsers();

  // Students match by loginId, staff/admin match by email
  const user = users.find((u) => {
    if (u.role !== role) return false;
    if (role === "student") {
      return u.loginId.trim().toLowerCase() === normalizedInput;
    }
    return u.email.trim().toLowerCase() === normalizedInput;
  });

  if (!user) {
    throw new Error(
      role === "student"
        ? "Invalid Student ID or password."
        : "Invalid email or password.",
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error(
      role === "student"
        ? "Invalid Student ID or password."
        : "Invalid email or password.",
    );
  }

  await createSession(user, rememberMe);
  return toAuthUser(user);
}

export async function signUp(input: SignUpInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const loginId =
    input.role === "student" ? input.loginId.trim().toLowerCase() : email;

  if (!name || !email || !input.password) {
    throw new Error("Please fill in all required fields.");
  }

  if (input.role === "student" && !input.loginId.trim()) {
    throw new Error("Please enter your Student ID.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const users = await getUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists.");
  }

  // check login id of student duplicates are availabel or not
  if (
    input.role === "student" &&
    users.some(
      (u) => u.role === "student" && u.loginId.trim().toLowerCase() === loginId,
    )
  ) {
    throw new Error("This Student ID is already registered.");
  }

  const passwordValidation = validatePasswordStrength(input.password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0]);
  }

  if (input.role === "student" && !input.department?.trim()) {
    throw new Error("Please select your department.");
  }

  const passwordHash = await hashPassword(input.password);
  const newUser: StoredUser = {
    id: Crypto.randomUUID(),
    role: input.role,
    name,
    email,
    loginId,
    passwordHash,
    department: input.department?.trim(),
    subject: input.subject?.trim(),
  };

  await saveUsers([...users, newUser]);
  return toAuthUser(newUser);
}

export async function requestPasswordReset(
  email: string,
): Promise<{ email: string; otp: string; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Please enter your email address.");
  }

  const users = await getUsers();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("No account was found for this email address.");
  }

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  await savePasswordResetRequest(normalizedEmail, {
    otpHash,
    expiresAt: Date.now() + RESET_OTP_MS,
  });

  return {
    email: normalizedEmail,
    otp,
    message:
      "A 6-digit OTP was generated for this email. Use it to reset your password.",
  };
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !otp.trim()) {
    throw new Error("Please enter your email and OTP.");
  }

  const users = await getUsers();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("No account was found for this email address.");
  }

  const resetRequest = await getPasswordResetRequest(normalizedEmail);
  if (!resetRequest || resetRequest.expiresAt < Date.now()) {
    await clearPasswordResetRequest(normalizedEmail);
    throw new Error("This OTP has expired. Please request a new one.");
  }

  const isValidOtp = await verifyPassword(otp.trim(), resetRequest.otpHash);
  if (!isValidOtp) {
    throw new Error("The OTP you entered is invalid. Please try again.");
  }

  return true;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !otp.trim()) {
    throw new Error("Please enter your email and OTP.");
  }

  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0]);
  }

  const users = await getUsers();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("No account was found for this email address.");
  }

  await verifyOtp(normalizedEmail, otp);

  const passwordHash = await hashPassword(newPassword);
  const updatedUsers = users.map((entry) =>
    entry.id === user.id ? { ...entry, passwordHash } : entry,
  );

  await saveUsers(updatedUsers);
  await clearPasswordResetRequest(normalizedEmail);
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<AuthUser> {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  const existing = users[index];
  const updatedUser: StoredUser = {
    ...existing,
    ...updates,
    loginId:
      existing.role === "student"
        ? existing.loginId
        : (updates.email?.trim().toLowerCase() ?? existing.loginId),
  };

  users[index] = updatedUser;
  await saveUsers(users);
  return toAuthUser(updatedUser);
}

export async function removeUser(userId: string): Promise<void> {
  const users = await getUsers();
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  await deleteUser(userId);

  if (user.role === "student") {
    await removeStudentRecord(userId);
  }
}

export async function signOut(): Promise<void> {
  await clearSession();
}
