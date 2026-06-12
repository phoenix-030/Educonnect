# Project Map & Explanation (PME)

## File Responsibility Map (Quick Reference)

| File                       | Role in Flow                         |
| -------------------------- | ------------------------------------ |
| \_layout.tsx               | Root: AuthProvider + Stack           |
| index.tsx                  | Route `/` → Splash                   |
| (auth)/\_layout.tsx        | Block login if already authenticated |
| (auth)/login.tsx           | Sign in UI + forgot-password entry   |
| (auth)/signup.tsx          | Register UI                          |
| (auth)/forgot-password.tsx | OTP request + password reset UI      |
| student/\_layout.tsx       | Student guard + 5 tabs               |
| staff/\_layout.tsx         | Staff guard + 5 tabs                 |
| admin/\_layout.tsx         | Admin guard + 2 tabs                 |
| SplashScreen.tsx           | Splash animation + redirect          |
| AuthContext.tsx            | Global user state                    |
| authService.ts             | Auth rules                           |
| authStorage.ts             | Users + session I/O                  |
| studentService.ts          | Student ERP records                  |
| roleRoutes.ts              | Role → home URL                      |
| password.ts                | Hash passwords                       |
| ProfileView.tsx            | Profile + logout + edit              |
| types/auth.ts              | Auth types                           |
| types/student.ts           | Attendance/marks/assignment types    |

---

## Recent Additions

- Student signup now asks users to choose a department.
- Staff signup now asks users to choose the subject they teach.
- Staff profile now includes a selectable subject field.
- Auth data now stores department and subject metadata for signup/profile updates.
- Forgot-password flow now includes OTP generation, OTP validation, and password reset support.
- Password reset data is stored locally in auth storage for the demo auth flow.

This table provides a quick reference for the main files in the project and their roles in the authentication and ERP flow. Use this as a guide for navigation and understanding the structure of the codebase.

---

## Installed Project Config / Setup Files

| File             | What it is used for                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| app.json         | Expo app metadata, app name, slug, scheme, Android/iOS settings, plugin config, EAS extra details |
| eas.json         | EAS build/submit configuration for development, preview, and production builds                    |
| babel.config.js  | Babel preset for Expo and React Native Reanimated plugin                                          |
| metro.config.js  | Metro bundler configuration for the Expo app                                                      |
| tsconfig.json    | TypeScript compiler settings, strict mode, path aliases such as @/\*                              |
| eslint.config.js | Linting configuration using Expo ESLint rules                                                     |
| package.json     | Project scripts, dependencies, and dev dependencies                                               |

---

## Installed NPM Modules

| Type              | Package                                   | Purpose                             |
| ----------------- | ----------------------------------------- | ----------------------------------- |
| Core Expo         | expo                                      | Main Expo framework and runtime     |
| Core Expo         | expo-router                               | File-based routing and navigation   |
| Core React Native | react                                     | React library for the app UI        |
| Core React Native | react-native                              | Native mobile runtime               |
| React Native Web  | react-native-web                          | Web support for the app             |
| Navigation        | @react-navigation/native                  | Core navigation library             |
| Navigation        | @react-navigation/bottom-tabs             | Bottom tab navigation               |
| Navigation        | @react-navigation/elements                | Navigation helpers and UI elements  |
| Storage           | @react-native-async-storage/async-storage | Local storage for auth/session data |
| UI / Icons        | lucide-react-native                       | Icon set used in screens            |
| UI / Effects      | expo-linear-gradient                      | Gradient backgrounds                |
| Media / Image     | expo-image                                | Image rendering support             |
| Media / Image     | expo-image-picker                         | Image selection from device         |
| Files / Sharing   | expo-file-system                          | File-system access                  |
| Files / Sharing   | expo-sharing                              | Sharing files and content           |
| Native APIs       | expo-constants                            | Access to app config and constants  |
| Native APIs       | expo-crypto                               | Secure hashing / UUID generation    |
| Native APIs       | expo-device                               | Device info support                 |
| Native APIs       | expo-font                                 | Font loading support                |
| Native APIs       | expo-splash-screen                        | Splash screen configuration         |
| Native APIs       | expo-status-bar                           | Status bar control                  |
| Native APIs       | expo-system-ui                            | System UI integration               |
| Native APIs       | expo-web-browser                          | Web browser support                 |
| Animation         | react-native-reanimated                   | Smooth animations and gestures      |
| Animation         | react-native-gesture-handler              | Gesture handling                    |
| UI / Layout       | react-native-safe-area-context            | Safe area support                   |
| UI / Layout       | react-native-screens                      | Native screen transitions           |
| UI / Layout       | react-native-svg                          | SVG rendering                       |
| Data / Export     | xlsx                                      | Excel export support                |
| Dev Tools         | @types/react                              | React TypeScript definitions        |
| Dev Tools         | eslint                                    | Linting engine                      |
| Dev Tools         | eslint-config-expo                        | Expo-specific ESLint presets        |
| Dev Tools         | typescript                                | TypeScript compiler and tooling     |
