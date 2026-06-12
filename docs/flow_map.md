# EduConnect Student ERP — Page Navigation Flow Map

This file contains the complete visual flow map of the page transitions inside the EduConnect React Native/Expo Router application.

---

## 📊 1. Core Page Navigation Flowchart

```mermaid
flowchart TD
    %% Base Entry Point
    Entry[App Launch: /] -->|Runs SplashScreen| Splash[index.tsx - Splash]
    
    %% Session Checking
    Splash -->|isLoading = false| CheckSession{Is Session Active?}
    CheckSession -->|No Session| Login[login.tsx - Login]
    CheckSession -->|Session Active| RoleRouter{Role Type}
    
    %% Role Redirection
    RoleRouter -->|student| StuDashboard[student/index.tsx - Student Home]
    RoleRouter -->|staff| StfDashboard[staff/index.tsx - Staff Home]
    RoleRouter -->|admin| AdmDashboard[admin/index.tsx - Admin Dashboard]

    %% Authentication Flows
    Login -->|Tap Sign Up| Signup[signup.tsx - Sign Up]
    Login -->|Tap Forgot Password?| Forgot[forgot-password.tsx - Password Reset]
    Login -->|Successful Sign In| RoleRouter
    
    Signup -->|Registration Complete| Login
    Signup -->|Tap Sign In Link| Login
    
    Forgot -->|Password Reset Done| Login
    Forgot -->|Tap Back Button| Login

    %% Student Tab Portal Routes
    subgraph Student Portal Tab Navigation
        StuDashboard -->|Tap Tab 2| StuAttendance[student/attendance.tsx - Attendance Logs]
        StuDashboard -->|Tap Tab 3| StuMarks[student/marks.tsx - Exam Marks]
        StuDashboard -->|Tap Tab 4 or Today Schedule card| StuTimetable[student/timetable.tsx - Daily Class Schedule]
        StuDashboard -->|Tap Tab 5| StuProfile[student/profile.tsx - Profile View]
        
        StuProfile -->|Press Logout| LogoutStu[Call signOut()]
    end
    LogoutStu --> Login

    %% Staff Tab Portal Routes
    subgraph Staff Portal Tab Navigation
        StfDashboard -->|Tap Tab 2 or Quick Action| StfAttendance[staff/mark-attendance.tsx - Mark Attendance]
        StfDashboard -->|Tap Tab 3 or Quick Action| StfUpload[staff/upload-marks.tsx - Upload Marks]
        StfDashboard -->|Tap Tab 4 or Quick Action| StfAssignments[staff/assignments.tsx - Course Assignments]
        StfDashboard -->|Tap Tab 5| StfProfile[staff/profile.tsx - Profile View]
        
        StfProfile -->|Press Logout| LogoutStf[Call signOut()]
    end
    LogoutStf --> Login

    %% Admin Tab Portal Routes
    subgraph Admin Portal Tab Navigation
        AdmDashboard -->|Tap Tab 2 or Manage Students Button| AdmStudents[admin/manage-students.tsx - Manage Students List]
        AdmDashboard -->|Tap Tab 3 or Manage Staff Button| AdmStaff[admin/manage-staff.tsx - Manage Staff List]
        AdmDashboard -->|Tap Tab 4| AdmProfile[admin/profile.tsx - Profile View]
        
        AdmStudents -->|Tap Back Button| AdmDashboard
        AdmStaff -->|Tap Back Button| AdmDashboard
        AdmProfile -->|Press Logout| LogoutAdm[Call signOut()]
    end
    LogoutAdm --> Login
```

---

## 📝 2. Detailed Page-by-Page Transitions List

### 🚪 Phase 1: Entry & Auth Pages
1. **Splash Screen (`/` $\rightarrow$ `src/app/index.tsx`)**
   * **Triggers**: Opened automatically on app boot.
   * **Exits**:
     * Auto-redirects to **Login Screen** if there is no active session.
     * Auto-redirects to **Role Portals** if a session is restored.
2. **Login Screen (`/login` $\rightarrow$ `src/app/(auth)/login.tsx`)**
   * **Triggers**: Opened from Splash when not logged in.
   * **Exits**:
     * Clicking "Sign Up" opens **Signup Screen** (`router.push('/signup')`).
     * Clicking "Forgot Password?" opens **Forgot Password Screen** (`router.push('/(auth)/forgot-password')`).
     * Submitting correct credentials redirects to **Dashboard Screen** of the selected role (`router.replace('/[student/staff/admin]')`).
