import { ITenantResponse } from '@shared/types/responses';
import { Tenant } from '../models';
import { ITenant } from '../types';
import { Document } from 'mongoose';

/**
 * Convert Tenant model to ITenantResponse
 */
export function toTenantResponse(tenant: Document & ITenant): ITenantResponse {
  return {
    _id: String(tenant._id),
    name: tenant.name,
    domain: tenant.domain,
    logo: tenant.logo,
    address: tenant.address,
    contactEmail: tenant.contactEmail,
    contactPhone: tenant.contactPhone,
    settings: tenant.settings,
    subscription: tenant.subscription,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt
  };
}

