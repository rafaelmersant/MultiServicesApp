import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpointHeader = `${apiUrl}/invoicesHeaders`;
const apiEndpointDetail = `${apiUrl}/invoicesDetails`;
const apiEndpointSequence = `${apiUrl}/sequenceInvoice`;

function invoiceHeaderUrl(id) {
  return `${apiEndpointHeader}/${id}`;
}

function invoiceDetailUrl(id) {
  return `${apiEndpointDetail}/${id}`;
}

export function getNextInvoiceSequence(companyId) {
  return http.get(`${apiEndpointSequence}/${companyId}`);
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

export function getInvoicesDetail(invoiceHeaderId) {
  return http.get(`${apiEndpointHeader}/?invoice=${invoiceHeaderId}`);
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

export function deleteInvoiceHeader(invoiceHeaderId) {
  return http.delete(invoiceHeaderUrl(invoiceHeaderId));
}

export function deleteInvoiceDetail(id) {
  return http.delete(invoiceDetailUrl(id));
}
