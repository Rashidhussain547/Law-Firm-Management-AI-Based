import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../store/store";

const ProtectedRoute = () => {
  const location = useLocation();

  const isAuthenticated = useSelector(
    (state: RootState) =>
      state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;