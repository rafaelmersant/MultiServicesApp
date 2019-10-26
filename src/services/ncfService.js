import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/fiscalGov`;

function entryUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getEntries(companyId) {
  return http.get(`${apiEndpoint}/?company_id=${companyId}`);
}

export function getNextNCF(companyId) {
  return http.get(`${apiEndpoint}/?companyId=${companyId}&active=1`);
}

export function getEntryById(id) {
  return http.get(`${apiEndpoint}/?id=${id}`);
}

export function saveEntry(entry) {
  if (entry.id) {
    const body = { ...entry };
    delete body.id;
    return http.put(entryUrl(entry.id), body);
  }

  return http.post(`${apiEndpoint}/`, entry);
}

export function deleteEntry(entryId) {
  return http.delete(entryUrl(entryId));
}
