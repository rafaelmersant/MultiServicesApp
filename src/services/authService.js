//import jwtDecode from "jwt-decode";
import http from "./httpService";
import { clearStoredSession, isSessionActive, sessionExpiresAt, watchSessionExpiry } from "./sessionService";
import { environment } from "../settings";

const apiEndpoint = `${environment.apiUrl}/auth`;
const token = {
  userId: "ms_userId",
  email: "ms_email",
  name: "ms_name",
  role: "ms_role",
  companyId: "ms_companyId",
  companyName: "ms_companyName",
  apiToken: "ms_apiToken"
};

export async function login(credentials) {
  const { data: jwt } = await http.post(`${apiEndpoint}/login/`, credentials);
  if (!jwt.apiToken || sessionExpiresAt(jwt.apiToken) <= Date.now()) throw new Error("El servidor no entregó una sesión vigente. Actualiza el backend e inicia sesión nuevamente.");
  clearStoredSession();

  localStorage.setItem(token.userId, jwt.id);
  localStorage.setItem(token.email, jwt.email);
  localStorage.setItem("ms_rememberedEmail", jwt.email);
  localStorage.setItem(token.name, jwt.name);
  localStorage.setItem(token.role, jwt.role);
  localStorage.setItem(token.companyId, jwt.companyId);
  if (jwt.apiToken) {
    localStorage.setItem(token.apiToken, jwt.apiToken);
    http.setJwt(jwt.apiToken);
  }
}

export function logout() {
  clearStoredSession();
  sessionStorage.removeItem("ms_sessionReturnTo");
  http.setJwt(null);
}

export function getCurrentUser() {
  try {
    if (!isSessionActive()) {
      clearStoredSession();
      http.setJwt(null);
      return null;
    }
    const apiToken = localStorage.getItem(token.apiToken);
    http.setJwt(apiToken);

    return {
      id: parseInt(localStorage.getItem(token.userId)),
      name: localStorage.getItem(token.name),
      email: localStorage.getItem(token.email),
      role: localStorage.getItem(token.role),
      companyId: localStorage.getItem(token.companyId),
      companyName: localStorage.getItem(token.companyName)
    };
  } catch (ex) {
    return null;
  }
}

export default {
  login,
  logout,
  getCurrentUser,
  watchSessionExpiry
};
