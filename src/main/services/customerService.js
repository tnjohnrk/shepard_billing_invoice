import { searchCustomers, saveOrUpdateCustomer } from '../repositories/customerRepository.js';

export function findCustomers(query) {
  return searchCustomers(query);
}

export function saveCustomerInfo(customerData) {
  return saveOrUpdateCustomer(customerData);
}
