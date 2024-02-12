import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpointHeader = `${apiUrl}/quotationsHeaders`;
const apiEndpointDetail = `${apiUrl}/quotationsDetails`;

function quotationHeaderUrl(id) {
  return `${apiEndpointHeader}/${id}/`;
}

function quotationDetailUrl(id) {
  return `${apiEndpointDetail}/${id}/`;
}

export function getQuotationsHeader(
  companyId,
  customerId,
  headerId,
  currentPage,
  sortColumn
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  let urlQuery = `${apiEndpointHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}`;

  if (customerId) urlQuery += `&customer=${customerId}`;
  if (headerId) urlQuery += `&id=${headerId}`;
  
  return http.get(urlQuery);
}

export function getQuotationHeader(companyId, id) {
  return http.get(
    `${apiEndpointHeader}/?company=${companyId}&id=${id}`
  );
}

export function getQuotationDetail(quotationHeaderId) {
  return http.get(`${apiEndpointDetail}/?header=${quotationHeaderId}`);
}

export function saveQuotationHeader(quotationHeader) {
  if (quotationHeader.id) {
    const body = { ...quotationHeader };
    delete body.id;
    return http.put(quotationHeaderUrl(quotationHeader.id), body);
  }

  return http.post(`${apiEndpointHeader}/`, quotationHeader);
}

export function saveQuotationDetail(quotationDetail, quotationHeaderId) {
  if (quotationDetail.id) {
    const body = { ...quotationDetail };
    delete body.id;
    return http.put(quotationDetailUrl(quotationDetail.id), body);
  }

  return http.post(`${apiEndpointDetail}/`, quotationDetail);
}

export function deleteQuotationHeader(id) {
  return http.delete(quotationHeaderUrl(id));
}

export function deleteQuotationDetail(id) {
  return http.delete(quotationDetailUrl(id));
}
