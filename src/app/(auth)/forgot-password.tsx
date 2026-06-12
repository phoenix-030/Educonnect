import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,StyleSheet,Text,TextInput, TouchableOpacity, useColorScheme,  View,} from "react-native";

import { validatePasswordStrength } from "@/lib/password";
import * as authService from "@/services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter the email address linked to your account.",
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authService.requestPasswordReset(email.trim());
      Alert.alert(
        "OTP generated",
        `${response.message}\n\nDemo code: ${response.otp}\n\nUse this code to reset your password in the app.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate an OTP right now.";
      Alert.alert("Error", message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter the email address linked to your account.",
      );
      return;
    }

    if (!otp.trim()) {
      Alert.alert(
        "OTP required",
        "Please enter the 6-digit OTP we generated for your email.",
      );
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await authService.verifyOtp(email.trim(), otp.trim());
      Alert.alert(
        "OTP verified",
        "The OTP is correct. You can now set your new password.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify the OTP right now.";
      Alert.alert("Error", message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter the email address linked to your account.",
      );
      return;
    }

    if (!otp.trim()) {
      Alert.alert(
        "OTP required",
        "Please enter the 6-digit OTP we generated for your email.",
      );
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(
        "Password required",
        "Please enter and confirm your new password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "The new passwords do not match.");
      return;
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert("Weak password", passwordValidation.errors[0]);
      return;
    }

    setIsResetting(true);
    try {
      await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      Alert.alert(
        "Password updated",
        "Your password has been changed successfully.",
      );
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset your password right now.";
      Alert.alert("Error", message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark ? ["#111827", "#1f2937"] : ["#2563eb", "#9333ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />

        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>Use OTP and set a new password</Text>
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.noteBox}>
            <ShieldCheck size={18} color={isDark ? "#2563eb" : "#0f172a"} />
            <Text style={[styles.noteText, isDark && styles.noteTextDark]}>
              This demo uses a local OTP flow. The code is shown in the app so
              you can test the reset path quickly.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Email address
            </Text>
            <View style={styles.inputWrapper}>
              <Mail
                size={18}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your registered email"
                placeholderTextColor={isDark ? "#6b7280" : "#a1a1aa"}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, isDark && styles.inputDark]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSendOtp}
            activeOpacity={0.85}
            disabled={isSendingOtp}
            style={[
              styles.secondaryButton,
              isSendingOtp && styles.disabledButton,
            ]}
          >
            {isSendingOtp ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.secondaryButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>OTP</Text>
            <TextInput
              value={otp}
              onChangeText={(value) => setOtp(value)}
              placeholder="Enter the 6-digit OTP"
              placeholderTextColor={isDark ? "#6b7280" : "#a1a1aa"}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, isDark && styles.inputDark]}
            />
          </View>

          <TouchableOpacity
            onPress={handleVerifyOtp}
            activeOpacity={0.85}
            disabled={isVerifyingOtp}
            style={[
              styles.secondaryButton,
              isVerifyingOtp && styles.disabledButton,
            ]}
          >
            {isVerifyingOtp ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.secondaryButtonText}>Submit OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              New password
            </Text>
            <View style={styles.inputWrapper}>
              <Lock
                size={18}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter a strong new password"
                placeholderTextColor={isDark ? "#6b7280" : "#a1a1aa"}
                secureTextEntry
                autoCapitalize="none"
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                  styles.inputWithPadding,
                ]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Confirm new password
            </Text>
            <View style={styles.inputWrapper}>
              <Lock
                size={18}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={styles.inputIcon}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                placeholderTextColor={isDark ? "#6b7280" : "#a1a1aa"}
                secureTextEntry
                autoCapitalize="none"
                style={[
                  styles.input,
                  isDark && styles.inputDark,
                  styles.inputWithPadding,
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleResetPassword}
            activeOpacity={0.85}
            disabled={isResetting}
            style={[styles.primaryButton, isResetting && styles.disabledButton]}
          >
            {isResetting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
    zIndex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    padding: 18,
    zIndex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardDark: { backgroundColor: "rgba(248,250,252,0.96)" },
  noteBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: "rgba(219, 234, 254, 0.8)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  noteText: { flex: 1, color: "#0f172a", fontSize: 13, lineHeight: 18 },
  noteTextDark: { color: "#111827" },
  inputGroup: { gap: 8, marginBottom: 14 },
  label: { color: "#111827", fontSize: 14, fontWeight: "700" },
  labelDark: { color: "#111827" },
  inputWrapper: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 2 },
  input: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 15,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 13,
  },
  inputDark: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe4f0",
    color: "#111827",
  },
  inputWithPadding: { paddingLeft: 42 },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    marginBottom: 8,
  },
  secondaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginTop: 4,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  disabledButton: { opacity: 0.7 },
});
