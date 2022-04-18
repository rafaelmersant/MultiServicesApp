import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = `${apiUrl}/productCategories`;

function prodCategoryUrl(id) {
  return `${apiEndpoint}/${id}/`;
}

export function getProductsCategories(companyId) {
  if (companyId)
    return http.get(
      `${apiEndpoint}/?company=${companyId}&ordering=description`
    );

  return http.get(`${apiEndpoint}/`);
}

export function getProductsCategoriesByDescrp(companyId, descrp) {
  return http.get(`${apiEndpoint}/?company=${companyId}&description=${descrp}`);
}

export function getProductCategory(categoryId) {
  return http.get(`${apiEndpoint}/?id=${categoryId}`);
}

export function saveProductCategory(category) {
  console.log(category);
  if (category.id) {
    const body = { ...category };
    delete body.id;
    return http.put(prodCategoryUrl(category.id), body);
  }

  return http.post(`${apiEndpoint}/`, category);
}

export function deleteCategory(categoryId) {
  return http.delete(prodCategoryUrl(categoryId));
}
