import apiAgent from "./apiAgent";
import type {
  CaseDocument,
  DocumentType,
} from "../types/document";

const documentApi = {
  getAll: async (
    caseId: string
  ): Promise<CaseDocument[]> => {
    const response =
      await apiAgent.get<CaseDocument[]>(
        `/cases/${caseId}/documents`
      );

    return response.data;
  },

  getById: async (
    caseId: string,
    documentId: string
  ): Promise<CaseDocument> => {
    const response =
      await apiAgent.get<CaseDocument>(
        `/cases/${caseId}/documents/${documentId}`
      );

    return response.data;
  },

 upload: async (
  caseId: string,
  file: File,
  type: DocumentType,
  description: string
): Promise<CaseDocument> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("type", type.toString());

  if (description.trim()) {
    formData.append(
      "description",
      description.trim()
    );
  }

  const response =
    await apiAgent.post<CaseDocument>(
      `/cases/${caseId}/documents`,
      formData
    );

  return response.data;
},

  download: async (
    caseId: string,
    documentId: string
  ) => {
    const response = await apiAgent.get(
      `/cases/${caseId}/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );

    return response;
  },

  delete: async (
    caseId: string,
    documentId: string
  ): Promise<void> => {
    await apiAgent.delete(
      `/cases/${caseId}/documents/${documentId}`
    );
  },
};

export default documentApi;