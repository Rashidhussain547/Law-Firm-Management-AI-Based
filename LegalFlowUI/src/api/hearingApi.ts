import apiAgent from "./apiAgent";

import type {
  CreateHearingRequest,
  Hearing,
  UpdateHearingRequest,
} from "../types/hearing";

const hearingApi = {
  getAll: async (caseId: string): Promise<Hearing[]> => {
    const response = await apiAgent.get<Hearing[]>(
      `/cases/${caseId}/hearings`
    );

    return response.data;
  },

  getById: async (
    caseId: string,
    hearingId: string
  ): Promise<Hearing> => {
    const response = await apiAgent.get<Hearing>(
      `/cases/${caseId}/hearings/${hearingId}`
    );

    return response.data;
  },

  create: async (
    caseId: string,
    request: CreateHearingRequest
  ): Promise<Hearing> => {
    const response = await apiAgent.post<Hearing>(
      `/cases/${caseId}/hearings`,
      request
    );

    return response.data;
  },

  update: async (
    caseId: string,
    hearingId: string,
    request: UpdateHearingRequest
  ): Promise<Hearing> => {
    const response = await apiAgent.put<Hearing>(
      `/cases/${caseId}/hearings/${hearingId}`,
      request
    );

    return response.data;
  },

  delete: async (
    caseId: string,
    hearingId: string
  ): Promise<void> => {
    await apiAgent.delete(
      `/cases/${caseId}/hearings/${hearingId}`
    );
  },
};

export default hearingApi;