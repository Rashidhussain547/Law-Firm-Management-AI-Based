import apiAgent from "./apiAgent";

import type { CurrentUser } from "../types/auth";

export type RegisterRequest = {
  firmName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

type RegisterApiResponse = {
  success: boolean;
  message: string;
};

type LoginApiResponse = {
  success: boolean;
  message: string;
  data: LoginResponse;
};

type CurrentUserApiResponse = {
  success: boolean;
  message: string;
  data: CurrentUser;
};

const authApi = {
  register: async (
    request: RegisterRequest
  ): Promise<RegisterApiResponse> => {
    const response =
      await apiAgent.post<RegisterApiResponse>(
        "/Auth/register",
        request
      );

    return response.data;
  },

  login: async (
    request: LoginRequest
  ): Promise<LoginResponse> => {
    const response =
      await apiAgent.post<LoginApiResponse>(
        "/Auth/login",
        request
      );

    return response.data.data;
  },

  getMe: async (): Promise<CurrentUser> => {
    const response =
      await apiAgent.get<CurrentUserApiResponse>(
        "/Auth/me"
      );

    return response.data.data;
  },
};

export default authApi;