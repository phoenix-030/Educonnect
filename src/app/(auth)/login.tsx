import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
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
  useColorScheme,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { getHomeRoute } from '@/lib/roleRoutes';
import type { UserRole } from '@/types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (userType === 'student' && !loginId.trim()) {
      Alert.alert('Error', 'Please enter your Student ID.');
      return;
    }
    if (userType !== 'student' && !email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = userType === 'student' ? loginId.trim() : email.trim();
      const authUser = await signIn(
        identifier,
        password,
        userType,
        rememberMe,
      );
      router.replace(getHomeRoute(authUser.role));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backgroundGradientColors = isDark
    ? ['#1e3a8a', '#581c8f', '#1e1b4b']
    : ['#2563eb', '#9333ea', '#4338ca'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <LinearGradient
            colors={backgroundGradientColors as [string, string, ...string[]]}
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
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark
                    ? 'rgba(228, 233, 240, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark ? '#374151' : '#f3f4f6',
                },
              ]}
            >
              <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
                {(['student', 'staff', 'admin'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setUserType(type)}
                    style={[
                      styles.tabButton,
                      userType === type &&
                        (isDark ? styles.tabActiveButtonDark : styles.tabActiveButton),
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        isDark && styles.tabTextDark,
                        userType === type &&
                          (isDark ? styles.tabActiveTextDark : styles.tabActiveText),
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.form}>
                {userType === 'student' ? (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                      Student ID
                    </Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <GraduationCap size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                      </View>
                      <TextInput
                        value={loginId}
                        onChangeText={setLoginId}
                        placeholder="Enter your Student ID"
                        placeholderTextColor={isDark ? '#6b7280' : '#a1a1aa'}
                        autoCapitalize="none"
                        style={[styles.input, isDark && styles.inputDark]}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                      Email Address
                    </Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <Mail size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                      </View>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor={isDark ? '#6b7280' : '#a1a1aa'}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.input, isDark && styles.inputDark]}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
                    Password
                  </Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </View>
                    <TextInput
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={isDark ? '#6b7280' : '#a1a1aa'}
                      autoCapitalize="none"
                      style={[styles.input, isDark && styles.inputDark, styles.inputPassword]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                      ) : (
                        <Eye size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMeButton}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isDark && styles.checkboxDark,
                        rememberMe &&
                          (isDark ? styles.checkboxCheckedDark : styles.checkboxChecked),
                      ]}
                    >
                      {rememberMe && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={[styles.rememberMeText, isDark && styles.remembertext]}>
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => (router.push as any)('/(auth)/forgot-password')}
                    style={{ paddingVertical: 4 }}
                  >
                    <Text
                      style={[styles.forgotPasswordText, isDark && styles.forgotPasswordTextDark]}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                >
                  <LinearGradient
                    colors={['#2563eb', '#9333ea']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.signupPromptRow}>
                  <Text
                    style={[styles.signupPromptText, { color: isDark ? '#000000' : '#4b5563' }]}
                  >
                    {"Don't have an account?"}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text
                      style={[styles.signupLinkText, { color: isDark ? '#0073ff' : '#0c54f0' }]}
                    >
                      {' '}
                      Sign Up
                    </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardContainer: { width: '100%', maxWidth: 400, marginVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  card: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: '#f5f5f6',
    borderRadius: 16,
    marginBottom: 24,
  },
  tabsContainerDark: { backgroundColor: 'rgba(253, 249, 249, 1)' },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActiveButton: {
    backgroundColor: '#f3ecec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabActiveButtonDark: { backgroundColor: '#2564eb' },
  tabText: {
    textTransform: 'capitalize',
    fontWeight: '600',
    fontSize: 14,
    color: '#000000',
  },
  tabTextDark: { color: '#060606' },
  tabActiveText: { color: '#070808', fontWeight: '700' },
  tabActiveTextDark: { color: '#ffffff' },
  form: { gap: 20 },
  inputGroup: { gap: 9 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  inputLabelDark: { color: '#111827' },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 10 },
  input: {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe4f0',
    borderRadius: 16,
    color: '#111827',
    fontSize: 16,
  },
  inputDark: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4f0',
    color: '#111827',
  },
  inputPassword: { paddingRight: 48 },
  passwordToggle: { position: 'absolute', right: 16, zIndex: 10, padding: 4 },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberMeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: { borderColor: '#6b7280', backgroundColor: 'rgba(55, 65, 81, 0.5)' },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkboxCheckedDark: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkboxInner: { width: 8, height: 8, backgroundColor: '#ffffff', borderRadius: 2 },
  rememberMeText: { fontSize: 14, fontWeight: '500', color: '#4b5563' },
  remembertext: { color: '#000000' },
  forgotPasswordText: { fontSize: 14, fontWeight: '600', color: '#0c54f0' },
  forgotPasswordTextDark: { color: '#0073ff' },
  submitButton: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonGradient: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 18 },
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupPromptText: { fontSize: 14 },
  signupLinkText: { fontSize: 14, fontWeight: '700' },
});
