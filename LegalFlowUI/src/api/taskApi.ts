import apiAgent from "./apiAgent";

import type {
  CreateTaskRequest,
  FirmUser,
  Task,
  UpdateTaskRequest,
} from "../types/task";

type UsersApiResponse = {
  success: boolean;
  message: string;
  data: FirmUser[];
};

const taskApi = {
  getAll: async (
    caseId: string
  ): Promise<Task[]> => {
    const response = await apiAgent.get<Task[]>(
      `/cases/${caseId}/tasks`
    );

    return response.data;
  },

  getById: async (
    caseId: string,
    taskId: string
  ): Promise<Task> => {
    const response = await apiAgent.get<Task>(
      `/cases/${caseId}/tasks/${taskId}`
    );

    return response.data;
  },

  create: async (
    caseId: string,
    request: CreateTaskRequest
  ): Promise<Task> => {
    const response = await apiAgent.post<Task>(
      `/cases/${caseId}/tasks`,
      request
    );

    return response.data;
  },

  update: async (
    caseId: string,
    taskId: string,
    request: UpdateTaskRequest
  ): Promise<Task> => {
    const response = await apiAgent.put<Task>(
      `/cases/${caseId}/tasks/${taskId}`,
      request
    );

    return response.data;
  },

  delete: async (
    caseId: string,
    taskId: string
  ): Promise<void> => {
    await apiAgent.delete(
      `/cases/${caseId}/tasks/${taskId}`
    );
  },

  getFirmUsers: async (): Promise<FirmUser[]> => {
    const response =
      await apiAgent.get<UsersApiResponse>(
        "/Auth/users"
      );

    return response.data.data;
  },
};

export default taskApi;