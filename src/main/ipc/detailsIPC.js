import { ipcMain } from 'electron';
import { listAllCustomers, findCustomers, saveCustomerInfo, removeCustomer, fetchCustomer } from '../services/customerService.js';
import { listAllProducts, findProducts, saveProductInfo, removeProduct, fetchProduct, fetchProductByHsn } from '../services/productService.js';

export function registerDetailsIPC() {
  // --- Customers / Company Directory ---
  ipcMain.handle('customers:list', async (_, search) => {
    return listAllCustomers(search || '');
  });

  ipcMain.handle('customers:search', async (_, query) => {
    return findCustomers(query || '');
  });

  ipcMain.handle('customers:save', async (_, customerData) => {
    return saveCustomerInfo(customerData);
  });

  ipcMain.handle('customers:delete', async (_, id) => {
    return removeCustomer(id);
  });

  ipcMain.handle('customers:get', async (_, id) => {
    return fetchCustomer(id);
  });

  // --- Products / Items Catalog ---
  ipcMain.handle('products:list', async (_, search) => {
    return listAllProducts(search || '');
  });

  ipcMain.handle('products:search', async (_, query) => {
    return findProducts(query || '');
  });

  ipcMain.handle('products:getByHsn', async (_, hsnCode) => {
    return fetchProductByHsn(hsnCode || '');
  });

  ipcMain.handle('products:save', async (_, productData) => {
    return saveProductInfo(productData);
  });

  ipcMain.handle('products:delete', async (_, id) => {
    return removeProduct(id);
  });

  ipcMain.handle('products:get', async (_, id) => {
    return fetchProduct(id);
  });
}
