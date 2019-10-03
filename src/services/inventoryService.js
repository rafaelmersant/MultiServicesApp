import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpointProdTracking = `${apiUrl}/productsTrackings`;
const apiEndpointProdStock = `${apiUrl}/productsStocks`;

function productsTrackingUrl(id) {
  return `${apiEndpointProdTracking}/${id}`;
}

function productsStockUrl(id) {
  return `${apiEndpointProdStock}/${id}`;
}

export function getProductsTrackings(companyId) {
  return http.get(`${apiEndpointProdTracking}/?company=${companyId}`);
}

export function getProductsTrackingsRange(productId, startDate, endDate) {
  if (startDate && endDate)
    return http.get(
      `${apiEndpointProdTracking}/?product=${productId}&startDate=${startDate}&endDate=${endDate}`
    );

  return http.get(`${apiEndpointProdTracking}/?product=${productId}`);
}

// export function getProductsStocks() {
//   return http.get(`${apiEndpointProdStock}/`);
// }

export function getProductsStocks(productId) {
  if (productId)
    return http.get(`${apiEndpointProdStock}/?product=${productId}`);

  return http.get(`${apiEndpointProdStock}/`);
}

export function saveProductTracking(tracking) {
  if (tracking.id) {
    const body = { ...tracking };
    delete body.id;
    return http.put(productsTrackingUrl(tracking.id), body);
  }

  return http.post(`${apiEndpointProdTracking}/`, tracking);
}

export function saveProductStock(stock) {
  if (stock.id) {
    const body = { ...stock };
    delete body.id;
    return http.put(productsStockUrl(stock.id), body);
  }

  return http.post(`${apiEndpointProdStock}/`, stock);
}

export function deleteTracking(trackingId) {
  return http.delete(productsTrackingUrl(trackingId));
}

export function deleteStock(stockId) {
  return http.delete(productsStockUrl(stockId));
}
