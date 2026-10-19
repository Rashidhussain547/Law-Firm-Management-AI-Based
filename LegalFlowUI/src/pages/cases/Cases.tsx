import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import "./../../theme/theme-variables.css";

import caseApi, {
  CaseType,
  CaseStatus,
  type Case,
  type CreateCaseRequest,
  type UpdateCaseRequest,
} from "../../api/caseApi";

import clientApi, { type Client } from "../../api/clientApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import "./Cases.css";
import { useSearchParams } from "react-router-dom";
import settingsApi, { type FirmUser } from "../../api/settingsApi";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CaseSummaryCard from "../../components/ai/CaseSummaryCard";

type FormData = {
  clientId: string;
  caseNumber: string;
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  courtName: string;
  judgeName: string;
  opposingParty: string;
  openedDate: string;
  closedDate: string;
  assignedLawyerId: string | null;
  assignedAssistantId: string | null;
};

const initialFormData: FormData = {
  clientId: "",
  caseNumber: "",
  title: "",
  description: "",
  type: CaseType.Civil,
  status: CaseStatus.Open,
  courtName: "",
  judgeName: "",
  opposingParty: "",
  openedDate: "",
  closedDate: "",
  assignedLawyerId: null,
  assignedAssistantId: null,
};

const caseTypeLabels: Record<CaseType, string> = {
  [CaseType.Civil]: "Civil",
  [CaseType.Criminal]: "Criminal",
  [CaseType.Corporate]: "Corporate",
  [CaseType.Family]: "Family",
  [CaseType.Property]: "Property",
  [CaseType.Employment]: "Employment",
  [CaseType.Immigration]: "Immigration",
  [CaseType.IntellectualProperty]: "Intellectual Property",
  [CaseType.Other]: "Other",
};

const caseStatusLabels: Record<CaseStatus, string> = {
  [CaseStatus.Open]: "Open",
  [CaseStatus.InProgress]: "In Progress",
  [CaseStatus.OnHold]: "On Hold",
  [CaseStatus.Won]: "Won",
  [CaseStatus.Lost]: "Lost",
  [CaseStatus.Closed]: "Closed",
};

const getCaseTypeLabel = (type: CaseType) => {
  return caseTypeLabels[type] ?? "Other";
};

const getCaseStatusLabel = (status: CaseStatus) => {
  return caseStatusLabels[status] ?? "Open";
};

