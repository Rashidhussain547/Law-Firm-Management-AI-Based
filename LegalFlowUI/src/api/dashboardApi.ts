import apiAgent from "./apiAgent";

export type CaseOverview = {
  active: number;
  pending: number;
  closed: number;
};

export type UpcomingHearing = {
  id: string;
  caseId: string;
  hearingDate: string;
  caseNumber: string;
  caseTitle: string;
  courtName?: string | null;
  courtRoom?: string | null;
  status: number;
};

export type RecentCase = {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: number;
  openedDate?: string | null;
};

export type DashboardData = {
  firmName: string;
  activeCases: number;
  totalClients: number;
  hearingsThisWeek: number;
  tasksDue: number;
  caseOverview: CaseOverview;
  upcomingHearings: UpcomingHearing[];
  recentCases: RecentCase[];
};

type DashboardApiResponse = {
  success: boolean;
  message: string;
  data: DashboardData;
};

const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response =
      await apiAgent.get<DashboardApiResponse>(
        "/Dashboard"
      );

    return response.data.data;
  },
};

export default dashboardApi;