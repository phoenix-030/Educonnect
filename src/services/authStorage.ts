import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Session, StoredUser } from "@/types/auth";

const USERS_KEY = "educonnect_users";
const SESSION_KEY = "@educonnect_session";
const PASSWORD_RESET = "educonnect_password_reset";

export async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function deleteUser(userId: string): Promise<void> {
  const users = await getUsers();
  const filteredUsers = users.filter((user) => user.id !== userId);

  if (filteredUsers.length === users.length) {
    throw new Error("User not found.");
  }

  await saveUsers(filteredUsers);
}

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getPasswordResetRequest(
  email: string,
): Promise<{ email: string; otpHash: string; expiresAt: number } | null> {
  const raw = await AsyncStorage.getItem(PASSWORD_RESET);
  if (!raw) return null;

  try {
    const allRequests = JSON.parse(raw) as Record<
      string,
      { email: string; otpHash: string; expiresAt: number }
    >;
    return allRequests[email.trim().toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

export async function savePasswordResetRequest(
  email: string,
  request: { otpHash: string; expiresAt: number },
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const raw = await AsyncStorage.getItem(PASSWORD_RESET);
  const allRequests = raw
    ? (JSON.parse(raw) as Record<
        string,
        { email: string; otpHash: string; expiresAt: number }
      >)
    : {};

  allRequests[normalizedEmail] = {
    email: normalizedEmail,
    otpHash: request.otpHash,
    expiresAt: request.expiresAt,
  };

  await AsyncStorage.setItem(PASSWORD_RESET, JSON.stringify(allRequests));
}

export async function clearPasswordResetRequest(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const raw = await AsyncStorage.getItem(PASSWORD_RESET);
  if (!raw) return;

  try {
    const allRequests = JSON.parse(raw) as Record<
      string,
      { email: string; otpHash: string; expiresAt: number }
    >;
    delete allRequests[normalizedEmail];
    await AsyncStorage.setItem(PASSWORD_RESET, JSON.stringify(allRequests));
  } catch {
    await AsyncStorage.removeItem(PASSWORD_RESET);
  }
}
