import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/products`;

function productUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getProducts(companyId, currentPage, sortColumn, sortOrder) {
  const order = sortOrder === "desc" ? "-" : "";
  console.log(
    `${apiEndpoint}/?company=${companyId}&ordering=${order}${sortColumn}&page=${currentPage}`
  );
  if (currentPage)
    return http.get(
      `${apiEndpoint}/?company=${companyId}&ordering=${order}${sortColumn}&page=${currentPage}`
    );

  return http.get(
    `${apiEndpoint}/?company=${companyId}&ordering=${order}${sortColumn}`
  );
}

export function getProductsByDescription(
  companyId,
  description,
  currentPage,
  sortColumn,
  sortOrder
) {
  const order = sortOrder === "desc" ? "-" : "";
  const page = currentPage ? currentPage : 1;

  return http.get(
    `${apiEndpoint}/?company=${companyId}&search=${description}&ordering=${order}${sortColumn}&page=${page}`
  );
}

export function getProductByExactDescription(companyId, description) {
  return http.get(
    `${apiEndpoint}/?company=${companyId}&description=${description}`
  );
}

export function getProduct(productId) {
  return http.get(`${apiEndpoint}/?id=${productId}`);
}

export function getCategoryInProduct(companyId, categoryId) {
  return http.get(
    `${apiEndpoint}/?company=${companyId}&category_id=${categoryId}`
  );
}

export function saveProduct(product) {
  if (product.id) {
    const body = { ...product };
    delete body.id;
    return http.put(productUrl(product.id), body);
  }

  return http.post(`${apiEndpoint}/`, product);
}

export function deleteProduct(productId) {
  return http.delete(productUrl(productId));
}
