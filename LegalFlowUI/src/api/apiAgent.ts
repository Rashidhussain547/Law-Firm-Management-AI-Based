import axios from "axios";

const apiAgent = axios.create({
  baseURL: "http://localhost:5130/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiAgent.interceptors.request.use((config) => {
  const token = localStorage.getItem("legalflow-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiAgent.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";

      const isAuthRequest =
        requestUrl.includes("/Auth/login") ||
        requestUrl.includes("/Auth/register");

      if (!isAuthRequest) {
        localStorage.removeItem("legalflow-token");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiAgent;