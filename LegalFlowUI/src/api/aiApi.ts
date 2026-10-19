import axios from "axios";

const API_BASE_URL = "http://localhost:5130/api";

export type CaseSummary = {
  caseId: string;
  caseNumber: string;
  title: string;
  overview: string;
  keyIssues: string[];
  currentStatus: string;
  importantDates: string[];
  pendingActions: string[];
  potentialConcerns: string[];
  recommendedNextStep: string;
  disclaimer: string;
};

export type DocumentAnalysis = {
  documentId: string;
  caseId: string;
  fileName: string;
  documentType: string;
  summary: string;
  keyPoints: string[];
  importantDates: string[];
  parties: string[];
  potentialIssues: string[];
  importantClauses: string[];
  recommendedAction: string;
  disclaimer: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("legalflow-token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const generateDocumentAnalysis = async (
  caseId: string,
  documentId: string,
): Promise<DocumentAnalysis> => {
  const token =
    localStorage.getItem("legalflow-token");

  const response =
    await axios.post<ApiResponse<DocumentAnalysis>>(
      `${API_BASE_URL}/Ai/cases/${caseId}/documents/${documentId}/analyze`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data.data;
};

const aiApi = {
  generateCaseSummary: async (
    caseId: string,
  ): Promise<CaseSummary> => {
    const response = await axios.get<ApiResponse<CaseSummary>>(
      `${API_BASE_URL}/Ai/cases/${caseId}/summary`,
      {
        headers: getAuthHeaders(),
      },
    );

    return response.data.data;
  },
  generateDocumentAnalysis
};



export default aiApi;