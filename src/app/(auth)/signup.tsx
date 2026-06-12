import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { validatePasswordStrength } from "@/lib/password";
import type { UserRole } from "@/types/auth";

const STUDENT_DEPARTMENT_OPTIONS = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
];

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userType, setUserType] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      (userType === "student" && !id.trim()) ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      Alert.alert("Error", passwordValidation.errors.join("\n"));
      return;
    }

    if (userType === "student" && !selectedDepartment) {
      Alert.alert("Error", "Please select your department.");
      return;
    }

    const loginId = userType === "student" ? id.trim() : email.trim();

    setIsSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        loginId,
        role: userType,
        password,
        department: selectedDepartment || undefined,
      });
      Alert.alert("Success", `Successfully registered as a ${userType}!`, [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sign up failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
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
        <View style={styles.content}>
          <LinearGradient
            colors={["#2563eb", "#9333ea", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />

          <View style={styles.cardContainer}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <GraduationCap size={44} color="#ffffff" strokeWidth={1.5} />
              </View>
              <Text style={styles.title}>EduConnect</Text>
              <Text style={styles.subtitle}>
                Create an account to get started
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tabsContainer}>
                {(["student", "staff", "admin"] as const).map((type) => {
                  const isActive = userType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setUserType(type);
                        setSelectedDepartment("");
                        setShowDepartmentDropdown(false);
                      }}
                      style={[styles.tabButton, isActive && styles.tabActive]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          isActive
                            ? styles.tabTextActive
                            : styles.tabTextInactive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <User size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9ca3af"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Mail size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </View>

                {userType === "student" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Student ID</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <GraduationCap size={20} color="#9ca3af" />
                      </View>
                      <TextInput
                        value={id}
                        onChangeText={setId}
                        placeholder="Enter your Student ID"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        style={styles.input}
                      />
                    </View>
                  </View>
                )}
                {userType === "student" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Department</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setShowDepartmentDropdown(!showDepartmentDropdown)
                      }
                      style={[styles.input, styles.dropdownTrigger]}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !selectedDepartment && styles.dropdownPlaceholder,
                        ]}
                      >
                        {selectedDepartment || "Select your department"}
                      </Text>
                      <ChevronDown
                        size={18}
                        color="#6b7280"
                        style={styles.dropdownIcon}
                      />
                    </TouchableOpacity>

                    {showDepartmentDropdown && (
                      <View style={styles.dropdownMenu}>
                        {STUDENT_DEPARTMENT_OPTIONS.map((option) => {
                          const isSelected = selectedDepartment === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              onPress={() => {
                                setSelectedDepartment(option);
                                setShowDepartmentDropdown(false);
                              }}
                              style={[
                                styles.dropdownOption,
                                isSelected && styles.dropdownOptionActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dropdownOptionText,
                                  isSelected && styles.dropdownOptionTextActive,
                                ]}
                              >
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      style={[styles.input, styles.inputPassword]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#9ca3af" />
                      ) : (
                        <Eye size={20} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      style={[styles.input, styles.inputPassword]}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.passwordToggle}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#9ca3af" />
                      ) : (
                        <Eye size={20} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={["#2563eb", "#9333ea"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Sign Up</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.signupPromptRow}>
                  <Text style={styles.loginPromptText}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/login")}>
                    <Text style={styles.loginLinkText}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardContainer: { width: "100%", maxWidth: 400, marginVertical: 32 },
  header: { alignItems: "center", marginBottom: 32 },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { textTransform: "capitalize", fontSize: 14 },
  tabTextActive: { color: "#111827", fontWeight: "700" },
  tabTextInactive: { color: "#6b7280", fontWeight: "600" },
  form: { gap: 20 },
  inputGroup: { gap: 9 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#374151" },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: { position: "absolute", left: 16, zIndex: 10 },
  input: {
    width: "100%",
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    color: "#111827",
    fontSize: 16,
  },
  inputPassword: { paddingRight: 48 },
  passwordToggle: { position: "absolute", right: 16, zIndex: 10, padding: 4 },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownOptionActive: {
    backgroundColor: "#eff6ff",
  },
  dropdownOptionText: {
    fontSize: 15,
    color: "#111827",
  },
  dropdownOptionTextActive: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  submitButton: {
    width: "100%",
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonGradient: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
  signupPromptRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginPromptText: { fontSize: 14, color: "#4b5563" },
  loginLinkText: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
});
