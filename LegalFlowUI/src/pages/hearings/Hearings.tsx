import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import "./../../theme/theme-variables.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GavelIcon from "@mui/icons-material/Gavel";
import SearchIcon from "@mui/icons-material/Search";

import hearingApi from "../../api/hearingApi";
import caseApi, { CaseStatus } from "../../api/caseApi";

import {
  HearingStatus,
  type Hearing,
  type CreateHearingRequest,
  type UpdateHearingRequest,
} from "../../types/hearing";

import "./Hearings.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

type CaseItem = {
  id: string;
  title: string;
  caseNumber?: string | null;
    status: CaseStatus;
};

type HearingForm = {
  hearingDate: string;
  courtRoom: string;
  purpose: string;
  status: HearingStatus;
  notes: string;
};

const emptyForm: HearingForm = {
  hearingDate: "",
  courtRoom: "",
  purpose: "",
  status: HearingStatus.Scheduled,
  notes: "",
};

const getStatusLabel = (status: HearingStatus) => {
  switch (status) {
    case HearingStatus.Scheduled:
      return "Scheduled";

    case HearingStatus.Completed:
      return "Completed";

    case HearingStatus.Adjourned:
      return "Adjourned";

    case HearingStatus.Cancelled:
      return "Cancelled";

    default:
      return "Scheduled";
  }
};

