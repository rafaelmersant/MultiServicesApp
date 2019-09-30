import jwtDecode from "jwt-decode";
import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/auth`;
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(credentials) {
  const { data: jwt } = await http.post(`${apiEndpoint}/login/`, credentials);

  localStorage.setItem("ms_email", jwt.email);
  localStorage.setItem("ms_name", jwt.name);
  localStorage.setItem("ms_role", jwt.role);
  //localStorage.setItem(tokenKey, jwt);
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  //localStorage.removeItem(tokenKey);
  localStorage.removeItem("ms_email");
  localStorage.removeItem("ms_name");
  localStorage.removeItem("ms_role");
}

export function getCurrentUser() {
  try {
    return {
      name: localStorage.getItem("ms_name"),
      email: localStorage.getItem("ms_email"),
      role: localStorage.getItem("ms_role")
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
