import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpointHeader = `${apiUrl}/invoicesHeaders`;
const apiEndpointDetail = `${apiUrl}/invoicesDetails`;
const apiEndpointSequence = `${apiUrl}/invoicesSequences`;

function invoiceHeaderUrl(id) {
  return `${apiEndpointHeader}/${id}`;
}

function invoiceDetailUrl(id) {
  return `${apiEndpointDetail}/${id}`;
}

function invoiceSequenceUrl(id) {
  return `${apiEndpointSequence}/${id}`;
}

export function getInvoiceSequence(companyId) {
  return http.get(`${apiEndpointSequence}/?company=${companyId}`);
}

export function getInvoicesHeader(companyId) {
  return http.get(`${apiEndpointHeader}/?company=${companyId}`);
}

export function getInvoiceHeader(companyId, sequence) {
  return http.get(
    `${apiEndpointHeader}/?company=${companyId}&sequence=${sequence}`
  );
}

export function getInvoiceDetail(invoiceHeaderId) {
  return http.get(`${apiEndpointDetail}/?invoice=${invoiceHeaderId}`);
}

export function getProductInInvoice(companyId, productId) {
  return http.get(
    `${apiEndpointDetail}/?company=${companyId}&product=${productId}`
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

export function saveInvoiceSequence(invoiceSequence) {
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
