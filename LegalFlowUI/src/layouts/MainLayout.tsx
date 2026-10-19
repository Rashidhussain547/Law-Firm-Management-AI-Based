import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleIcon from "@mui/icons-material/People";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import type { RootState } from "../store/store";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

type MainLayoutProps = {
  mode: "light" | "dark";
  onToggleTheme: () => void;
};

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Clients", path: "/clients", icon: <PeopleIcon /> },
  { label: "Cases", path: "/cases", icon: <GavelOutlinedIcon /> },
  { label: "Hearings", path: "/hearings", icon: <EventOutlinedIcon /> },
  { label: "Tasks", path: "/tasks", icon: <TaskOutlinedIcon /> },
  { label: "Documents", path: "/documents", icon: <DescriptionOutlinedIcon /> },
  {label: "Notes" , path: "/notes" , icon: <NotesOutlinedIcon/>}
];

function MainLayout({ mode, onToggleTheme }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname,
    );
    if (currentItem) return currentItem.label;
    if (location.pathname === "/settings") return "Settings";
    return "Dashboard";
  };

  const getUserInitials = () => {
    if (!currentUser) return "U";
    const first = currentUser.firstName?.[0] ?? "";
    const last = currentUser.lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Toolbar sx={{ px: 3, minHeight: "64px !important" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            letterSpacing: "-0.5px",
          }}
        >
          LegalFlow
        </Typography>
      </Toolbar>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              selected={isActive}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 44,
                transition: "all 0.2s ease-in-out",
                "&.Mui-selected": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(79, 70, 229, 0.18)"
                      : "rgba(79, 70, 229, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: isActive ? 700 : 500 }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ mt: "auto", px: 1.5, pb: 2 }}>
        <ListItemButton
          selected={location.pathname === "/settings"}
          onClick={() => handleNavigation("/settings")}
          sx={{
            borderRadius: 2,
            minHeight: 44,
            "&.Mui-selected": {
              backgroundColor:
                mode === "dark"
                  ? "rgba(79, 70, 229, 0.18)"
                  : "rgba(79, 70, 229, 0.08)",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: location.pathname === "/settings" ? 700 : 500,
                }}
              >
                Settings
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Box>
  );
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Container */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              mode === "dark"
                ? "rgba(18, 18, 18, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, sm: 3 } }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              {getPageTitle()}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Theme Toggle Button */}
              <Tooltip
                title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
              >
                <IconButton
                  onClick={onToggleTheme}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  {mode === "dark" ? (
                    <LightModeOutlinedIcon fontSize="small" />
                  ) : (
                    <DarkModeOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, height: 24, my: "auto" }}
              />

              {/* User Avatar Action */}
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  p: 0.5,
                  borderRadius: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor:
                      mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials()}
                </Avatar>

                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {currentUser
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : "User"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {currentUser?.role ?? "Guest"}
                  </Typography>
                </Box>
              </Box>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    elevation: 4,
                    sx: {
                      // mt: 1.5,
                      // minWidth: 180,
                      // borderRadius: 2,
                      // border: "1px solid",
                      borderColor: "divider",
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleNavigation("/settings")}>
                  <ListItemIcon>
                    <SettingsOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon sx={{ color: "error.main" }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
