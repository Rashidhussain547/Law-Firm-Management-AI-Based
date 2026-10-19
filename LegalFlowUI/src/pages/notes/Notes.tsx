import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import "./../../theme/theme-variables.css";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

import caseApi, { CaseStatus } from "../../api/caseApi";
import noteApi from "../../api/noteApi";

import type { Case } from "../../api/caseApi";
import type { CaseNote } from "../../types/note";

import "./Notes.css";

const Notes = () => {
  const [cases, setCases] = useState<Case[]>([]);

  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [notes, setNotes] = useState<CaseNote[]>([]);

  const [search, setSearch] = useState("");

  const [loadingCases, setLoadingCases] = useState(true);

  const [loadingNotes, setLoadingNotes] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingNote, setEditingNote] = useState<CaseNote | null>(null);

  const [noteToDelete, setNoteToDelete] = useState<CaseNote | null>(null);

  const [content, setContent] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      setLoadingCases(true);
      setError("");

      try {
        const response = await caseApi.getAll();

        setCases(response);
      } catch (error: any) {
        setError(error?.response?.data?.message || "Unable to load cases.");
      } finally {
        setLoadingCases(false);
      }
    };

    loadCases();
  }, []);

  const loadNotes = async (caseId: string) => {
    if (!caseId) {
      setNotes([]);
      return;
    }

    setLoadingNotes(true);
    setError("");

    try {
      const response = await noteApi.getAll(caseId);

      setNotes(response);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load notes.");
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    loadNotes(selectedCaseId);
  }, [selectedCaseId]);

  const filteredNotes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return notes;
    }

    return notes.filter((note) => note.content.toLowerCase().includes(value));
  }, [notes, search]);

  const getCaseName = () => {
    const selectedCase = cases.find((item) => item.id === selectedCaseId);

    if (!selectedCase) {
      return "";
    }

    return `${selectedCase.caseNumber} — ${selectedCase.title}`;
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  const openCreateDialog = () => {
    setEditingNote(null);
    setContent("");
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (note: CaseNote) => {
    setEditingNote(note);
    setContent(note.content);
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingNote(null);
    setContent("");
  };

  const handleSave = async () => {
    if (!selectedCaseId) {
      setError("Please select a case.");
      return;
    }

    if (!content.trim()) {
      setError("Note content is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingNote) {
        const updatedNote = await noteApi.update(
          selectedCaseId,
          editingNote.id,
          {
            content: content.trim(),
          },
        );

        setNotes((previous) =>
          previous.map((note) =>
            note.id === updatedNote.id ? updatedNote : note,
          ),
        );
      } else {
        const createdNote = await noteApi.create(selectedCaseId, {
          content: content.trim(),
        });

        setNotes((previous) => [createdNote, ...previous]);
      }

      closeDialog();
    } catch (error: any) {
      const validationErrors = error?.response?.data?.errors;

      if (Array.isArray(validationErrors)) {
        const firstError = validationErrors[0];

        setError(
          firstError?.errorMessage ||
            firstError?.message ||
            "Please check the note.",
        );
      } else {
        setError(error?.response?.data?.message || "Unable to save note.");
      }
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (note: CaseNote) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleDelete = async () => {
    if (!noteToDelete || !selectedCaseId) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await noteApi.delete(selectedCaseId, noteToDelete.id);

      setNotes((previous) =>
        previous.filter((note) => note.id !== noteToDelete.id),
      );

      closeDeleteDialog();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to delete note.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="notes-page">
      <Box className="notes-header">
        <Box>
          <Typography variant="h4" className="notes-title">
            Case Notes
          </Typography>

          <Typography variant="body2" className="notes-subtitle">
            Keep important case information, observations and updates organized.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={!selectedCaseId}
        >
          Add Note
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          className="notes-alert"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={0} className="notes-toolbar">
        <TextField
          select
          label="Case"
          value={selectedCaseId}
          onChange={(event) => setSelectedCaseId(event.target.value)}
          className="notes-case-select"
          disabled={loadingCases}
        >
          <MenuItem value="">Select a case</MenuItem>

          {cases
          .filter((caseItem) => caseItem.status !== CaseStatus.Closed)
          .map((caseItem) => (
            <MenuItem key={caseItem.id} value={caseItem.id}>
              {caseItem.caseNumber} — {caseItem.title}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          placeholder="Search notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      {selectedCaseId && (
        <Box className="notes-case-heading">
          <Typography variant="body2" color="text.secondary">
            Notes for
          </Typography>

          <Typography
            variant="subtitle1"
            //fontWeight={600}
          >
            {getCaseName()}
          </Typography>
        </Box>
      )}

      {!selectedCaseId ? (
        <Paper elevation={0} className="notes-empty">
          <NotesOutlinedIcon className="notes-empty-icon" />

          <Typography variant="h6">Select a case</Typography>

          <Typography variant="body2" color="text.secondary">
            Choose a case above to view and manage its notes.
          </Typography>
        </Paper>
      ) : loadingNotes ? (
        <Paper elevation={0} className="notes-empty">
          <CircularProgress size={32} />

          <Typography variant="body2" color="text.secondary">
            Loading notes...
          </Typography>
        </Paper>
      ) : filteredNotes.length === 0 ? (
        <Paper elevation={0} className="notes-empty">
          <NotesOutlinedIcon className="notes-empty-icon" />

          <Typography variant="h6">No notes found</Typography>

          <Typography variant="body2" color="text.secondary">
            {search
              ? "Try a different search."
              : "Add the first note for this case."}
          </Typography>
        </Paper>
      ) : (
        <Box className="notes-list">
          {filteredNotes.map((note) => (
            <Paper key={note.id} elevation={0} className="note-card">
              <Box className="note-card-header">
                <Box className="note-icon">
                  <NotesOutlinedIcon />
                </Box>

                <Box className="note-date">
                  <Typography variant="caption" color="text.secondary">
                    {note.updatedAt ? "Updated" : "Created"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(note.updatedAt || note.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" className="note-content">
                {note.content}
              </Typography>

              <Box className="note-card-actions">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(note)}
                  title="Edit note"
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => openDeleteDialog(note)}
                  title="Delete note"
                  className="note-delete-button"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle className="note-dialog-title">
          <Box>
            {editingNote ? "Edit Note" : "Add Note"}

            <Typography variant="body2" color="text.secondary">
              {editingNote
                ? "Update the case note."
                : "Add an important note to this case."}
            </Typography>
          </Box>

          <IconButton onClick={closeDialog} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Note"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            multiline
            minRows={7}
            fullWidth
            required
            autoFocus
            placeholder="Write your case note here..."
          />
        </DialogContent>

        <DialogActions className="note-dialog-actions">
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : editingNote ? (
              "Save Changes"
            ) : (
              "Add Note"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Note?</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
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

export default Notes;
