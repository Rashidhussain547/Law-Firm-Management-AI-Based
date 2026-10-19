import apiAgent from "./apiAgent";

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
};

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Lawyer" | "Assistant";
  reportsToUserId: string | null;
};

export type FirmUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  reportsToUserId: string | null;
};

type ApiResponse = {
  success: boolean;
  message: string;
};

type GetUsersResponse = {
  success: boolean;
  message: string;
  data: FirmUser[];
};

const settingsApi = {
  changePassword: async (
    request: ChangePasswordRequest
  ): Promise<ApiResponse> => {
    const response = await apiAgent.post<ApiResponse>(
      "/Auth/change-password",
      request
    );

    return response.data;
  },

  updateProfile: async (
    request: UpdateProfileRequest
  ): Promise<ApiResponse> => {
    const response = await apiAgent.put<ApiResponse>(
      "/Auth/profile",
      request
    );

    return response.data;
  },

  getUsers: async (): Promise<FirmUser[]> => {
    const response = await apiAgent.get<GetUsersResponse>(
      "/Auth/users"
    );

    return response.data.data;
  },

  createUser: async (
    request: CreateUserRequest
  ): Promise<ApiResponse> => {
    const response = await apiAgent.post<ApiResponse>(
      "/Auth/users",
      request
    );

    return response.data;
  },
};

export default settingsApi;