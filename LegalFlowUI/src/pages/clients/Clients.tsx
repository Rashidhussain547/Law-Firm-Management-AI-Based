import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./../../theme/theme-variables.css";
import clientApi, {
  type Client,
  type CreateClientRequest,
} from "../../api/clientApi";

import "./Clients.css";

type ClientForm = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
};

const emptyForm: ClientForm = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phoneNumber: "",
  address: "",
  isActive: true,
};


function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [form, setForm] = useState<ClientForm>(emptyForm);

  const [menuAnchor, setMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);

      const data = await clientApi.getAll();

      setClients(data);
    } catch (error) {
      console.error("Failed to load clients:", error);
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return clients;
    }

    return clients.filter((client) => {
      const fullName =
        `${client.firstName} ${client.lastName}`.toLowerCase();

      const company =
        client.companyName?.toLowerCase() ?? "";

      const email =
        client.email?.toLowerCase() ?? "";

      const phone =
        client.phoneNumber?.toLowerCase() ?? "";

      return (
        fullName.includes(value) ||
        company.includes(value) ||
        email.includes(value) ||
        phone.includes(value)
      );
    });
  }, [clients, search]);

  const getFullName = (client: Client) =>
    `${client.firstName} ${client.lastName}`.trim();

  const getInitials = (client: Client) => {
    const first = client.firstName?.charAt(0) ?? "";
    const last = client.lastName?.charAt(0) ?? "";

    return `${first}${last}`.toUpperCase();
  };

  const handleFormChange = (
    field: keyof ClientForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    client: Client
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAddOpen = () => {
    setForm(emptyForm);
    setAddDialogOpen(true);
  };

  const handleAddClose = () => {
    if (saving) {
      return;
    }

    setAddDialogOpen(false);
    setForm(emptyForm);
  };

  const handleCreateClient = async () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: CreateClientRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        companyName:
          form.companyName.trim() || null,
        email: form.email.trim(),
        phoneNumber:
          form.phoneNumber.trim() || null,
        address:
          form.address.trim() || null,
        isActive : 
          true
      };

      const createdClient =
        await clientApi.create(request);

      setClients((previous) => [
        createdClient,
        ...previous,
      ]);

      setAddDialogOpen(false);
      setForm(emptyForm);

      setSuccess("Client created successfully.");
    } catch (error) {
      console.error(
        "Failed to create client:",
        error
      );

      setError("Failed to create client.");
    } finally {
      setSaving(false);
    }
  };

  const handleView = async () => {
    if (!selectedClient) {
      return;
    }

    try {
      setError("");

      const client = await clientApi.getById(
        selectedClient.id
      );

      setSelectedClient(client);
      setViewDialogOpen(true);
      setMenuAnchor(null);
    } catch (error) {
      console.error(
        "Failed to load client:",
        error
      );

      setError("Failed to load client.");
    }
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
  };

  const handleEditOpen = () => {
    if (!selectedClient) {
      return;
    }

    setForm({
      firstName: selectedClient.firstName,
      lastName: selectedClient.lastName,
      companyName:
        selectedClient.companyName ?? "",
      email: selectedClient.email,
      phoneNumber:
        selectedClient.phoneNumber ?? "",
      address:
        selectedClient.address ?? "",
      isActive: selectedClient.isActive,
    });

    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleEditClose = () => {
    if (saving) {
      return;
    }

    setEditDialogOpen(false);
    setForm(emptyForm);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) {
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedClient =
        await clientApi.update(
          selectedClient.id,
          {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            companyName:
              form.companyName.trim() || null,
            email: form.email.trim(),
            phoneNumber:
              form.phoneNumber.trim() || null,
            address:
              form.address.trim() || null,
            isActive: form.isActive,
          }
        );

      setClients((previous) =>
        previous.map((client) =>
          client.id === updatedClient.id
            ? updatedClient
            : client
        )
      );

      setSelectedClient(updatedClient);

      setEditDialogOpen(false);
      setForm(emptyForm);

      setSuccess("Client updated successfully.");
    } catch (error) {
      console.error(
        "Failed to update client:",
        error
      );

      setError("Failed to update client.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOpen = () => {
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleDeleteClose = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedClient) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await clientApi.delete(
        selectedClient.id
      );

      setClients((previous) =>
        previous.filter(
          (client) =>
            client.id !== selectedClient.id
        )
      );

      setDeleteDialogOpen(false);
      setSelectedClient(null);

      setSuccess("Client deleted successfully.");
    } catch (error) {
      console.error(
        "Failed to delete client:",
        error
      );

      setError("Failed to delete client.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="clients-page">
      {/* Header */}
      <Box className="clients-header">
        <Box>
          <Typography
            variant="h5"
            className="clients-title"
          >
            Clients
          </Typography>

          <Typography
            variant="body2"
            className="clients-subtitle"
          >
            Manage your clients and their
            information.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-client-button"
          onClick={handleAddOpen}
        >
          Add Client
        </Button>
      </Box>

      {/* Clients Card */}
      <Card className="clients-card">
        <Box className="clients-toolbar">
          <TextField
            placeholder="Search clients..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="client-search"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Typography
            variant="body2"
            className="client-count"
          >
            {filteredClients.length} clients
          </Typography>
        </Box>

        {/* Loading */}
        {loading ? (
          <Box className="clients-loading">
            <CircularProgress />
          </Box>
        ) : filteredClients.length === 0 ? (
          /* Empty */
          <Box className="clients-empty">
            <Typography variant="h6">
              No clients found
            </Typography>

            <Typography variant="body2">
              {search
                ? "Try changing your search."
                : "Add your first client to get started."}
            </Typography>
          </Box>
        ) : (
          /* Client List */
          <Box className="clients-list">
            {filteredClients.map((client) => (
              <Box
                key={client.id}
                className="client-row"
              >
                <Box className="client-main">
                  <Avatar className="client-avatar">
                    {getInitials(client)}
                  </Avatar>

                  <Box className="client-info">
                    <Typography
                      variant="body1"
                      className="client-name"
                    >
                      {getFullName(client)}
                    </Typography>

                    {client.companyName && (
                      <Typography
                        variant="body2"
                        className="client-company"
                      >
                        {client.companyName}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      className="client-contact"
                    >
                      {client.email}

                      {client.phoneNumber
                        ? ` • ${client.phoneNumber}`
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Box className="client-right">
                  <Box
                    className={
                      client.isActive
                        ? "client-status active"
                        : "client-status inactive"
                    }
                  >
                    {client.isActive
                      ? "Active"
                      : "Inactive"}
                  </Box>

                  <IconButton
                    onClick={(event) =>
                      handleMenuOpen(
                        event,
                        client
                      )
                    }
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          View Client
        </MenuItem>

        <MenuItem onClick={handleEditOpen}>
          Edit Client
        </MenuItem>

        <MenuItem
          onClick={handleDeleteOpen}
          sx={{ color: "error.main" }}
        >
          Delete Client
        </MenuItem>
      </Menu>

      {/* Add Client Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add New Client
        </DialogTitle>

        <DialogContent>
          <Box className="client-form">
            <Box className="client-form-row">
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={(event) =>
                  handleFormChange(
                    "firstName",
                    event.target.value
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={(event) =>
                  handleFormChange(
                    "lastName",
                    event.target.value
                  )
                }
                required
                fullWidth
              />
            </Box>

            <TextField
              label="Company Name"
              value={form.companyName}
              onChange={(event) =>
                handleFormChange(
                  "companyName",
                  event.target.value
                )
              }
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                handleFormChange(
                  "email",
                  event.target.value
                )
              }
              required
              fullWidth
            />

            <TextField
              label="Phone Number"
              value={form.phoneNumber}
              onChange={(event) =>
                handleFormChange(
                  "phoneNumber",
                  event.target.value
                )
              }
              fullWidth
            />

            <TextField
              label="Address"
              value={form.address}
              onChange={(event) =>
                handleFormChange(
                  "address",
                  event.target.value
                )
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleAddClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateClient}
            disabled={
              saving ||
              !form.firstName.trim() ||
              !form.lastName.trim() ||
              !form.email.trim()
            }
          >
            {saving ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Create Client"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Client Details
        </DialogTitle>

        <DialogContent>
          {selectedClient && (
            <Box className="client-details">
              <Box className="client-details-header">
                <Avatar className="client-details-avatar">
                  {getInitials(selectedClient)}
                </Avatar>

                <Box>
                  <Typography
                    variant="h6"
                    className="client-details-name"
                  >
                    {getFullName(
                      selectedClient
                    )}
                  </Typography>

                  <Typography
                    variant="body2"
                    className={
                      selectedClient.isActive
                        ? "client-details-status"
                        : "client-details-status inactive"
                    }
                  >
                    {selectedClient.isActive
                      ? "Active Client"
                      : "Inactive Client"}
                  </Typography>
                </Box>
              </Box>

              <Box className="client-details-grid">
                <Box>
                  <Typography className="detail-label">
                    Company
                  </Typography>

                  <Typography className="detail-value">
                    {selectedClient.companyName ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">
                    Email
                  </Typography>

                  <Typography className="detail-value">
                    {selectedClient.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">
                    Phone
                  </Typography>

                  <Typography className="detail-value">
                    {selectedClient.phoneNumber ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">
                    Address
                  </Typography>

                  <Typography className="detail-value">
                    {selectedClient.address ||
                      "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography className="detail-label">
                    Status
                  </Typography>

                  <Typography className="detail-value">
                    {selectedClient.isActive
                      ? "Active"
                      : "Inactive"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleViewClose}>
            Close
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              handleViewClose();
              handleEditOpen();
            }}
          >
            Edit Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit Client
        </DialogTitle>

        <DialogContent>
          <Box className="client-form">
            <Box className="client-form-row">
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={(event) =>
                  handleFormChange(
                    "firstName",
                    event.target.value
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={(event) =>
                  handleFormChange(
                    "lastName",
                    event.target.value
                  )
                }
                required
                fullWidth
              />
            </Box>

            <TextField
              label="Company Name"
              value={form.companyName}
              onChange={(event) =>
                handleFormChange(
                  "companyName",
                  event.target.value
                )
              }
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                handleFormChange(
                  "email",
                  event.target.value
                )
              }
              required
              fullWidth
            />

            <TextField
              label="Phone Number"
              value={form.phoneNumber}
              onChange={(event) =>
                handleFormChange(
                  "phoneNumber",
                  event.target.value
                )
              }
              fullWidth
            />

            <TextField
              label="Address"
              value={form.address}
              onChange={(event) =>
                handleFormChange(
                  "address",
                  event.target.value
                )
              }
              multiline
              rows={3}
              fullWidth
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              value={
                form.isActive
                  ? "active"
                  : "inactive"
              }
              onChange={(event) =>
                handleFormChange(
                  "isActive",
                  event.target.value ===
                    "active"
                )
              }
              fullWidth
            >
              <MenuItem value="active">
                Active
              </MenuItem>

              <MenuItem value="inactive">
                Inactive
              </MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleEditClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateClient}
            disabled={
              saving ||
              !form.firstName.trim() ||
              !form.lastName.trim() ||
              !form.email.trim()
            }
          >
            {saving ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Client?
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {selectedClient
                ? getFullName(
                    selectedClient
                  )
                : ""}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleDeleteClose}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        message={success}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert
          severity="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Clients;