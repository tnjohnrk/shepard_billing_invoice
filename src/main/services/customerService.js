import { searchCustomers, saveOrUpdateCustomer, getAllCustomers, deleteCustomer, getCustomerById } from '../repositories/customerRepository.js';

export function findCustomers(query) {
  return searchCustomers(query);
}

export function listAllCustomers(search) {
  return getAllCustomers(search);
}

export function saveCustomerInfo(customerData) {
  return saveOrUpdateCustomer(customerData);
}

export function removeCustomer(id) {
  return deleteCustomer(id);
}

export function fetchCustomer(id) {
  return getCustomerById(id);
}
