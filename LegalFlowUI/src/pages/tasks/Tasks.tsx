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
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { useSelector } from "react-redux";

import type { RootState } from "../../store/store";
import caseApi, { CaseStatus } from "../../api/caseApi";
import type { Case } from "../../api/caseApi";
import taskApi from "../../api/taskApi";

import {
  TaskPriority,
  TaskStatus,
  type FirmUser,
  type Task,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from "../../types/task";

import "./Tasks.css";

type FormState = {
  title: string;
  description: string;
  assignedToId: string;
  priority: number;
  status: number;
  dueDate: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  assignedToId: "",
  priority: TaskPriority.Medium,
  status: TaskStatus.Todo,
  dueDate: "",
};

const Tasks = () => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<FirmUser[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [form, setForm] = useState<FormState>(initialForm);

  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      setError("");

      try {
        const [casesResponse, usersResponse] = await Promise.all([
          caseApi.getAll(),
          taskApi.getFirmUsers(),
        ]);

        setCases(casesResponse);
        setUsers(usersResponse);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Unable to load task options.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const loadTasks = async (caseId: string) => {
    if (!caseId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await taskApi.getAll(caseId);

      setTasks(response);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCaseId) {
      loadTasks(selectedCaseId);
    }
  }, [selectedCaseId]);

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return tasks;
    }

    return tasks.filter((task) => {
      const assignedUser = users.find((user) => user.id === task.assignedToId);

      const assignedName = assignedUser
        ? `${assignedUser.firstName} ${assignedUser.lastName}`
        : "";

      return (
        task.title.toLowerCase().includes(value) ||
        task.description?.toLowerCase().includes(value) ||
        assignedName.toLowerCase().includes(value)
      );
    });
  }, [tasks, search, users]);

  const getUserName = (userId: string) => {
    const user = users.find((item) => item.id === userId);

    if (!user) {
      return "Unassigned";
    }

    return `${user.firstName} ${user.lastName}`;
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case TaskStatus.Todo:
        return "Todo";

      case TaskStatus.InProgress:
        return "In Progress";

      case TaskStatus.Completed:
        return "Completed";

      case TaskStatus.Cancelled:
        return "Cancelled";

      default:
        return "Unknown";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case TaskPriority.Low:
        return "Low";

      case TaskPriority.Medium:
        return "Medium";

      case TaskPriority.High:
        return "High";

      case TaskPriority.Critical:
        return "Critical";

      default:
        return "Unknown";
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case TaskStatus.Completed:
        return "task-status task-status-completed";

      case TaskStatus.InProgress:
        return "task-status task-status-progress";

      case TaskStatus.Cancelled:
        return "task-status task-status-cancelled";

      default:
        return "task-status task-status-todo";
    }
  };

  const getPriorityClass = (priority: number) => {
    switch (priority) {
      case TaskPriority.Critical:
        return "task-priority task-priority-critical";

      case TaskPriority.High:
        return "task-priority task-priority-high";

      case TaskPriority.Low:
        return "task-priority task-priority-low";

      default:
        return "task-priority task-priority-medium";
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "No due date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "No due date";
    }

    return date.toLocaleDateString();
  };

  const openCreateDialog = () => {
    setEditingTask(null);

    setForm({
      ...initialForm,
      assignedToId: currentUser?.userId || users[0]?.id || "",
    });

    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description || "",
      assignedToId: task.assignedToId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingTask(null);
    setForm(initialForm);
  };

  const handleFormChange = (field: keyof FormState, value: string | number) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedCaseId) {
      setError("Please select a case.");
      return;
    }

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!form.assignedToId) {
      setError("Please select a user to assign the task.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingTask) {
        const request: UpdateTaskRequest = {
          assignedToId: form.assignedToId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status as TaskStatus,
          priority: form.priority as TaskPriority,
          dueDate: form.dueDate
            ? new Date(`${form.dueDate}T00:00:00`).toISOString()
            : null,
        };

        const updatedTask = await taskApi.update(
          selectedCaseId,
          editingTask.id,
          request,
        );

        setTasks((previous) =>
          previous.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        );
      } else {
        const request: CreateTaskRequest = {
          assignedToId: form.assignedToId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority as TaskPriority,
          dueDate: form.dueDate
            ? new Date(`${form.dueDate}T00:00:00`).toISOString()
            : null,
        };

        const createdTask = await taskApi.create(selectedCaseId, request);

        setTasks((previous) => [createdTask, ...previous]);
      }

      closeDialog();
    } catch (error: any) {
      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()[0];

        setError(
          typeof firstError === "string"
            ? firstError
            : "Please check the task information.",
        );
      } else {
        setError(error?.response?.data?.message || "Unable to save task.");
      }
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDelete = async () => {
    if (!taskToDelete || !selectedCaseId) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await taskApi.delete(selectedCaseId, taskToDelete.id);

      setTasks((previous) =>
        previous.filter((task) => task.id !== taskToDelete.id),
      );

      closeDeleteDialog();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Unable to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="tasks-page">
      <Box className="tasks-header">
        <Box>
          <Typography variant="h4" className="tasks-title">
            Tasks
          </Typography>

          <Typography variant="body2" className="tasks-subtitle">
            Manage case-related tasks, priorities and assignments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={loadingOptions || cases.length === 0}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          className="tasks-alert"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={0} className="tasks-toolbar">
        <TextField
          select
          label="Case"
          value={selectedCaseId}
          onChange={(event) => setSelectedCaseId(event.target.value)}
          className="tasks-case-select"
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
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      {!selectedCaseId ? (
        <Paper elevation={0} className="tasks-empty">
          <AssignmentOutlinedIcon className="tasks-empty-icon" />

          <Typography variant="h6">Select a case</Typography>

          <Typography variant="body2" color="text.secondary">
            Choose a case above to view and manage its tasks.
          </Typography>
        </Paper>
      ) : loading ? (
        <Paper elevation={0} className="tasks-empty">
          <CircularProgress size={32} />

          <Typography variant="body2" color="text.secondary">
            Loading tasks...
          </Typography>
        </Paper>
      ) : filteredTasks.length === 0 ? (
        <Paper elevation={0} className="tasks-empty">
          <AssignmentOutlinedIcon className="tasks-empty-icon" />

          <Typography variant="h6">No tasks found</Typography>

          <Typography variant="body2" color="text.secondary">
            {search
              ? "Try a different search."
              : "Create the first task for this case."}
          </Typography>
        </Paper>
      ) : (
        <Box className="tasks-list">
          {filteredTasks.map((task) => (
            <Paper
              key={task.id}
              elevation={0}
              className={`task-card ${
                task.status === TaskStatus.Completed
                  ? "task-card-completed"
                  : ""
              }`}
            >
              <Box className="task-card-main">
                <Box className="task-card-icon">
                  <AssignmentOutlinedIcon />
                </Box>

                <Box className="task-card-content">
                  <Box className="task-card-title-row">
                    <Typography variant="h6" className="task-card-title">
                      {task.title}
                    </Typography>

                    <span className={getPriorityClass(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </Box>

                  {task.description && (
                    <Typography
                      variant="body2"
                      className="task-card-description"
                    >
                      {task.description}
                    </Typography>
                  )}

                  <Box className="task-card-meta">
                    <span className={getStatusClass(task.status)}>
                      {getStatusLabel(task.status)}
                    </span>

                    <span className="task-meta-item">
                      Assigned to{" "}
                      <strong>{getUserName(task.assignedToId)}</strong>
                    </span>

                    <span className="task-meta-item">
                      Due <strong>{formatDate(task.dueDate)}</strong>
                    </span>
                  </Box>
                </Box>
              </Box>

              <Box className="task-card-actions">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(task)}
                  title="Edit task"
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => openDeleteDialog(task)}
                  title="Delete task"
                  className="task-delete-button"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle className="task-dialog-title">
          <Box>
            {editingTask ? "Edit Task" : "Create Task"}

            <Typography variant="body2" color="text.secondary">
              {editingTask
                ? "Update task details and status."
                : "Create a new task for this case."}
            </Typography>
          </Box>

          <IconButton onClick={closeDialog} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box className="task-form">
            <TextField
              label="Task title"
              value={form.title}
              onChange={(event) =>
                handleFormChange("title", event.target.value)
              }
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
              multiline
              minRows={3}
              fullWidth
            />

            <Box className="task-form-row">
              <TextField
                select
                label="Assigned To"
                value={form.assignedToId}
                onChange={(event) =>
                  handleFormChange("assignedToId", event.target.value)
                }
                required
                fullWidth
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} — {user.role}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Priority"
                value={form.priority}
                onChange={(event) =>
                  handleFormChange("priority", Number(event.target.value))
                }
                fullWidth
              >
                <MenuItem value={TaskPriority.Low}>Low</MenuItem>

                <MenuItem value={TaskPriority.Medium}>Medium</MenuItem>

                <MenuItem value={TaskPriority.High}>High</MenuItem>

                <MenuItem value={TaskPriority.Critical}>Critical</MenuItem>
              </TextField>
            </Box>

            <Box className="task-form-row">
              {editingTask && (
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(event) =>
                    handleFormChange("status", Number(event.target.value))
                  }
                  fullWidth
                >
                  <MenuItem value={TaskStatus.Todo}>Todo</MenuItem>

                  <MenuItem value={TaskStatus.InProgress}>In Progress</MenuItem>

                  <MenuItem value={TaskStatus.Completed}>Completed</MenuItem>

                  <MenuItem value={TaskStatus.Cancelled}>Cancelled</MenuItem>
                </TextField>
              )}

              <TextField
                label="Due date"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  handleFormChange("dueDate", event.target.value)
                }
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions className="task-dialog-actions">
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : editingTask ? (
              "Save Changes"
            ) : (
              "Create Task"
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
        <DialogTitle>Delete Task?</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{taskToDelete?.title}</strong>? This action cannot be
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

export default Tasks;
