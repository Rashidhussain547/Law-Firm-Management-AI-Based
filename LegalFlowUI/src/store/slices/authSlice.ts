import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { CurrentUser } from "../../types/auth";

type AuthState = {
  token: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
};

const token = localStorage.getItem("legalflow-token");
const savedUser = localStorage.getItem("legalflow-user");

const initialState: AuthState = {
  token,
  currentUser: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        currentUser: CurrentUser;
      }>
    ) => {
      state.token = action.payload.token;
      state.currentUser = action.payload.currentUser;
      state.isAuthenticated = true;
      localStorage.setItem("legalflow-token", action.payload.token);
      localStorage.setItem("legalflow-user", JSON.stringify(action.payload.currentUser));
    },

    setCurrentUser: (
      state,
      action: PayloadAction<CurrentUser>
    ) => {
      state.currentUser = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.currentUser = null;
      state.isAuthenticated = false;

      localStorage.removeItem("legalflow-token");
    },
  },
});

export const {
  setCredentials,
  setCurrentUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;