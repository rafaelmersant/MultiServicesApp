import http from "./httpService";
import { getCurrentUser } from "./authService";
import { environment } from "../settings";
import {
  getProduct,
  getPurchaseOrderByProduct,
  saveProduct,
  savePurchaseOrder,
} from "./productService";
import * as Sentry from "@sentry/react";

const apiEndpointProdTrackingHeader = `${environment.apiUrl}/productsTrackingsHeader`;
const apiEndpointProdTracking = `${environment.apiUrl}/productsTrackings`;
const apiEndpointProdTrackingLong = `${environment.apiUrl}/productsTrackingsLong`;
const apiEndpointProdStock = `${environment.apiUrl}/productsStocks`;

function productsTrackingHeaderUrl(id) {
  return `${apiEndpointProdTrackingHeader}/${id}/`;
}

function productsTrackingUrl(id) {
  return `${apiEndpointProdTracking}/${id}/`;
}

function productsStockUrl(id) {
  return `${apiEndpointProdStock}/${id}/`;
}

export function getProductsTrackingsHeader(
  companyId,
  currentPage,
  sortColumn,
  providerName,
  all
) {
  const order = sortColumn && sortColumn.order === "desc" ? "-" : "";
  const column =
    sortColumn && sortColumn.path ? sortColumn.path : "creationDate";
  const page = currentPage ? currentPage : 1;

  if (all) {
    return http.get(
      `${apiEndpointProdTrackingHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}&all=${all}`
    );
  }

  return http.get(
    `${apiEndpointProdTrackingHeader}/?company=${companyId}&ordering=${order}${column}&page=${page}&provider_name=${providerName}`
  );
}

export function getProductsTrackingsHeaderByYear(
  companyId,
  year
) {
  return http.get(
    `${apiEndpointProdTrackingHeader}/?company=${companyId}&year=${year}`
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
  return http.get(`${apiEndpointProdTrackingLong}/?header=${headerId}`);
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
    `${apiEndpointProdTrackingHeader}/?company=${companyId}&provider=${providerId}`
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
    product_id: entry.product.id,
  });
  return http.delete(productsTrackingUrl(entry.id));
}

export function deleteStock(stockId) {
  return http.delete(productsStockUrl(stockId));
}

export async function updateProductStock(inventory) {
  try {
    const { data: productStock } = await getProductsStocks(
      inventory.product_id
    );
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
      modifiedUser: getCurrentUser().email,
    };

    if (productStock.length) {
      const quantityAvailable = parseFloat(
        productStock[0].quantityAvailable ?? 0
      );
      const newQuantity =
        Math.round((quantityAvailable + quantity) * 100) / 100;

      stock.id = productStock[0].id;
      stock.quantityAvailable = newQuantity;

      try {
        if (productStock[0].product.minimumStock > newQuantity) {
          const { data: order } = await getPurchaseOrderByProduct(
            productStock[0].product.company_id,
            productStock[0].product.id
          );
  
          if (!order.count) {
            await savePurchaseOrder({
              id: 0,
              product_id: productStock[0].product.id,
              quantity: newQuantity,
              company_id: getCurrentUser().companyId,
              creationDate: new Date().toISOString(),
            });
          }
        }
      } catch(ex) {
        Sentry.captureException(ex);
        console.log(ex);
      }
      
      console.log("productStock", productStock);
      console.log("quantity", quantity);
      console.log("quantityAvailable", quantityAvailable);
      console.log("newQuantity", newQuantity);
      console.log("stockToSave", stock);
    }

    await saveProductStock(stock);
  } catch (ex) {
    Sentry.captureException(ex);
  }
}

export async function replaceProductStock(inventory) {
  try {
    const { data: productStock } = await getProductsStocks(
      inventory.product_id
    );

    const stock = {
      id: productStock[0].id,
      product_id: inventory.product_id,
      quantityAvailable: inventory.quantity,
      quantityHold: 0,
      company_id: getCurrentUser().companyId,
      lastUpdated: new Date().toISOString(),
      modifiedUser: getCurrentUser().email,
    };

    await saveProductStock(stock);

    const { data: products } = await getProduct(inventory.product_id);

    const product = {
      id: products.results[0].id,
      description: products.results[0].description,
      descriptionLong: products.results[0].descriptionLong
        ? products.results[0].descriptionLong
        : "",
      price: products.results[0].price,
      cost: products.results[0].cost ? products.results[0].cost : 0,
      itbis: products.results[0].itbis ? products.results[0].itbis : 0,
      measure: products.results[0].measure ? products.results[0].measure : "",
      model: products.results[0].model ? products.results[0].model : "",
      category_id: products.results[0].category.id,
      barcode: products.results[0].barcode ? products.results[0].barcode : "",
      minimumStock: products.results[0].minimumStock
        ? products.results[0].minimumStock
        : "",
      company_id: products.results[0].company.id,
      createdUser: products.results[0].createdUser
        ? products.results[0].createdUser
        : getCurrentUser().email,
      creationDate: products.results[0].creationDate,
      updated: !products.results[0].updated,
    };

    await saveProduct(product);
  } catch (ex) {
    Sentry.captureException(ex);
  }
}
