import apiAgent from "./apiAgent";


export const CaseType = {
  Civil: 1,
  Criminal: 2,
  Corporate: 3,
  Family: 4,
  Property: 5,
  Employment: 6,
  Immigration: 7,
  IntellectualProperty: 8,
  Other: 99,
} as const;

export type CaseType =
  (typeof CaseType)[keyof typeof CaseType];


export const CaseStatus = {
  Open: 1,
  InProgress: 2,
  OnHold: 3,
  Won: 4,
  Lost: 5,
  Closed: 6,
} as const;

export type CaseStatus =
  (typeof CaseStatus)[keyof typeof CaseStatus];


export type Case = {
  id: string;
  clientId: string;

  assignedLawyerId: string | null;
  assignedLawyerName: string | null;

  assignedAssistantId: string | null;
  assignedAssistantName: string | null;

  caseNumber: string;
  title: string;
  description: string | null;

  type: CaseType;
  status: CaseStatus;

  courtName: string | null;
  judgeName: string | null;
  opposingParty: string | null;

  openedDate: string | null;
  closedDate: string | null;
};


export type CreateCaseRequest = {
  clientId: string;
  assignedLawyerId: string | null;
  assignedAssistantId: string | null;

  caseNumber: string;
  title: string;
  description: string | null;
  type: CaseType;

  courtName: string | null;
  judgeName: string | null;
  opposingParty: string | null;

  openedDate: string | null;
};


export type UpdateCaseRequest = {
  clientId: string;
  assignedLawyerId: string | null;
  assignedAssistantId: string | null;

  caseNumber: string;
  title: string;
  description: string | null;
  type: CaseType;
  status: CaseStatus;

  courtName: string | null;
  judgeName: string | null;
  opposingParty: string | null;

  openedDate: string | null;
  closedDate: string | null;
};


const caseApi = {
  getAll: async (): Promise<Case[]> => {
    const response =
      await apiAgent.get<Case[]>("/Cases");

    return response.data;
  },

  getById: async (
    id: string
  ): Promise<Case> => {
    const response =
      await apiAgent.get<Case>(
        `/Cases/${id}`
      );

    return response.data;
  },

  create: async (
    request: CreateCaseRequest
  ): Promise<Case> => {
    const response =
      await apiAgent.post<Case>(
        "/Cases",
        request
      );

    return response.data;
  },

  update: async (
    id: string,
    request: UpdateCaseRequest
  ): Promise<Case> => {
    const response =
      await apiAgent.put<Case>(
        `/Cases/${id}`,
        request
      );

    return response.data;
  },

  delete: async (
    id: string
  ): Promise<void> => {
    await apiAgent.delete(
      `/Cases/${id}`
    );
  },
};


export default caseApi;