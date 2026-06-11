import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextType {
  tenantId?: string;
  isSuperAdmin?: boolean;
  userId?: string;
}

export const TenantContext = new AsyncLocalStorage<TenantContextType>();
