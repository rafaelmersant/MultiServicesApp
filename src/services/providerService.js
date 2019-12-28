import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/providers`;

function providerUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getProviders(companyId) {
  if (companyId)
    return http.get(
      `${apiEndpoint}/?company_id=${companyId}&ordering=firstName`
    );

  return http.get(`${apiEndpoint}/`);
}

export function getProviderByName(companyId, searchText) {
  if (searchText)
    return http.get(
      `${apiEndpoint}/?company_id=${companyId}&search=${searchText}`
    );

  return http.get(`${apiEndpoint}/`);
}

export function getProviderByFirstName(companyId, firstName) {
  return http.get(
    `${apiEndpoint}/?company_id=${companyId}&firstName=${firstName}`
  );
}

export function getProvider(providerId) {
  return http.get(`${apiEndpoint}/?id=${providerId}`);
}

export function saveProvider(provider) {
  if (provider.id) {
    const body = { ...provider };
    delete body.id;
    return http.put(providerUrl(provider.id), body);
  }

  return http.post(`${apiEndpoint}/`, provider);
}

export function deleteProvider(providerId) {
  return http.delete(providerUrl(providerId));
}
