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
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import authApi from "../../api/authApi";
import { setCredentials } from "../../store/slices/authSlice";
import "./Login.css";

type LocationState = {
  message?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const locationState = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loginResponse = await authApi.login({ email, password });

      localStorage.setItem("legalflow-token", loginResponse.token);

      const currentUser = await authApi.getMe();

      dispatch(
        setCredentials({
          token: loginResponse.token,
          currentUser,
        })
      );

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      {/* LEFT — form */}
      <Box className="login-left">
        <Box className="login-left-inner">
          <Box className="login-logo">
            <Box className="login-logo-icon">
              <GavelRoundedIcon />
            </Box>
            <Typography variant="h6" className="login-logo-text">
              LegalFlow
            </Typography>
          </Box>

          <Box className="login-header">
            <Typography variant="h4" className="login-title">
              Welcome back
            </Typography>
            <Typography variant="body2" className="login-subtitle">
              Sign in to continue managing your cases.
            </Typography>
          </Box>

          {locationState?.message && (
            <Alert severity="success" className="login-alert">
              {locationState.message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" className="login-alert">
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="login-form"
          >
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@abclaw.com"
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          <Box className="login-footer">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            <Link to="/register" className="login-footer-link">
              Register now
            </Link>
          </Box>
        </Box>
      </Box>

      {/* RIGHT — brand visual */}
      <Box className="login-right">
        <Box className="login-right-eyebrow">
          <AutoAwesomeRoundedIcon />
          AI-Powered Legal Practice
        </Box>

        <Box className="login-right-copy">
          <Typography className="login-right-title">
            Every case, organized. Every insight, automated.
          </Typography>
          <Typography className="login-right-subtitle">
            Track cases, hearings, tasks, notes and documents in one place —
            while AI drafts case reports and summaries for you.
          </Typography>
        </Box>

        <Box className="login-visual">
          <Box className="login-visual-floating-badge">
            <CheckCircleRoundedIcon />
            Report ready
          </Box>

          <Box className="login-visual-card">
            <Box className="login-visual-card-header">
              <span className="login-visual-case-badge">Automate</span>
              <span className="login-visual-status">Firm Base</span>
            </Box>

            <Typography className="login-visual-case-title">
              Organized your Case step by step
            </Typography>

            <Box className="login-visual-meta-row">
              <span className="login-visual-meta-item">
                <EventRoundedIcon /> Mark Date
              </span>
              <span className="login-visual-meta-item">
                <TaskAltRoundedIcon /> Tasks
              </span>
            </Box>

            <Box className="login-visual-divider" />

            <Box className="login-visual-ai-row">
              <Box className="login-visual-ai-icon">
                <AutoAwesomeRoundedIcon />
              </Box>
              <Box>
                <Box className="login-visual-ai-title">AI Case Summary</Box>
                <Box className="login-visual-ai-text">
                  Make your report by using AI tool
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="login-feature-list">
          {["Cases", "Hearings", "Tasks", "Notes", "Documents", "AI Reports"].map(
            (item) => (
              <span key={item} className="login-feature-pill">
                {item}
              </span>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;