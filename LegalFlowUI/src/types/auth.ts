export type UserRole =
  | "Admin"
  | "Lawyer"
  | "Assistant";

export type CurrentUser = {
  userId: string;
  firmId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};