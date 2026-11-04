//import jwtDecode from "jwt-decode";
import http from "./httpService";
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

  localStorage.setItem(token.userId, jwt.id);
  localStorage.setItem(token.email, jwt.email);
  localStorage.setItem(token.name, jwt.name);
  localStorage.setItem(token.role, jwt.role);
  localStorage.setItem(token.companyId, jwt.companyId);
  if (jwt.apiToken) {
    localStorage.setItem(token.apiToken, jwt.apiToken);
    http.setJwt(jwt.apiToken);
  }
}

export function logout() {
  localStorage.removeItem(token.userId);
  localStorage.removeItem(token.email);
  localStorage.removeItem(token.name);
  localStorage.removeItem(token.role);
  localStorage.removeItem(token.companyId);
  localStorage.removeItem(token.companyName);
  localStorage.removeItem(token.apiToken);
  http.setJwt(null);
}

export function getCurrentUser() {
  try {
    if (!localStorage.getItem(token.email)) return null;
    const apiToken = localStorage.getItem(token.apiToken);
    if (apiToken) http.setJwt(apiToken);

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
  getCurrentUser
};
