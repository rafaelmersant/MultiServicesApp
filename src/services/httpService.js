import axios from "axios";
import { environment } from "../settings";
import { expireSession, hasStoredSession, isSessionActive, isSessionRejection } from "./sessionService";
import logger from "./logService";
import { toast } from "react-toastify";

function isBackendRequest(config = {}) {
  try {
    const base = new URL(environment.apiUrl, window.location.origin);
    const url = new URL(config.url || "", config.baseURL || window.location.origin);
    return base.origin === url.origin && (url.pathname === base.pathname.replace(/\/$/, "") || url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/"));
  } catch (error) { return false; }
}

const isLoginRequest = config => /\/auth\/login\/?(?:[?]|$)/.test((config && config.url) || "");

axios.interceptors.request.use(config => {
  if (isBackendRequest(config) && !isLoginRequest(config) && hasStoredSession()) {
    if (!isSessionActive()) {
      setJwt(null);
      expireSession();
      return Promise.reject(new axios.Cancel("La sesión expiró."));
    }
    config.headers = { ...config.headers, "x-auth-token": localStorage.getItem("ms_apiToken") };
  }
  return config;
});

axios.interceptors.response.use(null, error => {
  if (axios.isCancel(error)) return Promise.reject(error);
  if (isBackendRequest(error.config) && !isLoginRequest(error.config) && hasStoredSession() && error.response && isSessionRejection(error.response.status, error.response.data)) {
    setJwt(null);
    expireSession();
    return Promise.reject(error);
  }
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    logger.log(error);
    toast.error("An unexpected error occurred.");
  } else {
    const { data } = error.response;

    var errors = "";
    if (data !== "null") {
      for (var propName in data) {
        if (data.hasOwnProperty(propName)) {
          const propValue = data[propName];
          errors += `${propName} : ${propValue[0]}\n`;
        }
      }
      toast.error(errors);

      if (errors.includes("invoices header with this sequence already exists")) {
        error.message = "invoice sequence duplicated";
      }
    }
  }

  return Promise.reject(error);
});

function setJwt(jwt) {
  if (jwt) axios.defaults.headers.common["x-auth-token"] = jwt;
  else delete axios.defaults.headers.common["x-auth-token"];
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt
};



