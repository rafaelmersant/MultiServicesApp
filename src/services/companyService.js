import http from "./httpService";
import { apiUrl } from "../config.json";

export function getCompanies() {
  return http.get(`${apiUrl}/companies/`);
}
