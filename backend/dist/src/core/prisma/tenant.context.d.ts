import { AsyncLocalStorage } from 'async_hooks';
export interface TenantContextType {
    tenantId?: string;
    isSuperAdmin?: boolean;
    userId?: string;
}
export declare const TenantContext: AsyncLocalStorage<TenantContextType>;
