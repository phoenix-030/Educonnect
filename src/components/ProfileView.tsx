import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  ChevronDown,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STAFF_SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "English",
  "Electronics",
  "Biology",
  "Civil Engineering",
];

export function ProfileView() {
  const { user, signOut, updateProfile } = useAuth();
  const isStudent = user?.role === "student";

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setAvatar(user.avatar ?? "");
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setAddress(user.address ?? "");
    setDob(user.dob ?? "");
    setBloodGroup(user.bloodGroup ?? "");
    setYearSection(user.yearSection ?? "3rd Year - Section A");
    setDepartment(
      user.department ??
        (user.role === "student"
          ? "Computer Science Engineering"
          : "Administration"),
    );
    setSubject(user.subject ?? "Mathematics");
    setShowSubjectDropdown(false);
    setParentName(user.parentName ?? "");
    setParentPhone(user.parentPhone ?? "");
  }, [user]);

  const handleCancel = () => {
    if (!user) return;
    setIsEditing(false);
    setAvatar(user.avatar ?? "");
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setAddress(user.address ?? "");
    setDob(user.dob ?? "");
    setBloodGroup(user.bloodGroup ?? "");
    setYearSection(user.yearSection ?? "3rd Year - Section A");
    setDepartment(
      user.department ??
        (user.role === "student"
          ? "Computer Science Engineering"
          : "Administration"),
    );
    setSubject(user.subject ?? "Mathematics");
    setShowSubjectDropdown(false);
    setParentName(user.parentName ?? "");
    setParentPhone(user.parentPhone ?? "");
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to choose a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const imageUri = asset.base64
      ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
      : asset.uri;

    setAvatar(imageUri ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and email are required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        avatar: avatar.trim() || undefined,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        dob: dob.trim(),
        bloodGroup: bloodGroup.trim(),
        yearSection: isStudent ? yearSection.trim() : undefined,
        department: isStudent ? undefined : department.trim(),
        subject: isStudent ? undefined : subject.trim(),
        parentName: isStudent ? parentName.trim() : undefined,
        parentPhone: isStudent ? parentPhone.trim() : undefined,
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to save profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <User color="#111827" size={28} />
            <Text style={styles.title}>Profile</Text>
          </View>
          <Text style={styles.subtitle}>Your personal information</Text>
        </View>

        <LinearGradient
          colors={["#4f46e5", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={isEditing ? handlePickAvatar : undefined}
              activeOpacity={isEditing ? 0.8 : 1}
              style={styles.avatarContainer}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <User color="#ffffff" size={40} />
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.8)"
                  style={[styles.input, styles.inputWhite]}
                />
              ) : (
                <Text style={styles.profileName}>Name: {user.name}</Text>
              )}
              <Text style={styles.profileSubtext}>ID: {user.loginId}</Text>
              <Text style={styles.profileSubtext}>
                {user.role.toUpperCase()}
              </Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.changePhotoButton}
            >
              <Text style={styles.changePhotoText}>Choose profile photo</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Edit3 color="#b0b0b0" size={16} />
              <Text style={styles.actionButtonText}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity
                onPress={handleCancel}
                style={[styles.actionButton, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {isStudent ? "Academic Information" : "Role Information"}
          </Text>
          <View style={styles.infoBox}>
            <BookOpen color="#3b82f6" size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                {isStudent ? "Year & Section" : "Department"}
              </Text>
              {isEditing ? (
                isStudent ? (
                  <TextInput
                    value={yearSection}
                    onChangeText={setYearSection}
                    placeholder="e.g. 3rd Year - Section A"
                    placeholderTextColor="#6b7280"
                    style={styles.input}
                  />
                ) : (
                  <TextInput
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Department"
                    placeholderTextColor="#6b7280"
                    style={styles.input}
                  />
                )
              ) : (
                <Text style={styles.infoValue}>
                  {isStudent ? yearSection : department}
                </Text>
              )}
            </View>
          </View>

          {!isStudent && (
            <View style={styles.infoBox}>
              <BookOpen color="#0f172a" size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Subject</Text>
                {isEditing ? (
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setShowSubjectDropdown(!showSubjectDropdown)
                      }
                      style={[styles.input, styles.dropdownTrigger]}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !subject && styles.dropdownPlaceholder,
                        ]}
                      >
                        {subject || "Select your subject"}
                      </Text>
                      <ChevronDown
                        size={18}
                        color="#6b7280"
                        style={styles.dropdownIcon}
                      />
                    </TouchableOpacity>

                    {showSubjectDropdown && (
                      <View style={styles.dropdownMenu}>
                        {STAFF_SUBJECT_OPTIONS.map((option) => {
                          const isSelected = subject === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              onPress={() => {
                                setSubject(option);
                                setShowSubjectDropdown(false);
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
                ) : (
                  <Text style={styles.infoValue}>
                    {subject || "Not provided"}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoBox}>
            <Mail color="#64748b" size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email </Text>
              {isEditing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>{user.email}</Text>
              )}
            </View>
          </View>
          <View style={styles.infoBox}>
            <Phone color="#64748b" size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>{phone || "Not provided"}</Text>
              )}
            </View>
          </View>
          <View style={styles.infoBox}>
            <MapPin color="#64748b" size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter address"
                  placeholderTextColor="#6b7280"
                  style={[styles.input, styles.inputMultiline]}
                  multiline
                />
              ) : (
                <Text style={styles.infoValue}>
                  {address || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.rowGrid}>
            <View style={styles.infoBoxHalf}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD MMM YYYY"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>{dob || "Not provided"}</Text>
              )}
            </View>
            <View style={[styles.infoBoxHalf, { backgroundColor: "#fdf2f8" }]}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              {isEditing ? (
                <TextInput
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  placeholder="e.g. O+"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {bloodGroup || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {isStudent && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Parent/Guardian Details</Text>
            <View style={styles.infoBox}>
              <User color="#64748b" size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Parent Name</Text>
                {isEditing ? (
                  <TextInput
                    value={parentName}
                    onChangeText={setParentName}
                    placeholder="Parent or guardian name"
                    placeholderTextColor="#6b7280"
                    style={styles.input}
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {parentName || "Not provided"}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.infoBox}>
              <Phone color="#64748b" size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Parent Phone</Text>
                {isEditing ? (
                  <TextInput
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    placeholder="Parent phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#6b7280"
                    style={styles.input}
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {parentPhone || "Not provided"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.settingsButton}>
          <Settings color="#111827" size={20} />
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut color="#ffffff" size={20} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  changePhotoText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    fontFamily: "times-new-roman",
  },
  profileSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  rowGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoBoxHalf: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputWhite: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.3)",
    color: "#ffffff",
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    marginTop: 4,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 14,
  },
  dropdownText: {
    fontSize: 14,
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
    fontSize: 14,
    color: "#111827",
  },
  dropdownOptionTextActive: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  settingsButton: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#e11d48",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
