import type {
  AdminMetrics,
  DashboardMetrics,
  Distributor,
  Product,
  ProductRequest,
  RequestItem,
  RequestStatus,
  User,
} from '../types/domain';

/**
 * Tolerant mappers that translate backend JSON into the frontend domain
 * shapes, matching the SFA backend contract (see backend-SFA/src/swagger.json):
 *
 * - people are `name` on the wire, `fullName` in the UI
 * - requests nest `salesUser` / `distributor` objects and `items[].product`;
 *   `reviewNote` maps to `notes`
 * - the backend has no product `price`/`stock` and no request `totalAmount`,
 *   so those default to 0 until the data model adds them
 */

type Row = Record<string, unknown>;

function pick<T>(row: Row | undefined, key: string): T | undefined {
  return row?.[key] as T | undefined;
}

export function asArray(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

function asString(value: unknown): string {
  return value == null ? '' : String(value);
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function mapUser(raw: Row): User {
  return {
    id: asString(pick(raw, 'id')),
    role: (pick(raw, 'role') as User['role'] | undefined) ?? 'SALES',
    fullName: asString(pick(raw, 'name') ?? pick(raw, 'fullName')),
    email: asString(pick(raw, 'email')),
    distributorId: (pick(raw, 'distributorId') ?? pick(raw, 'distributor_id') ?? null) as string | null,
    isActive: (pick(raw, 'isActive') ?? pick(raw, 'is_active') ?? true) as boolean,
    phone: pick<string>(raw, 'phone') ?? undefined,
    createdAt: pick<string>(raw, 'createdAt') ?? pick<string>(raw, 'created_at'),
  };
}

export function mapDistributor(raw: Row): Distributor {
  return {
    id: asString(pick(raw, 'id')),
    name: asString(pick(raw, 'name')),
    email: asString(pick(raw, 'email')),
    phone: asString(pick(raw, 'phone')),
    // The backend User table has no location/address — empty until added.
    location: asString(pick(raw, 'location')),
    address: asString(pick(raw, 'address')),
    isActive: (pick(raw, 'isActive') ?? pick(raw, 'is_active') ?? true) as boolean,
    createdAt: pick<string>(raw, 'createdAt') ?? pick<string>(raw, 'created_at'),
  };
}

export function mapProduct(raw: Row): Product {
  return {
    id: asString(pick(raw, 'id')),
    name: asString(pick(raw, 'name')),
    sku: asString(pick(raw, 'sku')),
    description: asString(pick(raw, 'description')),
    unit: asString(pick(raw, 'unit')),
    // price/stock are not in the backend model yet — default to 0.
    price: asNumber(pick(raw, 'price')),
    stock: asNumber(pick(raw, 'stock')),
    isActive: (pick(raw, 'isActive') ?? pick(raw, 'is_active') ?? true) as boolean,
    createdAt: pick<string>(raw, 'createdAt') ?? pick<string>(raw, 'created_at'),
  };
}

/** Flatten a backend request item (embedded `product`) into the flat RequestItem shape. */
function mapRequestItem(item: Row): RequestItem {
  const product = pick<Row>(item, 'product');
  return {
    productId: asString(pick(item, 'productId') ?? pick(product, 'id')),
    productName: asString(pick(item, 'productName') ?? pick(product, 'name')),
    unit: asString(pick(item, 'unit') ?? pick(product, 'unit')),
    price: asNumber(pick(item, 'price') ?? pick(product, 'price')),
    quantity: asNumber(pick(item, 'quantity')),
  };
}

export function mapRequest(raw: Row): ProductRequest {
  const items: RequestItem[] = asArray(raw.items).map(mapRequestItem);
  const salesUser = pick<Row>(raw, 'salesUser') ?? pick<Row>(raw, 'sales_user');
  const distributor = pick<Row>(raw, 'distributor');

  return {
    id: asString(pick(raw, 'id')),
    salesUserId: asString(pick(salesUser, 'id')),
    salesUserName: asString(pick(salesUser, 'name')),
    distributorId: asString(pick(distributor, 'id')),
    distributorName: asString(pick(distributor, 'name')),
    status: asString(pick(raw, 'status')) as RequestStatus,
    items,
    // The backend returns no totalAmount (and no product price) — compute
    // from items as a fallback (0 until prices exist in the data model).
    totalAmount: asNumber(pick(raw, 'totalAmount') ?? pick(raw, 'total_amount')) || 0,
    notes: (pick<string>(raw, 'reviewNote') ?? pick<string>(raw, 'review_note')) ?? pick<string>(raw, 'notes'),
    createdAt: asString(pick(raw, 'createdAt') ?? pick(raw, 'created_at')),
    reviewedAt: pick<string>(raw, 'reviewedAt') ?? pick<string>(raw, 'reviewed_at'),
  };
}

export function mapAdminMetrics(raw: Row): AdminMetrics {
  return {
    totalDistributors: asNumber(pick(raw, 'totalDistributors') ?? pick(raw, 'total_distributors')),
    totalSales: asNumber(pick(raw, 'totalSalesUsers') ?? pick(raw, 'totalSales') ?? pick(raw, 'total_sales')),
    totalProducts: asNumber(pick(raw, 'totalProducts') ?? pick(raw, 'total_products')),
    pendingRequests: asNumber(pick(raw, 'pendingRequests') ?? pick(raw, 'pending_requests')),
    approvedRequests: asNumber(pick(raw, 'approvedRequests') ?? pick(raw, 'approved_requests')),
    rejectedRequests: asNumber(pick(raw, 'rejectedRequests') ?? pick(raw, 'rejected_requests')),
  };
}

export function mapDashboardMetrics(raw: Row): DashboardMetrics {
  return {
    totalSales: asNumber(pick(raw, 'totalSalesUsers') ?? pick(raw, 'totalSales') ?? pick(raw, 'total_sales')),
    pendingRequests: asNumber(pick(raw, 'pendingRequests') ?? pick(raw, 'pending_requests')),
    approvedRequests: asNumber(pick(raw, 'approvedRequests') ?? pick(raw, 'approved_requests')),
    rejectedRequests: asNumber(pick(raw, 'rejectedRequests') ?? pick(raw, 'rejected_requests')),
    totalRequests: asNumber(pick(raw, 'totalRequests') ?? pick(raw, 'total_requests')),
  };
}
