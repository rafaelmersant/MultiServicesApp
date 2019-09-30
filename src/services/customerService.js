import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/customers`;

function customerUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getCustomers() {
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
