import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/fiscalGov`;

function entryUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getEntries(typeDoc, companyId) {
  if (typeDoc === null)
    return http.get(`${apiEndpoint}/?company_id=${companyId}`);

  return http.get(`${apiEndpoint}/?typeDoc=${typeDoc}&company_id=${companyId}`);
}

export function getNextNCF(typeDoc, companyId) {
  return http.get(
    `${apiEndpoint}/?typeDoc=${typeDoc}&companyId=${companyId}&active=1`
  );
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
