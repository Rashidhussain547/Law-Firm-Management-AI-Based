import { useMemo, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import MainLayout from "./layouts/MainLayout";
import { getTheme } from "./theme/theme";
import { ThemeModeProvider, useThemeMode } from "./theme/ThemeContext";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

import Dashboard from "./pages/dashboard/Dashboard";
import Clients from "./pages/clients/Clients";
import Cases from "./pages/cases/Cases";
import Hearings from "./pages/hearings/Hearings";
import Documents from "./pages/documents/Documents";
import Tasks from "./pages/tasks/Tasks";
import Notes from "./pages/notes/Notes";
import Settings from "./pages/settings/Settings";
import { useDispatch } from "react-redux";
import authApi from "./api/authApi";
import { setCurrentUser } from "./store/slices/authSlice";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const { mode, toggleTheme } = useThemeMode();
  const dispatch = useDispatch();

  const theme = useMemo(() => getTheme(mode), [mode]);

  // Plain CSS files (Cases.css, Tasks.css, etc.) can't read MUI's theme,
  // so we mirror the current mode onto <html data-theme="..."> and let
  // theme-variables.css handle the color switching for them.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem("legalflow-token");

      if (!token) {
        return;
      }

      try {
        const currentUser = await authApi.getMe();

        dispatch(setCurrentUser(currentUser));
      } catch {
        // apiAgent handles 401 and redirects to login.
      }
    };

    loadCurrentUser();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route
              element={<MainLayout mode={mode} onToggleTheme={toggleTheme} />}
            >
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/clients" element={<Clients />} />

              <Route path="/cases" element={<Cases />} />

              <Route path="/hearings" element={<Hearings />} />

              <Route path="/tasks" element={<Tasks />} />

              <Route path="/notes" element={<Notes />} />

              <Route path="/documents" element={<Documents />} />

              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}

export default App;