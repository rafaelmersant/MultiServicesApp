import http from "./httpService";
import { environment } from "../settings";

const apiEndpointHeader = `${environment.apiUrl}/invoicesHeaders`;
const apiEndpointDetail = `${environment.apiUrl}/invoicesDetails`;
const apiEndpointSequence = `${environment.apiUrl}/invoicesSequences`;
const apiEndpointDetailSimple = `${environment.apiUrl}/InvoicesDetailSimple`;
const apiEndpointProductReduced = `${environment.apiUrl}/invoicesDetailsReduced`;
const apiEndpointCancelInvoice = `${environment.apiUrl}/cancelInvoice`;

function invoiceHeaderUrl(id) {
  return `${apiEndpointHeader}/${id}/`;
}

function invoiceDetailUrl(id) {
  return `${apiEndpointDetail}/${id}/`;
}

function invoiceSequenceUrl(id) {
  return `${apiEndpointSequence}/${id}/`;
}

export function getInvoiceSequence(companyId) {
  return http.get(`${apiEndpointSequence}/?company=${companyId}`);
}

export function getInvoicesHeader(
  companyId,
  invoiceNo,
  customerId,
  paymentMethod,
  currentPage,
  sortColumn
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  let urlQuery = `${apiEndpointHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}`;

  if (invoiceNo) urlQuery += `&sequence=${invoiceNo}`;
  if (customerId) urlQuery += `&customer=${customerId}`;
  if (paymentMethod !== "ALL") urlQuery += `&paymentMethod=${paymentMethod}`;

  if (customerId || invoiceNo) urlQuery = urlQuery.replace("invoicesHeaders","invoicesHeadersSearch");

  return http.get(urlQuery);
}

export function getInvoicesHeaderFull(companyId, year) {
  let urlQuery = `${environment.apiUrl}/invoicesHeadersFull/?company=${companyId}&year=${year}&ordering=-creationDate`;

  return http.get(urlQuery);
}

export function getInvoiceHeader(companyId, sequence) {
  return http.get(
    `${apiEndpointHeader}/?company=${companyId}&sequence=${sequence}`
  );
}

export function getInvoicesHeaderByRange(start_date, end_date) {
  return http.get(
    `${apiEndpointHeader}/?start_date=${start_date}&end_date=${end_date}&ordering=-created_date`
  );
}

export function getInvoicesCustomersByRange(start_date, end_date) {
  return http.get(
    `${environment.apiUrl}/invoicesCustomers/?start_date=${start_date}&end_date=${end_date}`
  );
}

export function getEmployeesSalesByRange(start_date, end_date) {
  return http.get(
    `${environment.apiUrl}/employeesSales/?start_date=${start_date}&end_date=${end_date}`
  );
}

// export function getInvoiceDetail(invoiceHeaderId) {
//   return http.get(`${apiEndpointDetail}/?invoice=${invoiceHeaderId}`);
// }

export function getInvoiceDetail(invoiceHeaderId) {
  return http.get(`${apiEndpointDetailSimple}/?invoice=${invoiceHeaderId}`);
}

export function getProductInInvoice(companyId, productId) {
  return http.get(
    `${apiEndpointProductReduced}/?company=${companyId}&product=${productId}`
  );
}

export function getCustomerInInvoice(companyId, customerId) {
  return http.get(
    `${apiEndpointHeader}/?company=${companyId}&customer_id=${customerId}`
  );
}

export function saveInvoiceHeader(invoiceHeader) {
  if (invoiceHeader.id) {
    const body = { ...invoiceHeader };
    delete body.id;
    return http.put(invoiceHeaderUrl(invoiceHeader.id), body);
  }

  return http.post(`${apiEndpointHeader}/`, invoiceHeader);
}

export function saveInvoiceDetail(invoiceDetail, invoiceHeaderId) {
  if (invoiceDetail.id) {
    const body = { ...invoiceDetail };
    delete body.id;
    return http.put(invoiceDetailUrl(invoiceDetail.id), body);
  }

  return http.post(`${apiEndpointDetail}/`, invoiceDetail);
}

export async function saveInvoiceSequence(invoiceSequence) {
  if (invoiceSequence.id) {
    const body = { ...invoiceSequence };
    delete body.id;
    return http.put(invoiceSequenceUrl(invoiceSequence.id), body);
  }

  return http.post(`${apiEndpointSequence}/`, invoiceSequence);
}

export function deleteInvoiceHeader(id) {
  return http.delete(invoiceHeaderUrl(id));
}

export function deleteInvoiceDetail(id) {
  return http.delete(invoiceDetailUrl(id));
}

export function cancelInvoiceHeader(invoice) {
  return http.post(`${apiEndpointCancelInvoice}/${invoice}`);
}
