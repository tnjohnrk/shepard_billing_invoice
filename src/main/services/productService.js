import { getAllProducts, searchProducts, saveOrUpdateProduct, deleteProduct, getProductById, getProductByHsn } from '../repositories/productRepository.js';

export function listAllProducts(search) {
  return getAllProducts(search);
}

export function findProducts(query) {
  return searchProducts(query);
}

export function saveProductInfo(productData) {
  return saveOrUpdateProduct(productData);
}

export function removeProduct(id) {
  return deleteProduct(id);
}

export function fetchProduct(id) {
  return getProductById(id);
}

export function fetchProductByHsn(hsnCode) {
  return getProductByHsn(hsnCode);
}
