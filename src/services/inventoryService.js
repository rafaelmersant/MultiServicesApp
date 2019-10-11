import http from "./httpService";
import { getCurrentUser } from "./authService";
import { apiUrl } from "../config.json";

const apiEndpointProdTracking = `${apiUrl}/productsTrackings`;
const apiEndpointProdStock = `${apiUrl}/productsStocks`;

function productsTrackingUrl(id) {
  return `${apiEndpointProdTracking}/${id}`;
}

function productsStockUrl(id) {
  return `${apiEndpointProdStock}/${id}`;
}

export function getProductsTrackings(companyId, invoicesRecords) {
  if (invoicesRecords) {
    console.log(`${apiEndpointProdTracking}/?company=${companyId}`);
    return http.get(`${apiEndpointProdTracking}/?company=${companyId}`);
  } else {
    console.log(
      `${apiEndpointProdTracking}/?company=${companyId}&concept=INVE`
    );
    return http.get(
      `${apiEndpointProdTracking}/?company=${companyId}&concept=INVE`
    );
  }
}

export function getProductsTrackingsRange(productId, startDate, endDate) {
  if (startDate && endDate)
    return http.get(
      `${apiEndpointProdTracking}/?product=${productId}&startDate=${startDate}&endDate=${endDate}`
    );

  return http.get(`${apiEndpointProdTracking}/?product=${productId}`);
}

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

export async function updateProductStock(inventory) {
  const { data: productStock } = await getProductsStocks(inventory.product_id);

  const stock = {
    id: "",
    product_id: inventory.product_id,
    quantityAvailable: inventory.quantity ? inventory.quantity : 0,
    quantityHold: 0,
    company_id: getCurrentUser().companyId,
    lastUpdated: new Date().toISOString(),
    modifiedUser: getCurrentUser().email
  };

  if (productStock.length) {
    const quantity =
      inventory.typeTracking === "E"
        ? parseFloat(inventory.quantity)
        : parseFloat(inventory.quantity) * -1;

    const quantityAvailable = parseFloat(productStock[0].quantityAvailable);
    const newQuantity = Math.round((quantityAvailable + quantity) * 100) / 100;

    stock.id = productStock[0].id;
    stock.quantityAvailable = newQuantity;

    console.log("Tracking possible issue");
    console.log("productStock", productStock);
    console.log("quantity", quantity);
    console.log("quantityAvailable", quantityAvailable);
    console.log("newQuantity", newQuantity);
    console.log("stockToSave", stock);
  }

  await saveProductStock(stock);
}