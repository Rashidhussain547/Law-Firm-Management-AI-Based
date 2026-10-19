export const DocumentType = {
  CourtDocument: 1,
  Contract: 2,
  Evidence: 3,
  LegalNotice: 4,
  ClientDocument: 5,
  Report: 6,
  Other: 99,
} as const;

export type DocumentType =
  (typeof DocumentType)[keyof typeof DocumentType];

export type CaseDocument = {
  id: string;
  caseId: string;
  uploadedById: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  type: DocumentType;
  description?: string | null;
  isAiProcessed: boolean;
  aiSummary?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};