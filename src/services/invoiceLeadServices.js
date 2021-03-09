import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpointHeader = `${apiUrl}/invoicesLeadHeader`;
const apiEndpointDetail = `${apiUrl}/invoicesLeadDetail`;

function invoiceLeadHeaderUrl(id) {
  return `${apiEndpointHeader}/${id}`;
}

function invoiceLeadDetailUrl(id) {
  return `${apiEndpointDetail}/${id}`;
}

export async function getInvoiceLeadHeader(
  companyId,
  invoiceId,
  currentPage,
  sortColumn
) {
  if (invoiceId)
    return http.get(
      `${apiEndpointHeader}/?company=${companyId}&invoice=${invoiceId}`
    );

  if (currentPage || sortColumn) {
    const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
    const column =
      sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
    const page = currentPage ? currentPage : 1;

    return http.get(
      `${apiEndpointHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}`
    );
  }

  return http.get(`${apiEndpointHeader}/?company=${companyId}`);
}

export async function getInvoiceLeadHeaderByConduceId(companyId, conduceId) {
  return http.get(`${apiEndpointHeader}/?company=${companyId}&id=${conduceId}`);
}

export async function getInvoiceLeadHeaderById(id) {
  return http.get(`${apiEndpointHeader}/?id=${id}`);
}

export async function getInvoiceLeadDetail(invoiceLeadHeader) {
  if (invoiceLeadHeader) {
    return http.get(`${apiEndpointDetail}/?header=${invoiceLeadHeader.id}`);
  }

  return {};
}

export function saveInvoiceLeadHeader(invoiceLeadHeader) {
  if (invoiceLeadHeader.id) {
    const body = { ...invoiceLeadHeader };
    delete body.id;
    return http.put(invoiceLeadHeaderUrl(invoiceLeadHeader.id), body);
  }

  return http.post(`${apiEndpointHeader}/`, invoiceLeadHeader);
}

export function saveInvoiceLeadDetail(invoiceLeadDetail) {
  if (invoiceLeadDetail.id) {
    const body = { ...invoiceLeadDetail };
    delete body.id;
    return http.put(invoiceLeadDetailUrl(invoiceLeadDetail.id), body);
  }

  return http.post(`${apiEndpointDetail}/`, invoiceLeadDetail);
}

export function deleteInvoiceLeadHeader(id) {
  return http.delete(invoiceLeadHeaderUrl(id));
}

export function deleteInvoiceLeadDetail(id) {
  return http.delete(invoiceLeadDetailUrl(id));
}
