import http from "./httpService";
import { getCurrentUser } from "./authService";
import { apiUrl } from "../config.json";
import { getPurchaseOrderByProduct, savePurchaseOrder } from "./productService";

const apiEndpointProdTrackingHeader = `${apiUrl}/productsTrackingsHeader`;
const apiEndpointProdTracking = `${apiUrl}/productsTrackings`;
const apiEndpointProdStock = `${apiUrl}/productsStocks`;

function productsTrackingHeaderUrl(id) {
  return `${apiEndpointProdTrackingHeader}/${id}`;
}

function productsTrackingUrl(id) {
  return `${apiEndpointProdTracking}/${id}`;
}

function productsStockUrl(id) {
  return `${apiEndpointProdStock}/${id}`;
}

export function getProductsTrackingsHeader(
  companyId,
  currentPage,
  sortColumn,
  providerName
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  return http.get(
    `${apiEndpointProdTrackingHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}&provider_name=${providerName}`
  );
}

export function getProductsTrackingsHeaderById(id) {
  return http.get(`${apiEndpointProdTrackingHeader}/?id=${id}`);
}

export function getProductsTrackings(
  companyId,
  productId,
  currentPage,
  sortColumn,
  invoicesRecords
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  if (invoicesRecords) {
    return http.get(
      `${apiEndpointProdTracking}/?company=${companyId}&product=${productId}&ordering=${order}${column}&page=${page}`
    );
  } else {
    return http.get(
      `${apiEndpointProdTracking}/?company=${companyId}&concept=INVE&product=${productId}&ordering=${order}${column}&page=${page}`
    );
  }
}

export function getProductsTrackingsByHeader(headerId) {
  return http.get(`${apiEndpointProdTracking}/?header=${headerId}`);
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

export function getProductsStocksByCompany(companyId) {
  return http.get(`${apiEndpointProdStock}/?company=${companyId}`);
}

export function getProviderInInventory(companyId, providerId) {
  return http.get(
    `${apiEndpointProdTrackingHeader}/?company=${companyId}&provider_id=${providerId}`
  );
}

export function saveProductTrackingHeader(entry) {
  if (entry.id) {
    const body = { ...entry };
    delete body.id;
    return http.put(productsTrackingHeaderUrl(entry.id), body);
  }
  return http.post(`${apiEndpointProdTrackingHeader}/`, entry);
}

export function saveProductTracking(entry) {
  const tracking = { ...entry };

  if (tracking.typeTracking === "S") tracking.quantity = tracking.quantity * -1;

  if (entry.id) {
    const body = { ...entry };
    delete body.id;
    return http.put(productsTrackingUrl(entry.id), body);
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

export function deleteTrackingHeader(trackingId) {
  return http.delete(productsTrackingHeaderUrl(trackingId));
}

export async function deleteTracking(entry) {
  await updateProductStock({
    quantity: entry.quantity,
    product_id: entry.product.id
  });
  return http.delete(productsTrackingUrl(entry.id));
}

export function deleteStock(stockId) {
  return http.delete(productsStockUrl(stockId));
}

export async function updateProductStock(inventory) {
  const { data: productStock } = await getProductsStocks(inventory.product_id);
  const quantity =
    inventory.typeTracking === "E"
      ? parseFloat(inventory.quantity)
      : parseFloat(inventory.quantity) * -1;

  const stock = {
    id: "",
    product_id: inventory.product_id,
    quantityAvailable: quantity,
    quantityHold: 0,
    company_id: getCurrentUser().companyId,
    lastUpdated: new Date().toISOString(),
    modifiedUser: getCurrentUser().email
  };

  if (productStock.length) {
    const quantityAvailable = parseFloat(productStock[0].quantityAvailable);
    const newQuantity = Math.round((quantityAvailable + quantity) * 100) / 100;

    stock.id = productStock[0].id;
    stock.quantityAvailable = newQuantity;

    if (productStock[0].product.minimumStock > newQuantity) {
      const { data: order } = await getPurchaseOrderByProduct(
        productStock[0].product.company.id,
        productStock[0].product.id
      );

      if (!order.count) {
        await savePurchaseOrder({
          id: 0,
          product_id: productStock[0].product.id,
          quantity: newQuantity,
          company_id: getCurrentUser().companyId,
          creationDate: new Date().toISOString()
        });
      }
    }

    console.log("Updating Stock START...");
    console.log("Tracking possible issue");
    console.log("productStock", productStock);
    console.log("quantity", quantity);
    console.log("quantityAvailable", quantityAvailable);
    console.log("newQuantity", newQuantity);
    console.log("stockToSave", stock);
    console.log("Updating Stock END...");
  }

  await saveProductStock(stock);
}
