import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/products`;

function productUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getProducts(companyId) {
  return http.get(`${apiEndpoint}/?company=${companyId}`);
}

export function getProductsByDescription(companyId, description) {
  return http.get(`${apiEndpoint}/?company=${companyId}&search=${description}`);
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
