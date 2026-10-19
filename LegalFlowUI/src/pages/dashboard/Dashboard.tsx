import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PeopleIcon from "@mui/icons-material/People";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import "./../../theme/theme-variables.css";
import { useNavigate } from "react-router-dom";

import dashboardApi, { type DashboardData } from "../../api/dashboardApi";

import { CaseStatus } from "../../api/caseApi";

import "./Dashboard.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const getHearingDay = (date: string) => {
  const hearing = new Date(date);
  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  if (hearing.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (hearing.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return hearing.toLocaleDateString("en-US", {
    weekday: "short",
  });
};

const getCaseStatusLabel = (status: number) => {
  switch (status) {
    case CaseStatus.Open:
      return "Open";
    case CaseStatus.InProgress:
      return "In Progress";
    case CaseStatus.OnHold:
      return "On Hold";
    case CaseStatus.Won:
      return "Won";
    case CaseStatus.Lost:
      return "Lost";
    case CaseStatus.Closed:
      return "Closed";
    default:
      return "Unknown";
  }
};

const getCaseStatusClass = (status: number) => {
  switch (status) {
    case CaseStatus.Open:
      return "status-open";
    case CaseStatus.InProgress:
      return "status-progress";
    case CaseStatus.OnHold:
      return "status-hold";
    case CaseStatus.Won:
      return "status-won";
    case CaseStatus.Lost:
      return "status-lost";
    case CaseStatus.Closed:
      return "status-closed";
    default:
      return "";
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAssistant = currentUser?.role === "Assistant";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await dashboardApi.getDashboard();

        setDashboard(data);
      } catch (error: any) {
        setError(error?.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const casePercentages = useMemo(() => {
    if (!dashboard) {
      return {
        active: 0,
        pending: 0,
        closed: 0,
      };
    }

    const total =
      dashboard.caseOverview.active +
      dashboard.caseOverview.pending +
      dashboard.caseOverview.closed;

    if (!total) {
      return {
        active: 0,
        pending: 0,
        closed: 0,
      };
    }

    return {
      active: (dashboard.caseOverview.active / total) * 100,
      pending: (dashboard.caseOverview.pending / total) * 100,
      closed: (dashboard.caseOverview.closed / total) * 100,
    };
  }, [dashboard]);

  if (loading) {
    return (
      <Box className="dashboard-loading">
        <CircularProgress size={30} />
        <Typography color="text.secondary">
          Loading your workspace...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="dashboard-page">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboard) {
    return null;
  }

  const totalCases =
    dashboard.caseOverview.active +
    dashboard.caseOverview.pending +
    dashboard.caseOverview.closed;

  return (
    <Box className="dashboard-page">
      {/* HERO */}
      <Box className="dashboard-hero">
        <Box>
          <Box className="dashboard-eyebrow">
            <Box className="dashboard-live-dot" />
            Firm workspace
          </Box>

          <Typography className="dashboard-hero-title">
            {getGreeting()}, {dashboard.firmName}
          </Typography>

          <Typography className="dashboard-hero-subtitle">
            Here's your firm's activity and important updates at a glance.
          </Typography>
        </Box>

        <Box className="dashboard-date-card">
          <Typography className="dashboard-date-label">TODAY</Typography>

          <Typography className="dashboard-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
      </Box>

      {/* STATS */}
      <Box className="dashboard-stats">
        <Card className="stat-card stat-purple">
          <Box className="stat-card-top">
            <Box className="stat-icon">
              <FolderOutlinedIcon />
            </Box>

            <Typography className="stat-caption">CASES</Typography>
          </Box>

          <Typography className="stat-value">
            {dashboard.activeCases}
          </Typography>

          <Typography className="stat-label">Active cases</Typography>

          <Box className="stat-footer">
            <span>{totalCases} total cases</span>

            <ArrowForwardRoundedIcon />
          </Box>
        </Card>

        <Card className="stat-card stat-blue">
          <Box className="stat-card-top">
            <Box className="stat-icon">
              <PeopleIcon />
            </Box>

            <Typography className="stat-caption">CLIENTS</Typography>
          </Box>

          <Typography className="stat-value">
            {dashboard.totalClients}
          </Typography>

          <Typography className="stat-label">Active clients</Typography>

          <Box className="stat-footer">
            <span>Your client portfolio</span>

            <ArrowForwardRoundedIcon />
          </Box>
        </Card>

        <Card className="stat-card stat-orange">
          <Box className="stat-card-top">
            <Box className="stat-icon">
              <EventOutlinedIcon />
            </Box>

            <Typography className="stat-caption">HEARINGS</Typography>
          </Box>

          <Typography className="stat-value">
            {dashboard.hearingsThisWeek}
          </Typography>

          <Typography className="stat-label">This week's hearings</Typography>

          <Box className="stat-footer">
            <span>Scheduled</span>

            <ArrowForwardRoundedIcon />
          </Box>
        </Card>

        <Card className="stat-card stat-green">
          <Box className="stat-card-top">
            <Box className="stat-icon">
              <TaskOutlinedIcon />
            </Box>

            <Typography className="stat-caption">TASKS</Typography>
          </Box>

          <Typography className="stat-value">{dashboard.tasksDue}</Typography>

          <Typography className="stat-label">Tasks due</Typography>

          <Box className="stat-footer">
            <span>Due or overdue</span>

            <ArrowForwardRoundedIcon />
          </Box>
        </Card>
      </Box>

      {/* MAIN GRID */}
      <Box className="dashboard-main-grid">
        {/* CASE OVERVIEW */}
        <Card className="dashboard-panel case-overview-panel">
          <Box className="panel-header">
            <Box>
              <Typography className="panel-title">Case Overview</Typography>

              <Typography className="panel-subtitle">
                Distribution of your firm's cases
              </Typography>
            </Box>

            <Box className="total-case-badge">
              <strong>{totalCases}</strong>
              <span>Total</span>
            </Box>
          </Box>

          <Box className="case-overview-content">
            <Box className="case-donut">
              <Box
                className="case-donut-inner"
                style={{
                  background: `conic-gradient(
                    #4f46e5 0 ${casePercentages.active}%,
                    #f59e0b ${casePercentages.active}% ${
                      casePercentages.active + casePercentages.pending
                    }%,
                    #94a3b8 ${
                      casePercentages.active + casePercentages.pending
                    }% 100%
                  )`,
                }}
              >
                <Box className="case-donut-center">
                  <strong>{totalCases}</strong>
                  <span>Cases</span>
                </Box>
              </Box>
            </Box>

            <Box className="case-breakdown">
              <Box className="case-breakdown-item">
                <Box className="breakdown-label">
                  <span className="legend-dot active" />
                  <span>Active</span>
                </Box>

                <Box>
                  <strong>{dashboard.caseOverview.active}</strong>

                  <span>{Math.round(casePercentages.active)}%</span>
                </Box>
              </Box>

              <Box className="case-breakdown-item">
                <Box className="breakdown-label">
                  <span className="legend-dot pending" />
                  <span>Pending</span>
                </Box>

                <Box>
                  <strong>{dashboard.caseOverview.pending}</strong>

                  <span>{Math.round(casePercentages.pending)}%</span>
                </Box>
              </Box>

              <Box className="case-breakdown-item">
                <Box className="breakdown-label">
                  <span className="legend-dot closed" />
                  <span>Closed</span>
                </Box>

                <Box>
                  <strong>{dashboard.caseOverview.closed}</strong>

                  <span>{Math.round(casePercentages.closed)}%</span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* UPCOMING HEARINGS */}
        <Card className="dashboard-panel">
          <Box className="panel-header">
            <Box>
              <Typography className="panel-title">Upcoming Hearings</Typography>

              <Typography className="panel-subtitle">
                Your next scheduled hearings
              </Typography>
            </Box>

            <EventOutlinedIcon className="panel-header-icon" />
          </Box>

          <Box className="hearings-list">
            {dashboard.upcomingHearings.length === 0 ? (
              <Box className="dashboard-empty">
                <EventOutlinedIcon />
                <strong>No upcoming hearings</strong>
                <span>Your schedule is clear for now.</span>
              </Box>
            ) : (
              dashboard.upcomingHearings.map((hearing) => (
                <Box
                  key={hearing.id}
                  className="hearing-row"
                  onClick={() => navigate(`/hearings?caseId=${hearing.caseId}`)}
                >
                  <Box className="hearing-date-box">
                    <strong>{new Date(hearing.hearingDate).getDate()}</strong>

                    <span>
                      {new Date(hearing.hearingDate).toLocaleDateString(
                        "en-US",
                        { month: "short" },
                      )}
                    </span>
                  </Box>

                  <Box className="hearing-details">
                    <Typography>{hearing.caseTitle}</Typography>

                    <span>{hearing.courtName || "Court not specified"}</span>

                    <Box className="hearing-time">
                      <AccessTimeRoundedIcon />
                      {getHearingDay(hearing.hearingDate)} ·{" "}
                      {formatTime(hearing.hearingDate)}
                    </Box>
                  </Box>

                  <ArrowForwardRoundedIcon className="row-arrow" />
                </Box>
              ))
            )}
          </Box>
        </Card>
      </Box>

      {/* BOTTOM */}
      <Box className="dashboard-bottom-grid">
        {/* RECENT CASES */}
        <Card className="dashboard-panel">
          <Box className="panel-header">
            <Box>
              <Typography className="panel-title">Recent Cases</Typography>

              <Typography className="panel-subtitle">
                Latest cases added to your workspace
              </Typography>
            </Box>

            <Typography className="view-all" onClick={() => navigate("/cases")}>
              View all
              <ArrowForwardRoundedIcon />
            </Typography>
          </Box>

          {dashboard.recentCases.length === 0 ? (
            <Box className="dashboard-empty">
              <FolderOutlinedIcon />
              <strong>No cases yet</strong>
              <span>Create your first case to get started.</span>
            </Box>
          ) : (
            <Box className="recent-cases-list">
              {dashboard.recentCases.map((item) => (
                <Box
                  key={item.id}
                  className="recent-case-row"
                  onClick={() => navigate(`/cases?caseId=${item.id}`)}
                >
                  <Box className="case-file-icon">
                    <DescriptionOutlinedIcon />
                  </Box>

                  <Box className="recent-case-info">
                    <Typography>{item.title}</Typography>

                    <span>
                      {item.caseNumber} · {item.clientName}
                    </span>
                  </Box>

                  <Box className="recent-case-date">
                    {item.openedDate ? formatDate(item.openedDate) : "—"}
                  </Box>

                  <Chip
                    label={getCaseStatusLabel(item.status)}
                    size="small"
                    className={getCaseStatusClass(item.status)}
                  />

                  <ArrowForwardRoundedIcon className="row-arrow" />
                </Box>
              ))}
            </Box>
          )}
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="dashboard-panel quick-actions-panel">
          <Box className="panel-header">
            <Box>
              <Typography className="panel-title">Quick Actions</Typography>

              <Typography className="panel-subtitle">
                Get things done faster
              </Typography>
            </Box>
          </Box>

          <Box className="quick-actions">
            {!isAssistant && (
              <Box className="quick-action" onClick={() => navigate("/cases")}>
                <Box className="quick-action-icon purple">
                  <GavelOutlinedIcon />
                </Box>

                <Box>
                  <strong>Create New Case</strong>

                  <span>Start a new legal matter or View Cases</span>
                </Box>

                <ArrowForwardRoundedIcon />
              </Box>
            )}

            <Box className="quick-action" onClick={() => navigate("/clients")}>
              <Box className="quick-action-icon blue">
                <AddBusinessOutlinedIcon />
              </Box>

              <Box>
                <strong>Add New Client</strong>

                <span>Add someone to your firm or View clients</span>
              </Box>

              <ArrowForwardRoundedIcon />
            </Box>

            <Box
              className="quick-action"
              onClick={() => navigate("/documents")}
            >
              <Box className="quick-action-icon orange">
                <DescriptionOutlinedIcon />
              </Box>

              <Box>
                <strong>Upload Document</strong>

                <span>Add a case document or View document list</span>
              </Box>

              <ArrowForwardRoundedIcon />
            </Box>

            <Box className="quick-action" onClick={() => navigate("/hearings")}>
              <Box className="quick-action-icon green">
                <EventOutlinedIcon />
              </Box>

              <Box>
                <strong>View Hearings</strong>

                <span>Check upcoming hearings</span>
              </Box>

              <ArrowForwardRoundedIcon />
            </Box>

            {isAssistant && (
              <Box className="quick-action" onClick={() => navigate("/tasks")}>
                <Box className="quick-action-icon green">
                  <EventOutlinedIcon />
                </Box>

                <Box>
                  <strong>Create Tasks</strong>

                  <span>Create New Task or View Task</span>
                </Box>

                <ArrowForwardRoundedIcon />
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;
