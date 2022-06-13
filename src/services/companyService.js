import http from "./httpService";
import { environment } from "../settings";

const apiEndpoint = `${environment.apiUrl}/companies`;

function companyUrl(id) {
  return `${apiEndpoint}/${id}/`;
}

export function getCompanies() {
  return http.get(`${apiEndpoint}/`);
}

export function getCompany(companyId) {
  return http.get(`${apiEndpoint}/?id=${companyId}`);
}

export function saveCompany(company) {
  if (company.id) {
    const body = { ...company };
    delete body.id;
    return http.put(companyUrl(company.id), body);
  }

  return http.post(`${apiEndpoint}/`, company);
}

export function deleteCompany(companyId) {
  return http.delete(companyUrl(companyId));
}