const getStatusClass = (status: CaseStatus) => {
  switch (status) {
    case CaseStatus.Open:
      return "case-status-open";

    case CaseStatus.InProgress:
      return "case-status-progress";

    case CaseStatus.OnHold:
      return "case-status-hold";

    case CaseStatus.Won:
      return "case-status-won";

    case CaseStatus.Lost:
      return "case-status-lost";

    case CaseStatus.Closed:
      return "case-status-closed";

    default:
      return "";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const datePart = value.split("T")[0];

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const getInputDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.split("T")[0];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }

    if (response?.data?.errors) {
      const messages = Object.values(response.data.errors).flat();

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return fallback;
};

function Cases() {
  const [searchParams] = useSearchParams();
  const highlightedCaseId = searchParams.get("caseId");
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAssistant = currentUser?.role === "Assistant";
  const [users, setUsers] = useState<FirmUser[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [formError, setFormError] = useState("");

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const lawyers = useMemo(() => {
    return users.filter((user) => user.role === "Lawyer" && user.isActive);
  }, [users]);

  const assistants = useMemo(() => {
    if (!formData.assignedLawyerId) {
      return [];
    }

    return users.filter(
      (user) =>
        user.role === "Assistant" &&
        user.isActive &&
        // ReportsToUserId frontend FirmUser mein add hona chahiye
        user.reportsToUserId === formData.assignedLawyerId,
    );
  }, [users, formData.assignedLawyerId]);

  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();

    clients.forEach((client) => {
      map.set(client.id, client);
    });

    return map;
  }, [clients]);

  const getClientName = (clientId: string) => {
    const client = clientMap.get(clientId);

    if (!client) {
      return "Unknown Client";
    }

    return `${client.firstName} ${client.lastName}`;
  };

  const filteredCases = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return cases;
    }

    return cases.filter((item) => {
      const clientName = getClientName(item.clientId).toLowerCase();

      return (
        item.caseNumber.toLowerCase().includes(searchValue) ||
        item.title.toLowerCase().includes(searchValue) ||
        clientName.includes(searchValue) ||
        getCaseTypeLabel(item.type).toLowerCase().includes(searchValue) ||
        getCaseStatusLabel(item.status).toLowerCase().includes(searchValue) ||
        item.courtName?.toLowerCase().includes(searchValue)
      );
    });
  }, [cases, search, clientMap]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [casesResponse, clientsResponse, usersResponse] = await Promise.all(
        [caseApi.getAll(), clientApi.getAll(), settingsApi.getUsers()],
      );

      setCases(casesResponse);
      setClients(clientsResponse);
      setUsers(usersResponse);
    } catch (error) {
      setNotification({
        open: true,
        message: getErrorMessage(error, "Failed to load cases."),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!loading && highlightedCaseId && cases.length > 0) {
      const targetRow = rowRefs.current[highlightedCaseId];
      if (targetRow) {
        // Smooth scroll center position par le jayega
        targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading, highlightedCaseId, cases]);

  const openCreateDialog = () => {
    setEditingCase(null);

    const isLawyer = currentUser?.role === "Lawyer";

    setFormData({
      ...initialFormData,

      openedDate: new Date().toISOString().split("T")[0],

      assignedLawyerId: isLawyer ? currentUser.userId : null,

      assignedAssistantId: null,
    });

    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (item: Case) => {
    setEditingCase(item);

    setFormData({
      clientId: item.clientId,
      caseNumber: item.caseNumber,
      title: item.title,
      description: item.description ?? "",
      type: item.type,
      status: item.status,
      courtName: item.courtName ?? "",
      judgeName: item.judgeName ?? "",
      opposingParty: item.opposingParty ?? "",
      openedDate: getInputDate(item.openedDate),
      closedDate: getInputDate(item.closedDate),

      // Preserve the existing lawyer assignment.
      // Proper lawyer dropdown will be added with Users API.
      assignedLawyerId: item.assignedLawyerId ?? null,
      assignedAssistantId: item.assignedAssistantId ?? null,
    });

    setFormError("");
    setDialogOpen(true);
  };

  const handleLawyerChange = (lawyerId: string) => {
    setFormData((previous) => ({
      ...previous,
      assignedLawyerId: lawyerId || null,
      assignedAssistantId: null,
    }));
  };

  const openViewDialog = (item: Case) => {
    setSelectedCase(item);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (item: Case) => {
    setSelectedCase(item);
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.clientId) {
      return "Please select a client.";
    }

    if (!formData.caseNumber.trim()) {
      return "Case number is required.";
    }

    if (!formData.title.trim()) {
      return "Case title is required.";
    }

    if (!formData.type) {
      return "Case type is required.";
    }

    if (
      formData.closedDate &&
      formData.openedDate &&
      formData.closedDate < formData.openedDate
    ) {
      return "Closed date cannot be before opened date.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingCase) {
        const request: UpdateCaseRequest = {
          clientId: formData.clientId,
          assignedLawyerId: formData.assignedLawyerId,
          assignedAssistantId: formData.assignedAssistantId,

          caseNumber: formData.caseNumber.trim(),

          title: formData.title.trim(),

          description: formData.description.trim() || null,

          type: formData.type,

          status: formData.status,

          courtName: formData.courtName.trim() || null,

          judgeName: formData.judgeName.trim() || null,

          opposingParty: formData.opposingParty.trim() || null,

          openedDate: formData.openedDate || null,

          closedDate: formData.closedDate || null,
        };

        await caseApi.update(editingCase.id, request);

        setNotification({
          open: true,
          message: "Case updated successfully.",
          severity: "success",
        });
      } else {
        const request: CreateCaseRequest = {
          clientId: formData.clientId,

          assignedLawyerId: formData.assignedLawyerId,
          assignedAssistantId: formData.assignedAssistantId,
          caseNumber: formData.caseNumber.trim(),

          title: formData.title.trim(),

          description: formData.description.trim() || null,

          type: formData.type,

          courtName: formData.courtName.trim() || null,

          judgeName: formData.judgeName.trim() || null,

          opposingParty: formData.opposingParty.trim() || null,

          openedDate: formData.openedDate || null,
        };

        await caseApi.create(request);

        setNotification({
          open: true,
          message: "Case created successfully.",
          severity: "success",
        });
      }

      setDialogOpen(false);
      setEditingCase(null);

      await loadData();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingCase ? "Failed to update case." : "Failed to create case.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCase) {
      return;
    }

    try {
      setSaving(true);

      await caseApi.delete(selectedCase.id);

      setDeleteDialogOpen(false);

      setNotification({
        open: true,
        message: "Case deleted successfully.",
        severity: "success",
      });

      setSelectedCase(null);

      await loadData();
    } catch (error) {
      setNotification({
        open: true,
        message: getErrorMessage(error, "Failed to delete case."),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  

  return (
    <Box className="cases-page">
      {/* Page Header */}
      <Box className="cases-header">
        <Box>
          <Typography variant="h4" className="cases-title">
            Cases
          </Typography>

          <Typography variant="body2" className="cases-subtitle">
            Manage your firm's cases and legal matters.
          </Typography>
        </Box>

        {!isAssistant && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            New Case
          </Button>
        )}
      </Box>

      {/* Summary */}
      <Box className="case-summary-grid">
        <Card className="case-summary-card">
          <CardContent>
            <Box className="summary-icon summary-icon-total">
              <GavelOutlinedIcon />
            </Box>

            <Typography variant="body2" className="summary-label">
              Total Cases
            </Typography>

            <Typography variant="h4" className="summary-value">
              {cases.length}
            </Typography>
          </CardContent>
        </Card>

        <Card className="case-summary-card">
          <CardContent>
            <Box className="summary-icon summary-icon-open">
              <GavelOutlinedIcon />
            </Box>

            <Typography variant="body2" className="summary-label">
              Open
            </Typography>

            <Typography variant="h4" className="summary-value">
              {cases.filter((item) => item.status === CaseStatus.Open).length}
            </Typography>
          </CardContent>
        </Card>

        <Card className="case-summary-card">
          <CardContent>
            <Box className="summary-icon summary-icon-progress">
              <GavelOutlinedIcon />
            </Box>

            <Typography variant="body2" className="summary-label">
              In Progress
            </Typography>

            <Typography variant="h4" className="summary-value">
              {
                cases.filter((item) => item.status === CaseStatus.InProgress)
                  .length
              }
            </Typography>
          </CardContent>
        </Card>

        <Card className="case-summary-card">
          <CardContent>
            <Box className="summary-icon summary-icon-closed">
              <GavelOutlinedIcon />
            </Box>

            <Typography variant="body2" className="summary-label">
              Closed
            </Typography>

            <Typography variant="h4" className="summary-value">
              {cases.filter((item) => item.status === CaseStatus.Closed).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Card */}
      <Card className="cases-table-card">
        <CardContent className="cases-table-card-content">
          {/* Toolbar */}
          <Box className="cases-toolbar">
            <Box className="cases-search">
              <SearchIcon className="cases-search-icon" />

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search cases..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="cases-search-input"
              />
            </Box>

            <Typography variant="body2" className="case-count-text">
              {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {/* Loading */}
          {loading ? (
            <Box className="cases-loading">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading cases...
              </Typography>
            </Box>
          ) : filteredCases.length === 0 ? (
            /* Empty */
            <Box className="cases-empty">
              <Box className="empty-icon">
                <GavelOutlinedIcon />
              </Box>

              <Typography variant="h6" className="empty-title">
                {search ? "No cases found" : "No cases yet"}
              </Typography>

              <Typography variant="body2" className="empty-description">
                {search
                  ? "Try changing your search."
                  : "Create your first case to get started."}
              </Typography>

              {!search && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                >
                  Create Case
                </Button>
              )}
            </Box>
          ) : (
            /* Table */
            <TableContainer>
              <Table className="cases-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Case</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Lawyer</TableCell>
                    <TableCell>Assistant</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Court</TableCell>
                    <TableCell>Opened</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredCases.map((item) => {
                    const isTargeted = item.id === highlightedCaseId;
                    const isClosed = item.status === CaseStatus.Closed;

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        ref={(el) => {
                          rowRefs.current[item.id] = el;
                        }}
                        className={isTargeted ? "highlighted-case-row" : ""}
                        sx={{ transition: "all 0.3s ease" }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" className="case-number">
                              {item.caseNumber}
                            </Typography>

                            <Typography
                              variant="body2"
                              className="case-row-title"
                            >
                              {item.title}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" className="client-name">
                            {getClientName(item.clientId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="client-name">
                            {item.assignedLawyerName || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.assignedAssistantName || "No assistant"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getCaseTypeLabel(item.type)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={getCaseStatusLabel(item.status)}
                            size="small"
                            className={getStatusClass(item.status)}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.courtName || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(item.openedDate)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box className="case-actions">
                            <IconButton
                              size="small"
                              title="View"
                              onClick={() => openViewDialog(item)}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>

                            {!isAssistant && (
                              <>
                                <IconButton
                                  onClick={() => openEditDialog(item)}
                                  disabled={isClosed}
                                >
                                  <EditOutlinedIcon />
                                </IconButton>

                                <IconButton
                                  onClick={() => openDeleteDialog(item)}
                                  disabled={isClosed}
                                >
                                  <DeleteOutlineOutlinedIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle className="dialog-title">
          <Box>
            <Typography variant="h6">
              {editingCase ? "Edit Case" : "Create New Case"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {editingCase
                ? "Update the case information below."
                : "Enter the details for the new case."}
            </Typography>
          </Box>

          <IconButton onClick={() => setDialogOpen(false)} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" className="form-error">
              {formError}
            </Alert>
          )}

          <Box className="case-form">
            <Box className="form-field-full">
              <TextField
                select
                fullWidth
                label="Client"
                value={formData.clientId}
                onChange={(event) =>
                  handleFormChange("clientId", event.target.value)
                }
                required
              >
                <MenuItem value="">Select client</MenuItem>

                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                    {!client.isActive ? " (Inactive)" : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              fullWidth
              label="Case Number"
              placeholder="e.g. CASE-2026-001"
              value={formData.caseNumber}
              onChange={(event) =>
                handleFormChange("caseNumber", event.target.value)
              }
              required
            />

            <TextField
              fullWidth
              label="Case Title"
              placeholder="Enter case title"
              value={formData.title}
              onChange={(event) =>
                handleFormChange("title", event.target.value)
              }
              required
            />

            <TextField
              select
              fullWidth
              label="Case Type"
              value={formData.type}
              onChange={(event) =>
                handleFormChange("type", Number(event.target.value))
              }
              required
            >
              {Object.entries(caseTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Assigned Lawyer"
              value={formData.assignedLawyerId ?? ""}
              onChange={(event) => handleLawyerChange(event.target.value)}
              disabled={currentUser?.role === "Lawyer"}
              required
            >
              {currentUser?.role === "Admin" && (
                <MenuItem value="">Select lawyer</MenuItem>
              )}

              {lawyers.map((lawyer) => (
                <MenuItem key={lawyer.id} value={lawyer.id}>
                  {lawyer.firstName} {lawyer.lastName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Assigned Assistant"
              value={formData.assignedAssistantId ?? ""}
              onChange={(event) =>
                handleFormChange("assignedAssistantId", event.target.value)
              }
              disabled={!formData.assignedLawyerId || assistants.length === 0}
            >
              <MenuItem value="">No assistant</MenuItem>

              {assistants.map((assistant) => (
                <MenuItem key={assistant.id} value={assistant.id}>
                  {assistant.firstName} {assistant.lastName}
                </MenuItem>
              ))}
            </TextField>
            {editingCase && (
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(event) =>
                  handleFormChange("status", Number(event.target.value))
                }
              >
                {Object.entries(caseStatusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              fullWidth
              label="Court Name"
              placeholder="e.g. Lahore High Court"
              value={formData.courtName}
              onChange={(event) =>
                handleFormChange("courtName", event.target.value)
              }
            />

            <TextField
              fullWidth
              label="Judge Name"
              placeholder="Enter judge name"
              value={formData.judgeName}
              onChange={(event) =>
                handleFormChange("judgeName", event.target.value)
              }
            />

            <TextField
              fullWidth
              label="Opposing Party"
              placeholder="Enter opposing party"
              value={formData.opposingParty}
              onChange={(event) =>
                handleFormChange("opposingParty", event.target.value)
              }
            />

            <TextField
              fullWidth
              label="Opened Date"
              type="date"
              value={formData.openedDate}
              onChange={(event) =>
                handleFormChange("openedDate", event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            {editingCase && (
              <TextField
                fullWidth
                label="Closed Date"
                type="date"
                value={formData.closedDate}
                onChange={(event) =>
                  handleFormChange("closedDate", event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}

            <Box className="form-field-full">
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                placeholder="Describe the case..."
                value={formData.description}
                onChange={(event) =>
                  handleFormChange("description", event.target.value)
                }
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingCase ? (
              "Update Case"
            ) : (
              "Create Case"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle className="dialog-title">
          <Box>
            <Typography variant="h6">Case Details</Typography>

            {selectedCase && (
              <Typography variant="body2" color="text.secondary">
                {selectedCase.caseNumber}
              </Typography>
            )}
          </Box>

          <IconButton onClick={() => setViewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {selectedCase && (
          <DialogContent dividers>
            <Box className="case-details-grid">
              <Box className="case-detail">
                <Typography className="detail-label">Case Number</Typography>
                <Typography className="detail-value">
                  {selectedCase.caseNumber}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Client</Typography>
                <Typography className="detail-value">
                  {getClientName(selectedCase.clientId)}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">
                  Assigned Lawyer
                </Typography>

                <Typography className="detail-value">
                  {selectedCase.assignedLawyerName || "-"}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">
                  Assigned Assistant
                </Typography>

                <Typography className="detail-value">
                  {selectedCase.assignedAssistantName ||
                    "No assistant assigned"}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Title</Typography>
                <Typography className="detail-value">
                  {selectedCase.title}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Type</Typography>
                <Typography className="detail-value">
                  {getCaseTypeLabel(selectedCase.type)}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Status</Typography>
                <Box>
                  <Chip
                    label={getCaseStatusLabel(selectedCase.status)}
                    size="small"
                    className={getStatusClass(selectedCase.status)}
                  />
                </Box>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Court</Typography>
                <Typography className="detail-value">
                  {selectedCase.courtName || "-"}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Judge</Typography>
                <Typography className="detail-value">
                  {selectedCase.judgeName || "-"}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Opposing Party</Typography>
                <Typography className="detail-value">
                  {selectedCase.opposingParty || "-"}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Opened Date</Typography>
                <Typography className="detail-value">
                  {formatDate(selectedCase.openedDate)}
                </Typography>
              </Box>

              <Box className="case-detail">
                <Typography className="detail-label">Closed Date</Typography>
                <Typography className="detail-value">
                  {formatDate(selectedCase.closedDate)}
                </Typography>
              </Box>

              <Box className="case-detail case-detail-full">
                <Typography className="detail-label">Description</Typography>
                <Typography className="detail-value description-value">
                  {selectedCase.description || "No description provided."}
                </Typography>
              </Box>
              <CaseSummaryCard caseId={selectedCase.id} />
            </Box>
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>

          {selectedCase && (
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                openEditDialog(selectedCase);
              }}
              disabled={isAssistant || selectedCase.status === CaseStatus.Closed}
            >
              Edit Case
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!saving) {
            setDeleteDialogOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Case</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{selectedCase?.caseNumber}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3500}
        onClose={() =>
          setNotification((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() =>
            setNotification((previous) => ({
              ...previous,
              open: false,
            }))
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default Cases;