3. **Signup Screen (`/signup` $\rightarrow$ `src/app/(auth)/signup.tsx`)**
   * **Triggers**: Opened from Login Screen.
   * **Exits**:
     * Clicking "Sign In" returns to **Login Screen** (`router.replace('/login')`).
     * On successful sign up, alerts success and routes back to **Login Screen**.
4. **Forgot Password Screen (`/forgot-password` $\rightarrow$ `src/app/(auth)/forgot-password.tsx`)**
   * **Triggers**: Opened from Login Screen.
   * **Exits**:
     * Clicking the "Back" arrow returns to **Login Screen** (`router.back()`).
     * Successfully resetting the password returns to **Login Screen** (`router.replace('/login')`).

---

### 🎓 Phase 2: Student Portal Tab Pages (under `/student`)
1. **Student Dashboard (`/student/` $\rightarrow$ `src/app/student/index.tsx`)**
   * **Triggers**: Successful Student login.
   * **Exits**:
     * Pressing "View All" under "Today's Schedule" redirects to **Student Timetable** tab.
2. **Student Attendance (`/student/attendance` $\rightarrow$ `src/app/student/attendance.tsx`)**
   * **Triggers**: Accessed via the bottom tab bar.
   * **Exits**: None (tab screen).
3. **Student Marks Scorecard (`/student/marks` $\rightarrow$ `src/app/student/marks.tsx`)**
   * **Triggers**: Accessed via the bottom tab bar.
   * **Exits**: None (tab screen).
4. **Student Timetable (`/student/timetable` $\rightarrow$ `src/app/student/timetable.tsx`)**
   * **Triggers**: Accessed via the bottom tab bar or Dashboard schedule card.
   * **Exits**: None (tab screen).
5. **Student Profile (`/student/profile` $\rightarrow$ `src/app/student/profile.tsx`)**
   * **Triggers**: Accessed via the bottom tab bar.
   * **Exits**:
     * Pressing the red "Logout" button calls `signOut()` and routes back to **Login Screen** (`router.replace('/login')`).

---

### 👩‍🏫 Phase 3: Staff Portal Tab Pages (under `/staff`)
1. **Staff Dashboard (`/staff/` $\rightarrow$ `src/app/staff/index.tsx`)**
   * **Triggers**: Successful Staff login.
   * **Exits**:
     * Pressing "Mark Attendance" quick action redirect to **Mark Attendance** tab.
     * Pressing "Upload Marks" quick action redirects to **Upload Marks** tab.
     * Pressing "Assignments" quick action redirects to **Assignments** tab.
2. **Mark Attendance (`/staff/mark-attendance` $\rightarrow$ `src/app/staff/mark-attendance.tsx`)**
   * **Triggers**: Accessed via bottom tab bar or Dashboard.
   * **Exits**: None (tab screen).
3. **Upload Marks (`/staff/upload-marks` $\rightarrow$ `src/app/staff/upload-marks.tsx`)**
   * **Triggers**: Accessed via bottom tab bar or Dashboard.
   * **Exits**: None (tab screen).
4. **Manage Assignments (`/staff/assignments` $\rightarrow$ `src/app/staff/assignments.tsx`)**
   * **Triggers**: Accessed via bottom tab bar or Dashboard.
   * **Exits**: None (tab screen).
5. **Staff Profile (`/staff/profile` $\rightarrow$ `src/app/staff/profile.tsx`)**
   * **Triggers**: Accessed via bottom tab bar.
   * **Exits**:
     * Pressing "Logout" clears the session and routes back to **Login Screen**.

---

### 👑 Phase 4: Admin Portal Tab Pages (under `/admin`)
1. **Admin Dashboard (`/admin/` $\rightarrow$ `src/app/admin/index.tsx`)**
   * **Triggers**: Successful Admin login.
   * **Exits**:
     * Pressing "Manage Students" quick action opens the **Manage Students List** tab.
     * Pressing "Manage Staff" quick action opens the **Manage Staff List** tab.
2. **Manage Students List (`/admin/manage-students` $\rightarrow$ `src/app/admin/manage-students.tsx`)**
   * **Triggers**: Tab press or Dashboard button.
   * **Exits**:
     * Pressing the "← Back" button navigates back to **Admin Dashboard** tab (`router.back()`).
3. **Manage Staff List (`/admin/manage-staff` $\rightarrow$ `src/app/admin/manage-staff.tsx`)**
   * **Triggers**: Tab press or Dashboard button.
   * **Exits**:
     * Pressing the "← Back" button navigates back to **Admin Dashboard** tab (`router.back()`).
4. **Admin Profile (`/admin/profile` $\rightarrow$ `src/app/admin/profile.tsx`)**
   * **Triggers**: Tab press.
   * **Exits**:
     * Pressing "Logout" clears the session and routes back to **Login Screen**.
