import { getCompanyDetails } from '../repositories/companyRepository.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

export function getCompanyProfile() {
  const repoDetails = getCompanyDetails();
  return repoDetails || COMPANY_CONFIG;
}
