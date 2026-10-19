import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import aiApi, { type CaseSummary } from "../../api/aiApi";

import "./CaseSummaryCard.css";

type CaseSummaryCardProps = {
  caseId: string;
};

const CaseSummaryCard = ({
  caseId,
}: CaseSummaryCardProps) => {
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await aiApi.generateCaseSummary(caseId);

      setSummary(result);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to generate AI case summary.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="ai-summary-wrapper">
      {!summary && !loading && (
        <Card className="ai-summary-start-card">
          <CardContent>
            <Box className="ai-summary-start-content">
              <Box className="ai-summary-icon">
                <AutoAwesomeIcon />
              </Box>

              <Box className="ai-summary-start-text">
                <Typography
                  variant="h6"
                  className="ai-summary-start-title"
                >
                  AI Case Summary
                </Typography>

                <Typography
                  variant="body2"
                  className="ai-summary-start-description"
                >
                  Generate an intelligent overview of this case
                  using its details, hearings, tasks, notes and
                  documents.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={generateSummary}
                className="ai-generate-button"
              >
                Generate AI Summary
              </Button>
            </Box>

            {error && (
              <Alert
                severity="error"
                className="ai-summary-error"
              >
                {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="ai-summary-loading-card">
          <CardContent>
            <Box className="ai-summary-loading">
              <CircularProgress size={32} />

              <Box>
                <Typography
                  variant="h6"
                  className="ai-summary-loading-title"
                >
                  Analyzing case...
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  LegalFlow AI is reviewing the available case
                  information.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {summary && !loading && (
        <Card className="ai-summary-card">
          <CardContent>
            {/* HEADER */}
            <Box className="ai-summary-header">
              <Box className="ai-summary-header-left">
                <Box className="ai-summary-icon">
                  <AutoAwesomeIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    className="ai-summary-title"
                  >
                    AI Case Summary
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {summary.caseNumber} · {summary.title}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={generateSummary}
                disabled={loading}
              >
                Regenerate
              </Button>
            </Box>

            <Divider className="ai-summary-divider" />

            {/* OVERVIEW */}
            <Box className="ai-summary-section">
              <Typography className="ai-summary-section-title">
                Overview
              </Typography>

              <Typography
                variant="body2"
                className="ai-summary-overview"
              >
                {summary.overview}
              </Typography>
            </Box>

            {/* KEY ISSUES */}
            <Box className="ai-summary-section">
              <Typography className="ai-summary-section-title">
                Key Issues
              </Typography>

              {summary.keyIssues?.length > 0 ? (
                <Box className="ai-summary-list">
                  {summary.keyIssues.map((issue, index) => (
                    <Box
                      key={`${issue}-${index}`}
                      className="ai-summary-list-item"
                    >
                      <Box className="ai-summary-bullet" />
                      <Typography variant="body2">
                        {issue}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No key issues identified.
                </Typography>
              )}
            </Box>

            {/* CURRENT STATUS */}
            <Box className="ai-summary-section">
              <Typography className="ai-summary-section-title">
                Current Status
              </Typography>

              <Box className="ai-status-box">
                <Typography variant="body2">
                  {summary.currentStatus}
                </Typography>
              </Box>
            </Box>

            {/* IMPORTANT DATES */}
            <Box className="ai-summary-section">
              <Box className="ai-section-heading-with-icon">
                <EventIcon fontSize="small" />

                <Typography className="ai-summary-section-title">
                  Important Dates
                </Typography>
              </Box>

              {summary.importantDates?.length > 0 ? (
                <Box className="ai-summary-list">
                  {summary.importantDates.map((date, index) => (
                    <Box
                      key={`${date}-${index}`}
                      className="ai-summary-list-item"
                    >
                      <Box className="ai-summary-bullet" />

                      <Typography variant="body2">
                        {date}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No important dates identified.
                </Typography>
              )}
            </Box>

            {/* PENDING ACTIONS */}
            <Box className="ai-summary-section">
              <Box className="ai-section-heading-with-icon">
                <AssignmentIcon fontSize="small" />

                <Typography className="ai-summary-section-title">
                  Pending Actions
                </Typography>
              </Box>

              {summary.pendingActions?.length > 0 ? (
                <Box className="ai-summary-list">
                  {summary.pendingActions.map((action, index) => (
                    <Box
                      key={`${action}-${index}`}
                      className="ai-summary-list-item"
                    >
                      <Box className="ai-summary-bullet" />

                      <Typography variant="body2">
                        {action}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No pending actions identified.
                </Typography>
              )}
            </Box>

            {/* POTENTIAL CONCERNS */}
            <Box className="ai-summary-section">
              <Box className="ai-section-heading-with-icon">
                <WarningAmberIcon fontSize="small" />

                <Typography className="ai-summary-section-title">
                  Potential Concerns
                </Typography>
              </Box>

              {summary.potentialConcerns?.length > 0 ? (
                <Box className="ai-summary-list">
                  {summary.potentialConcerns.map(
                    (concern, index) => (
                      <Box
                        key={`${concern}-${index}`}
                        className="ai-summary-list-item"
                      >
                        <Box className="ai-summary-bullet" />

                        <Typography variant="body2">
                          {concern}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No potential concerns identified.
                </Typography>
              )}
            </Box>

            {/* NEXT STEP */}
            <Box className="ai-summary-next-step">
              <Box className="ai-section-heading-with-icon">
                <ArrowForwardIcon fontSize="small" />

                <Typography className="ai-summary-section-title">
                  Recommended Next Step
                </Typography>
              </Box>

              <Typography variant="body2">
                {summary.recommendedNextStep}
              </Typography>
            </Box>

            {/* DISCLAIMER */}
            <Typography
              variant="caption"
              className="ai-summary-disclaimer"
            >
              {summary.disclaimer}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CaseSummaryCard;