const formatHearingDate = (date: string) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (date: string) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  const day = String(parsedDate.getDate()).padStart(2, "0");

  const hours = String(parsedDate.getHours()).padStart(2, "0");

  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const Hearings = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [hearings, setHearings] = useState<Hearing[]>([]);

  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingHearings, setLoadingHearings] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);

  const [form, setForm] = useState<HearingForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAssistant = currentUser?.role === "Assistant";
  const loadCases = async () => {
    setLoadingCases(true);
    setError("");

    try {
      const data = await caseApi.getAll();

      setCases(data);

      const params = new URLSearchParams(window.location.search);
      const caseIdFromUrl = params.get("caseId");

      if (caseIdFromUrl) {
        setSelectedCaseId(caseIdFromUrl);
      } else if (data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load cases.");
    } finally {
      setLoadingCases(false);
    }
  };

  const loadHearings = async (caseId: string) => {
    if (!caseId) {
      setHearings([]);
      return;
    }

    setLoadingHearings(true);
    setError("");

    try {
      const data = await hearingApi.getAll(caseId);

      setHearings(data);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load hearings.");

      setHearings([]);
    } finally {
      setLoadingHearings(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadHearings(selectedCaseId);
    }
  }, [selectedCaseId]);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId),
    [cases, selectedCaseId],
  );

  const filteredHearings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return hearings;
    }

    return hearings.filter((hearing) => {
      const status = getStatusLabel(hearing.status).toLowerCase();

      return (
        hearing.courtRoom?.toLowerCase().includes(searchValue) ||
        hearing.purpose?.toLowerCase().includes(searchValue) ||
        hearing.notes?.toLowerCase().includes(searchValue) ||
        status.includes(searchValue)
      );
    });
  }, [hearings, search]);

  const handleOpenCreate = () => {
    setSelectedHearing(null);

    setForm({
      ...emptyForm,
    });

    setDialogOpen(true);
  };

  const handleOpenEdit = (hearing: Hearing) => {
    setSelectedHearing(hearing);

    setForm({
      hearingDate: toDateTimeLocal(hearing.hearingDate),
      courtRoom: hearing.courtRoom ?? "",
      purpose: hearing.purpose ?? "",
      status: hearing.status,
      notes: hearing.notes ?? "",
    });

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setSelectedHearing(null);
    setForm({
      ...emptyForm,
    });
  };

  const handleFormChange = (
    field: keyof HearingForm,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCaseId) {
      setError("Please select a case.");
      return;
    }

    if (!form.hearingDate) {
      setError("Hearing date is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      /*
       * datetime-local produces an unspecified local
       * date/time. Convert it to an ISO string before
       * sending to the API.
       */
      const hearingDate = new Date(form.hearingDate).toISOString();

      if (selectedHearing) {
        const request: UpdateHearingRequest = {
          hearingDate,
          courtRoom: form.courtRoom.trim() || null,
          purpose: form.purpose.trim() || null,
          status: form.status,
          notes: form.notes.trim() || null,
        };

        await hearingApi.update(selectedCaseId, selectedHearing.id, request);
      } else {
        const request: CreateHearingRequest = {
          hearingDate,
          courtRoom: form.courtRoom.trim() || null,
          purpose: form.purpose.trim() || null,
          status: form.status,
          notes: form.notes.trim() || null,
        };

        await hearingApi.create(selectedCaseId, request);
      }

      await loadHearings(selectedCaseId);

      setDialogOpen(false);
      setSelectedHearing(null);
      setForm({
        ...emptyForm,
      });
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to save hearing.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (hearing: Hearing) => {
    setSelectedHearing(hearing);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedHearing(null);
  };

  const handleDelete = async () => {
    if (!selectedCaseId || !selectedHearing) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await hearingApi.delete(selectedCaseId, selectedHearing.id);

      await loadHearings(selectedCaseId);

      setDeleteDialogOpen(false);
      setSelectedHearing(null);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to delete hearing.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="hearings-page">
      <Box className="hearings-header">
        <Box>
          <Typography variant="h4" className="hearings-title">
            Hearings
          </Typography>

          <Typography variant="body2" className="hearings-subtitle">
            Schedule and manage hearings for your cases.
          </Typography>
        </Box>

        {!isAssistant && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!selectedCaseId}
          >
            Add Hearing
          </Button>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          className="hearings-alert"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Card className="hearings-toolbar-card">
        <CardContent className="hearings-toolbar">
          <TextField
            select
            label="Select case"
            value={selectedCaseId}
            onChange={(event) => setSelectedCaseId(event.target.value)}
            className="hearing-case-select"
            disabled={loadingCases || cases.length === 0}
          >
            {cases
            .filter((item) => item.status !== CaseStatus.Closed)
            .map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.caseNumber
                  ? `${item.caseNumber} - ${item.title}`
                  : item.title}
              </MenuItem>
            ))}
          </TextField>

          <Box className="hearing-search-wrapper">
            <SearchIcon className="hearing-search-icon" />

            <TextField
              fullWidth
              placeholder="Search hearings..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="hearing-search"
            />
          </Box>
        </CardContent>
      </Card>

      <Box className="selected-case-info">
        <Box className="selected-case-icon">
          <GavelIcon />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Hearings for
          </Typography>

          <Typography variant="h6" className="selected-case-title">
            {selectedCase?.caseNumber
              ? `${selectedCase.caseNumber} - ${selectedCase.title}`
              : selectedCase?.title || "No case selected"}
          </Typography>
        </Box>
      </Box>

      <Card className="hearings-table-card">
        {loadingCases || loadingHearings ? (
          <Box className="hearings-loading">
            <CircularProgress />

            <Typography variant="body2" color="text.secondary">
              Loading hearings...
            </Typography>
          </Box>
        ) : cases.length === 0 ? (
          <Box className="hearings-empty">
            <GavelIcon className="empty-icon" />

            <Typography variant="h6" className="empty-title">
              No cases available
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Create a case first before adding hearings.
            </Typography>
          </Box>
        ) : filteredHearings.length === 0 ? (
          <Box className="hearings-empty">
            <GavelIcon className="empty-icon" />

            <Typography variant="h6" className="empty-title">
              No hearings found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {search
                ? "Try changing your search."
                : "This case does not have any hearings yet."}
            </Typography>

            {!search && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                className="empty-action"
              >
                Add First Hearing
              </Button>
            )}
          </Box>
        ) : (
          <Box className="hearings-table">
            <Box className="hearing-row hearing-row-header">
              <Typography>Date & Time</Typography>
              <Typography>Purpose</Typography>
              <Typography>Court Room</Typography>
              <Typography>Status</Typography>
              <Typography>Notes</Typography>
              <Typography>Actions</Typography>
            </Box>

            {filteredHearings.map((hearing) => (
              <Box className="hearing-row" key={hearing.id}>
                <Box>
                  <Typography className="hearing-date">
                    {formatHearingDate(hearing.hearingDate)}
                  </Typography>
                </Box>

                <Typography className="hearing-cell-text">
                  {hearing.purpose || "-"}
                </Typography>

                <Typography className="hearing-cell-text">
                  {hearing.courtRoom || "-"}
                </Typography>

                <Box>
                  <span className={`hearing-status status-${hearing.status}`}>
                    {getStatusLabel(hearing.status)}
                  </span>
                </Box>

                <Typography className="hearing-cell-text hearing-notes">
                  {hearing.notes || "-"}
                </Typography>

                <Box className="hearing-actions">
                  {!isAssistant && (
                    <>
                      <Tooltip title="Edit hearing">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(hearing)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete hearing">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(hearing)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedHearing ? "Edit Hearing" : "Add Hearing"}
        </DialogTitle>

        <DialogContent>
          <Box className="hearing-form">
            <TextField
              label="Hearing date & time"
              type="datetime-local"
              value={form.hearingDate}
              onChange={(event) =>
                handleFormChange("hearingDate", event.target.value)
              }
              fullWidth
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <Box className="hearing-form-row">
              <TextField
                label="Court room"
                value={form.courtRoom}
                onChange={(event) =>
                  handleFormChange("courtRoom", event.target.value)
                }
                fullWidth
                placeholder="Court Room 3"
              />

              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(event) =>
                  handleFormChange("status", Number(event.target.value))
                }
                fullWidth
              >
                <MenuItem value={HearingStatus.Scheduled}>Scheduled</MenuItem>

                <MenuItem value={HearingStatus.Completed}>Completed</MenuItem>

                <MenuItem value={HearingStatus.Adjourned}>Adjourned</MenuItem>

                <MenuItem value={HearingStatus.Cancelled}>Cancelled</MenuItem>
              </TextField>
            </Box>

            <TextField
              label="Purpose"
              value={form.purpose}
              onChange={(event) =>
                handleFormChange("purpose", event.target.value)
              }
              fullWidth
              placeholder="Initial hearing"
            />

            <TextField
              label="Notes"
              value={form.notes}
              onChange={(event) =>
                handleFormChange("notes", event.target.value)
              }
              fullWidth
              multiline
              minRows={4}
              placeholder="Add hearing notes..."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !form.hearingDate}
          >
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : selectedHearing ? (
              "Save Changes"
            ) : (
              "Add Hearing"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Hearing</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this hearing? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Hearings;
