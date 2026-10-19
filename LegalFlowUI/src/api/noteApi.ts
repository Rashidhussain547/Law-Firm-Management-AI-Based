import apiAgent from "./apiAgent";

import type {
  CaseNote,
  CreateCaseNoteRequest,
  UpdateCaseNoteRequest,
} from "../types/note";

const noteApi = {
  getAll: async (
    caseId: string
  ): Promise<CaseNote[]> => {
    const response =
      await apiAgent.get<CaseNote[]>(
        `/cases/${caseId}/notes`
      );

    return response.data;
  },

  getById: async (
    caseId: string,
    noteId: string
  ): Promise<CaseNote> => {
    const response =
      await apiAgent.get<CaseNote>(
        `/cases/${caseId}/notes/${noteId}`
      );

    return response.data;
  },

  create: async (
    caseId: string,
    request: CreateCaseNoteRequest
  ): Promise<CaseNote> => {
    const response =
      await apiAgent.post<CaseNote>(
        `/cases/${caseId}/notes`,
        request
      );

    return response.data;
  },

  update: async (
    caseId: string,
    noteId: string,
    request: UpdateCaseNoteRequest
  ): Promise<CaseNote> => {
    const response =
      await apiAgent.put<CaseNote>(
        `/cases/${caseId}/notes/${noteId}`,
        request
      );

    return response.data;
  },

  delete: async (
    caseId: string,
    noteId: string
  ): Promise<void> => {
    await apiAgent.delete(
      `/cases/${caseId}/notes/${noteId}`
    );
  },
};

export default noteApi;