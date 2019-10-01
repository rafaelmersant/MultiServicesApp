import jwtDecode from "jwt-decode";
import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/auth`;
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(credentials) {
  const { data: jwt } = await http.post(`${apiEndpoint}/login/`, credentials);

  localStorage.setItem("ms_userId", jwt.id);
  localStorage.setItem("ms_email", jwt.email);
  localStorage.setItem("ms_name", jwt.name);
  localStorage.setItem("ms_role", jwt.role);
  localStorage.setItem("ms_companyId", jwt.companyId);
  //localStorage.setItem(tokenKey, jwt);
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  //localStorage.removeItem(tokenKey);
  localStorage.removeItem("ms_userId");
  localStorage.removeItem("ms_email");
  localStorage.removeItem("ms_name");
  localStorage.removeItem("ms_role");
  localStorage.removeItem("ms_companyId");
}

export function getCurrentUser() {
  try {
    if (!localStorage.getItem("ms_email")) return null;

    return {
      id: parseInt(localStorage.getItem("ms_userId")),
      name: localStorage.getItem("ms_name"),
      email: localStorage.getItem("ms_email"),
      role: localStorage.getItem("ms_role"),
      companyId: localStorage.getItem("ms_companyId")
    };

    //jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt
};
