import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/customers`;

function customerUrl(id) {
  return `${apiEndpoint}/${id}/`;
}

export function getCustomers(companyId, sortColumn, currentPage, searchQuery) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  let urlQuery = `${apiEndpoint}/?company_id=${companyId}&ordering=${order}${column}&page=${page}`;

  if (searchQuery) urlQuery += `&search=${searchQuery}`;

  return http.get(urlQuery);
}

export function getCustomersByName(companyId, searchText) {
  if (searchText)
    return http.get(
      `${apiEndpoint}/?company_id=${companyId}&search=${searchText}`
    );

  return http.get(`${apiEndpoint}/`);
}

export function getCustomerByFirstLastName(companyId, firstName, lastName) {
  return http.get(
    `${apiEndpoint}/?company_id=${companyId}&firstName=${firstName}&lastName=${lastName}`
  );
}

export function getCustomer(customerId) {
  return http.get(`${apiEndpoint}/?id=${customerId}`);
}

export function saveCustomer(customer) {
  if (customer.id) {
    const body = { ...customer };
    delete body.id;
    delete body.creationDate;
    console.log('BEFORE SAVE CUSTOMER:', body)
    return http.put(customerUrl(customer.id), body);
  }

  return http.post(`${apiEndpoint}/`, customer);
}

export function deleteCustomer(customerId) {
  return http.delete(customerUrl(customerId));
}
