import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,

      primary: {
        main: isDark ? "#58A6FF" : "#4F46E5", // GitHub's signature blue in dark mode
      },

      secondary: {
        main: isDark ? "#3FB950" : "#0EA5E9", // GitHub's green accent for dark mode
      },

      background: {
        default: isDark ? "#0D1117" : "#F6F8FB", // GitHub's canvas background
        paper: isDark ? "#161B22" : "#FFFFFF",   // GitHub's card/panel background
      },

      text: {
        primary: isDark ? "#C9D1D9" : "#111827",   // GitHub's main text
        secondary: isDark ? "#8B949E" : "#6B7280", // GitHub's muted text
      },

      divider: isDark ? "#30363D" : "#E5E7EB", // GitHub's border color

      error: {
        main: isDark ? "#F85149" : "#DC2626",
      },

      warning: {
        main: isDark ? "#D29922" : "#B45309",
      },

      success: {
        main: isDark ? "#3FB950" : "#059669",
      },

      info: {
        main: isDark ? "#58A6FF" : "#2563EB",
      },
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',

      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            border: isDark ? "1px solid #30363D" : "1px solid #E5E7EB",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.35)"
              : "0 2px 12px rgba(0, 0, 0, 0.04)",
          }),
        },
      },

      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#161B22" : "#FFFFFF",
            borderBottom: isDark ? "1px solid #30363D" : "1px solid #E5E7EB",
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#0D1117" : "#FFFFFF",
            borderRight: isDark ? "1px solid #30363D" : "none",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // MUI dark mode default gradient overlay hata dia — GitHub flat look
          },
        },
      },
    },
  });
};