import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/products`;
const apiEndpointPurchaseOrder = `${apiUrl}/purchaseOrders`;

function productUrl(id) {
  return `${apiEndpoint}/${id}/`;
}

export function getProducts(companyId, currentPage, sortColumn) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "description";
  const page = currentPage ? currentPage : 1;

  if (currentPage)
    return http.get(
      `${apiEndpoint}/?company=${companyId}&ordering=${order}${column}&page=${page}`
    );

  return http.get(
    `${apiEndpoint}/?company=${companyId}&ordering=${order}${column}`
  );
}

export function getProductsByDescription(
  companyId,
  description,
  currentPage,
  sortColumn
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "description";
  const page = currentPage ? currentPage : 1;

  return http.get(
    `${apiEndpoint}/?company=${companyId}&search=${description}&ordering=${order}${column}&page=${page}`
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

//Purchase Order
export function getPurchaseOrder(
  companyId,
  currentPage,
  product,
  sortColumn,
  pending = true
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  if (product)
    return http.get(
      `${apiEndpointPurchaseOrder}/?search=${product}&company=${companyId}&pending=${pending}&ordering=${order}${column}&page=${page}`
    );

  return http.get(
    `${apiEndpointPurchaseOrder}/?company=${companyId}&pending=${pending}&ordering=${order}${column}&page=${page}`
  );
}

export function getPurchaseOrderByProduct(companyId, productId) {
  return http.get(
    `${apiEndpointPurchaseOrder}/?product=${productId}&company=${companyId}&pending=true`
  );
}

export function savePurchaseOrder(order) {
  if (order.id) {
    const body = { ...order };
    delete body.id;
    return http.put(`${apiEndpointPurchaseOrder}/${order.id}/`, body);
  }

  return http.post(`${apiEndpointPurchaseOrder}/`, order);
}

export function getProductProviders(productId) {
  return http.get(`${apiUrl}/productsProviders/?product_id=${productId}`);
}
