export type UserRole = "student" | "staff" | "admin";

export type UserProfile = {  avatar?: string;  phone?: string;  address?: string;  dob?: string;  bloodGroup?: string;  department?: string;
  subject?: string;
  yearSection?: string;
  parentName?: string;
  parentPhone?: string;
};

export type StoredUser = {  id: string;  role: UserRole;  name: string;  email: string;  loginId: string;  passwordHash: string;
} & UserProfile;

export type Session = {  token: string;  userId: string;  role: UserRole;  expiresAt: number;};
export type AuthUser = {  id: string;  role: UserRole;  name: string;  email: string;  loginId: string;} & UserProfile;

export type ProfileUpdate = Partial<
  Pick<
    StoredUser,
    | "name"
    | "email"
    | "avatar"
    | "phone"
    | "address"
    | "dob"
    | "bloodGroup"
    | "department"
    | "subject"
    | "yearSection"
    | "parentName"
    | "parentPhone"
  >
>;

export type SignUpInput = {  name: string;  email: string;  loginId: string;  role: UserRole;  password: string;  department?: string;subject?: string;
};
