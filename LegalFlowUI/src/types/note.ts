export type CaseNote = {
  id: string;
  caseId: string;
  createdById: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type CreateCaseNoteRequest = {
  content: string;
};

export type UpdateCaseNoteRequest = {
  content: string;
};