import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/customers`;

function customerUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getCustomers(companyId) {
  if (companyId) return http.get(`${apiEndpoint}/?company_id=${companyId}`);

  return http.get(`${apiEndpoint}/`);
}

export function getCustomersByName(companyId, searchText) {
  if (searchText)
    return http.get(
      `${apiEndpoint}/?company_id=${companyId}&search=${searchText}`
    );

  return http.get(`${apiEndpoint}/`);
}

export function getCustomer(customerId) {
  return http.get(`${apiEndpoint}/?id=${customerId}`);
}

export function saveCustomer(customer) {
  if (customer.id) {
    const body = { ...customer };
    delete body.id;
    return http.put(customerUrl(customer.id), body);
  }

  return http.post(`${apiEndpoint}/`, customer);
}

export function deleteCustomer(customerId) {
  return http.delete(customerUrl(customerId));
}
