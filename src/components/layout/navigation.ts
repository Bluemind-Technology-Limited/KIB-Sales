import type { Icon } from 'iconsax-reactjs';
import { Box1, Buildings2, ClipboardText, Home2, Profile2User } from 'iconsax-reactjs';
import type { UserRole } from '../../types/domain';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: Icon;
  /** Exact match only — used for the role index (dashboard) item. */
  exact?: boolean;
}

/** Super Admin dashboard navigation. */
export const adminNavItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', path: '/admin', icon: Home2, exact: true },
  { id: 'distributors', label: 'Distributors', path: '/admin/distributors', icon: Buildings2 },
  { id: 'sales-users', label: 'Sales Users', path: '/admin/sales-users', icon: Profile2User },
  { id: 'products', label: 'Products', path: '/admin/products', icon: Box1 },
  { id: 'requests', label: 'Requests', path: '/admin/requests', icon: ClipboardText },
];

/** Distributor dashboard navigation. */
export const distributorNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', path: '/distributor', icon: Home2, exact: true },
  { id: 'sales-team', label: 'Sales Team', path: '/distributor/sales-team', icon: Profile2User },
  { id: 'requests', label: 'Requests', path: '/distributor/requests', icon: ClipboardText },
];

/** Navigation for the signed-in role; unknown roles fall back to the admin set. */
export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return role === 'DISTRIBUTOR' ? distributorNavItems : adminNavItems;
}

export function findNavItem(pathname: string, items: NavItem[]): NavItem | undefined {
  // Prefer the most specific (longest) path so e.g. /admin/products matches
  // Products rather than the index Overview item.
  const sorted = [...items].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path)
  );
}
