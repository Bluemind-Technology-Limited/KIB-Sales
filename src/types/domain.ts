/**
 * Core Sales Force Automation domain types for the merged KIB SFA web app.
 * One source of truth for both the Super Admin and Distributor dashboards.
 *
 * Backend naming is reconciled here: the API returns `name` for people, which
 * maps to `fullName` (see services/mappers.ts). `password` no longer lives on
 * the User type — Supabase handles authentication.
 */

export type UserRole = 'SALES' | 'DISTRIBUTOR' | 'SUPER_ADMIN';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  distributorId: string | null;
  isActive: boolean;
  phone?: string;
  createdAt?: string;
}

export interface Distributor {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
}

export interface RequestItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface ProductRequest {
  id: string;
  salesUserId: string;
  salesUserName: string;
  distributorId: string;
  distributorName: string;
  status: RequestStatus;
  items: RequestItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

/** Super Admin platform-wide metrics. */
export interface AdminMetrics {
  totalDistributors: number;
  totalSales: number;
  totalProducts: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

/** Metrics scoped to a signed-in distributor. */
export interface DashboardMetrics {
  totalSales: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalRequests: number;
}
