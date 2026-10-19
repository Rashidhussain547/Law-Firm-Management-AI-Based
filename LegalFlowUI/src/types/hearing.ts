export const HearingStatus = {
  Scheduled: 1,
  Completed: 2,
  Adjourned: 3,
  Cancelled: 4,
} as const;

export type HearingStatus =
  (typeof HearingStatus)[keyof typeof HearingStatus];

export type Hearing = {
  id: string;
  caseId: string;
  hearingDate: string;
  courtRoom?: string | null;
  purpose?: string | null;
  status: HearingStatus;
  notes?: string | null;
};

export type CreateHearingRequest = {
  hearingDate: string;
  courtRoom?: string | null;
  purpose?: string | null;
  status: HearingStatus;
  notes?: string | null;
};

export type UpdateHearingRequest = {
  hearingDate: string;
  courtRoom?: string | null;
  purpose?: string | null;
  status: HearingStatus;
  notes?: string | null;
};