import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeModeProvider = ({
  children,
}: ThemeProviderProps) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("legalflow-theme");

    return savedMode === "dark" ? "dark" : "light";
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("legalflow-theme", newMode);
  };

  const toggleTheme = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleTheme,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeMode must be used inside ThemeModeProvider"
    );
  }

  return context;
};