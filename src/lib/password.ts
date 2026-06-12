import * as Crypto from "expo-crypto";

export const PASSWORD_LENGTH = 8;

export type PasswordValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validatePasswordStrength(
  password: string,
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_LENGTH} characters long.`,
    );
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number.");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
  );
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === passwordHash;
}
