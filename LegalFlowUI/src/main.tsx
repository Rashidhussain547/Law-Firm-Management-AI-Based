import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store/store";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <Provider store={store}>
      <CssBaseline />
      <App />
    </Provider>
  </React.StrictMode>
);