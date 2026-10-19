import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import "./../../theme/theme-variables.css";
import {
  Add,
  Close,
  DarkMode,
  Group,
  LightMode,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "../../store/store";
import { setCurrentUser } from "../../store/slices/authSlice";

import settingsApi from "../../api/settingsApi";
import { useThemeMode } from "../../theme/ThemeContext";

import "./Settings.css";

type SettingsSection =
  | "profile"
  | "password"
  | "appearance"
  | "team";

const Settings = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state: RootState) => state.auth.currentUser
  );

  const { mode, setMode } = useThemeMode();

  const isAdmin = currentUser?.role === "Admin";

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [firstName, setFirstName] = useState(
    currentUser?.firstName ?? ""
  );

  const [lastName, setLastName] = useState(
    currentUser?.lastName ?? ""
  );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [users, setUsers] = useState<
    Awaited<ReturnType<typeof settingsApi.getUsers>>
  >([]);

  const [loadingUsers, setLoadingUsers] = useState(false);

  const [openCreateUser, setOpenCreateUser] =
    useState(false);

  const [teamLoading, setTeamLoading] =
    useState(false);

  const [newUserFirstName, setNewUserFirstName] =
    useState("");

  const [newUserLastName, setNewUserLastName] =
    useState("");

  const [newUserEmail, setNewUserEmail] =
    useState("");

  const [newUserPassword, setNewUserPassword] =
    useState("");

  const [newUserRole, setNewUserRole] =
    useState<"Lawyer" | "Assistant">("Lawyer");

  const [reportsToUserId, setReportsToUserId] =
    useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [snackbarOpen, setSnackbarOpen] =
    useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
    }
  }, [currentUser]);

  useEffect(() => {
    if (
      activeSection === "team" &&
      isAdmin
    ) {
      loadUsers();
    }
  }, [activeSection, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const data = await settingsApi.getUsers();

      setUsers(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load team members."
      );

      setSnackbarOpen(true);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setError("");
      setMessage("");

      const response =
        await settingsApi.updateProfile({
          firstName,
          lastName,
        });

      if (currentUser) {
        dispatch(
          setCurrentUser({
            ...currentUser,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          })
        );
      }

      setMessage(response.message);
      setSnackbarOpen(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update profile."
      );

      setSnackbarOpen(true);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError("");
      setMessage("");

      const response =
        await settingsApi.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(response.message);
      setSnackbarOpen(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to change password."
      );

      setSnackbarOpen(true);
    }
  };

  const resetCreateUserForm = () => {
    setNewUserFirstName("");
    setNewUserLastName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("Lawyer");
    setReportsToUserId("");
  };

  const handleCreateUser = async () => {
    try {
      setError("");
      setMessage("");

      if (
        !newUserFirstName.trim() ||
        !newUserLastName.trim() ||
        !newUserEmail.trim() ||
        !newUserPassword.trim()
      ) {
        setError("Please fill in all required fields.");
        setSnackbarOpen(true);
        return;
      }

      if (
        newUserRole === "Assistant" &&
        !reportsToUserId
      ) {
        setError(
          "Please select a lawyer for the assistant."
        );

        setSnackbarOpen(true);
        return;
      }

      setTeamLoading(true);

      const response =
        await settingsApi.createUser({
          firstName: newUserFirstName.trim(),
          lastName: newUserLastName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword,
          role: newUserRole,
          reportsToUserId:
            newUserRole === "Assistant"
              ? reportsToUserId
              : null,
        });

      setMessage(response.message);
      setSnackbarOpen(true);

      setOpenCreateUser(false);

      resetCreateUserForm();

      await loadUsers();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create user."
      );

      setSnackbarOpen(true);
    } finally {
      setTeamLoading(false);
    }
  };

  const lawyers = users.filter(
    (user) => user.role === "Lawyer" && user.isActive
  );

  return (
    <Box className="settings-container">
      <Card className="settings-sidebar">
        <Box className="settings-sidebar-header">
          <Typography
            variant="h6"
            className="settings-sidebar-title"
          >
            Settings
          </Typography>

          <Typography
            variant="body2"
            className="settings-sidebar-subtitle"
          >
            Manage your account
          </Typography>
        </Box>

        <Divider />

        <Box className="settings-nav">
          <button
            className={`settings-nav-item ${
              activeSection === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("profile")
            }
          >
            <Person fontSize="small" />

            <span>Profile</span>
          </button>

          <button
            className={`settings-nav-item ${
              activeSection === "password"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("password")
            }
          >
            <Lock fontSize="small" />

            <span>Change Password</span>
          </button>

          <button
            className={`settings-nav-item ${
              activeSection === "appearance"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("appearance")
            }
          >
            {mode === "dark" ? (
              <DarkMode fontSize="small" />
            ) : (
              <LightMode fontSize="small" />
            )}

            <span>Appearance</span>
          </button>

          {isAdmin && (
            <button
              className={`settings-nav-item ${
                activeSection === "team"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection("team")
              }
            >
              <Group fontSize="small" />

              <span>Team</span>
            </button>
          )}
        </Box>
      </Card>

      <Box className="settings-content">
        {activeSection === "profile" && (
          <Card className="settings-panel">
            <CardContent>
              <Box className="settings-panel-header">
                <Box>
                  <Typography variant="h5">
                    Profile
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Manage your personal information.
                  </Typography>
                </Box>
              </Box>

              <Divider className="settings-divider" />

              <Box className="settings-form-grid">
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Email"
                  value={currentUser?.email ?? ""}
                  fullWidth
                  disabled
                />

                <TextField
                  label="Role"
                  value={currentUser?.role ?? ""}
                  fullWidth
                  disabled
                />
              </Box>

              <Box className="settings-actions">
                <Button
                  variant="contained"
                  onClick={handleProfileSave}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeSection === "password" && (
          <Card className="settings-panel">
            <CardContent>
              <Box className="settings-panel-header">
                <Box>
                  <Typography variant="h5">
                    Change Password
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Update your account password.
                  </Typography>
                </Box>
              </Box>

              <Divider className="settings-divider" />

              <Box className="settings-password-form">
                <TextField
                  label="Current Password"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowCurrentPassword(
                                !showCurrentPassword
                              )
                            }
                            edge="end"
                          >
                            {showCurrentPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="New Password"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  fullWidth
                  helperText="Minimum 8 characters"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowNewPassword(
                                !showNewPassword
                              )
                            }
                            edge="end"
                          >
                            {showNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(
                                !showConfirmPassword
                              )
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box className="settings-actions">
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                  >
                    Update Password
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeSection === "appearance" && (
          <Card className="settings-panel">
            <CardContent>
              <Box className="settings-panel-header">
                <Box>
                  <Typography variant="h5">
                    Appearance
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Customize how LegalFlow looks.
                  </Typography>
                </Box>
              </Box>

              <Divider className="settings-divider" />

              <Box className="appearance-options">
                <button
                  className={`appearance-option ${
                    mode === "light"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setMode("light")
                  }
                >
                  <LightMode />

                  <Box>
                    <Typography 
                    //fontWeight={600}
                    >
                      Light
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Clean and bright interface
                    </Typography>
                  </Box>
                </button>

                <button
                  className={`appearance-option ${
                    mode === "dark"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setMode("dark")
                  }
                >
                  <DarkMode />

                  <Box>
                    <Typography 
                    //fontWeight={600}
                    >
                      Dark
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Easier on the eyes in low light
                    </Typography>
                  </Box>
                </button>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeSection === "team" && isAdmin && (
          <Card className="settings-panel">
            <CardContent>
              <Box className="team-header">
                <Box>
                  <Typography variant="h5">
                    Team
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Manage lawyers and assistants in
                    your firm.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() =>
                    setOpenCreateUser(true)
                  }
                >
                  Add Team Member
                </Button>
              </Box>

              <Divider className="settings-divider" />

              {loadingUsers ? (
                <Box className="team-empty">
                  <Typography color="text.secondary">
                    Loading team members...
                  </Typography>
                </Box>
              ) : users.length === 0 ? (
                <Box className="team-empty">
                  <Group />

                  <Typography
                    variant="h6"
                    sx={{ mt: 1 }}
                  >
                    No team members yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Add your first lawyer or assistant.
                  </Typography>
                </Box>
              ) : (
                <Box className="team-list">
                  {users.map((user) => (
                    <Box
                      key={user.id}
                      className="team-member"
                    >
                      <Box className="team-member-info">
                        <Box className="team-avatar">
                          {user.firstName
                            .charAt(0)
                            .toUpperCase()}
                          {user.lastName
                            .charAt(0)
                            .toUpperCase()}
                        </Box>

                        <Box>
                          <Typography
                            //fontWeight={600}
                          >
                            {user.firstName}{" "}
                            {user.lastName}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className="team-member-meta">
                        <Chip
                          label={user.role}
                          size="small"
                          className={`role-chip role-${user.role.toLowerCase()}`}
                        />

                        <Chip
                          label={
                            user.isActive
                              ? "Active"
                              : "Inactive"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {openCreateUser && (
        <Box className="create-user-overlay">
          <Card className="create-user-dialog">
            <Box className="create-user-header">
              <Box>
                <Typography variant="h6">
                  Add Team Member
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Create a lawyer or assistant account.
                </Typography>
              </Box>

              <IconButton
                onClick={() => {
                  setOpenCreateUser(false);
                  resetCreateUserForm();
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <Divider />

            <Box className="create-user-form">
              <Box className="create-user-grid">
                <TextField
                  label="First Name"
                  value={newUserFirstName}
                  onChange={(e) =>
                    setNewUserFirstName(
                      e.target.value
                    )
                  }
                  fullWidth
                  required
                />

                <TextField
                  label="Last Name"
                  value={newUserLastName}
                  onChange={(e) =>
                    setNewUserLastName(
                      e.target.value
                    )
                  }
                  fullWidth
                  required
                />
              </Box>

              <TextField
                label="Email"
                type="email"
                value={newUserEmail}
                onChange={(e) =>
                  setNewUserEmail(e.target.value)
                }
                fullWidth
                required
              />

              <TextField
                label="Temporary Password"
                type="password"
                value={newUserPassword}
                onChange={(e) =>
                  setNewUserPassword(
                    e.target.value
                  )
                }
                fullWidth
                required
                helperText="Minimum 8 characters"
              />

              <TextField
                select
                label="Role"
                value={newUserRole}
                onChange={(e) => {
                  const role = e.target.value as
                    | "Lawyer"
                    | "Assistant";

                  setNewUserRole(role);

                  if (role === "Lawyer") {
                    setReportsToUserId("");
                  }
                }}
                fullWidth
              >
                <MenuItem value="Lawyer">
                  Lawyer
                </MenuItem>

                <MenuItem value="Assistant">
                  Assistant
                </MenuItem>
              </TextField>

              {newUserRole === "Assistant" && (
                <TextField
                  select
                  label="Reports To"
                  value={reportsToUserId}
                  onChange={(e) =>
                    setReportsToUserId(
                      e.target.value
                    )
                  }
                  fullWidth
                  required
                  helperText="Select the lawyer this assistant works under."
                >
                  <MenuItem value="">
                    Select Lawyer
                  </MenuItem>

                  {lawyers.map((lawyer) => (
                    <MenuItem
                      key={lawyer.id}
                      value={lawyer.id}
                    >
                      {lawyer.firstName}{" "}
                      {lawyer.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>

            <Divider />

            <Box className="create-user-actions">
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenCreateUser(false);
                  resetCreateUserForm();
                }}
                disabled={teamLoading}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleCreateUser}
                disabled={teamLoading}
              >
                {teamLoading
                  ? "Creating..."
                  : "Create User"}
              </Button>
            </Box>
          </Card>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbarOpen(false)
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={() =>
            setSnackbarOpen(false)
          }
          variant="filled"
        >
          {error || message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;