import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { Link, useNavigate } from "react-router-dom";

import authApi from "../../api/authApi";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [firmName, setFirmName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authApi.register({
        firmName,
        firstName,
        lastName,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Account created successfully. Please sign in to continue.",
        },
      });
    } catch (error: any) {
      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()[0];

        setError(
          typeof firstError === "string"
            ? firstError
            : "Please check your information."
        );
      } else {
        setError(error?.response?.data?.message || "Unable to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="register-page">
      {/* LEFT — form */}
      <Box className="register-left">
        <Box className="register-left-inner">
          <Box className="register-logo">
            <Box className="register-logo-icon">
              <GavelRoundedIcon />
            </Box>
            <Typography variant="h6" className="register-logo-text">
              LegalFlow
            </Typography>
          </Box>

          <Box className="register-header">
            <Typography variant="h4" className="register-title">
              Create your firm
            </Typography>
            <Typography variant="body2" className="register-subtitle">
              Set up your LegalFlow account and start managing your legal
              practice.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="register-alert">
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="register-form"
          >
            <TextField
              label="Firm name"
              value={firmName}
              onChange={(event) => setFirmName(event.target.value)}
              placeholder="ABC Law Firm"
              required
              fullWidth
              autoComplete="organization"
            />

            <Box className="register-name-row">
              <TextField
                label="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="John"
                required
                fullWidth
                autoComplete="given-name"
              />

              <TextField
                label="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Doe"
                required
                fullWidth
                autoComplete="family-name"
              />
            </Box>

            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="john@abclaw.com"
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
              fullWidth
              autoComplete="new-password"
              helperText="Password must be at least 8 characters."
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="register-button"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>

          <Box className="register-footer">
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link to="/login" className="register-login-link">
              Sign in
            </Link>
          </Box>
        </Box>
      </Box>

      {/* RIGHT — brand visual */}
      <Box className="register-right">
        <Box className="register-right-eyebrow">
          <AutoAwesomeRoundedIcon />
          AI-Powered Legal Practice
        </Box>

        <Box className="register-right-copy">
          <Typography className="register-right-title">
            Built for law firms who move fast.
          </Typography>
          <Typography className="register-right-subtitle">
            Manage cases, hearings, tasks, notes and documents — and let AI
            generate case reports so your team spends less time on paperwork.
          </Typography>
        </Box>

        <Box className="register-visual">
          <Box className="register-visual-floating-badge">
            <AutoAwesomeRoundedIcon />
            AI Reports
          </Box>

          <Box className="register-visual-card">
            <Box className="register-visual-row">
              <Box className="register-visual-icon">
                <FolderRoundedIcon />
              </Box>
              <Box className="register-visual-row-text">
                <strong>Case Management</strong>
                <span>Track every case from intake to close</span>
              </Box>
            </Box>

            <Box className="register-visual-row">
              <Box className="register-visual-icon">
                <EventRoundedIcon />
              </Box>
              <Box className="register-visual-row-text">
                <strong>Hearings & Tasks</strong>
                <span>Never miss a court date or deadline</span>
              </Box>
            </Box>

            <Box className="register-visual-row">
              <Box className="register-visual-icon">
                <DescriptionRoundedIcon />
              </Box>
              <Box className="register-visual-row-text">
                <strong>Notes & Documents</strong>
                <span>Everything organized in one place</span>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="register-feature-list">
          {["Cases", "Hearings", "Tasks", "Notes", "Documents", "AI Reports"].map(
            (item) => (
              <span key={item} className="register-feature-pill">
                {item}
              </span>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Register;