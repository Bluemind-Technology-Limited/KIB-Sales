import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft2, ArrowRight2, Logout } from 'iconsax-reactjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout, selectUser } from '../../store/slices/authSlice';
import { navItemsForRole, findNavItem } from './navigation';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';

/**
 * Shared dashboard shell for both roles: collapsible sidebar + sticky topbar
 * + routed content. Branding and navigation are derived from the signed-in
 * role (Super Admin vs Distributor).
 */
export function AppShell() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('kib-sfa-sb-collapsed') === '1'
  );

  const isDistributor = user?.role === 'DISTRIBUTOR';
  const brandTitle = isDistributor ? 'KIB Sales' : 'KIB Admin';
  const brandSub = isDistributor ? 'Distributor' : 'Super Admin';
  const navItems = navItemsForRole(user?.role);
  const active = findNavItem(location.pathname, navItems);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('kib-sfa-sb-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed((v) => !v);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const sidebarWidth = collapsed ? 'w-[64px]' : 'w-[240px]';

  return (
    <div className="min-h-screen bg-app-bg text-text flex font-sans">
      {/* Sidebar (desktop) */}
      <aside
        className={`hidden md:flex ${sidebarWidth} shrink-0 flex-col bg-sidebar border-r border-border h-screen sticky top-0 z-30 transition-[width] duration-200`}
      >
        <div
          className={`h-[58px] border-b border-border/80 flex items-center justify-between px-3 gap-1 ${
            collapsed ? 'px-2' : 'px-4'
          }`}
        >
          <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
            <img
              src="/kib-group.png"
              alt="KIB Group"
              className="h-10 w-auto object-contain shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-text leading-tight truncate">{brandTitle}</p>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{brandSub}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="text-text-muted hover:text-text transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft2 size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overscroll-contain kib-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact === true}
                className={({ isActive }) =>
                  `w-full group flex items-center justify-center py-2 rounded-[var(--radius-control)] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-accent-tint text-accent border border-accent/30'
                      : 'text-text hover:bg-accent-hover-tint hover:text-accent'
                  } ${collapsed ? '' : 'gap-3 px-3 justify-start'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {collapsed ? (
                      <Tooltip content={item.label} side="right">
                        <Icon
                          size={18}
                          variant={isActive ? 'Bold' : 'Linear'}
                          className={isActive ? 'text-accent' : 'text-text group-hover:text-accent'}
                        />
                      </Tooltip>
                    ) : (
                      <>
                        <Icon
                          size={18}
                          variant={isActive ? 'Bold' : 'Linear'}
                          className={isActive ? 'text-accent' : 'text-text group-hover:text-accent'}
                        />
                        <span className="text-[13px] font-semibold group-hover:text-accent">{item.label}</span>
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/80 bg-sidebar">
          <Tooltip content="Sign Out" side="right" className="block w-full">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:bg-rose-50/50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-white`}
            >
              <Logout size={15} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[58px] bg-sidebar border-b border-border/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            {collapsed && (
              <button
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="hidden md:inline-flex p-1 text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                <ArrowRight2 size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm">
              {/* Mobile: logo + brand text (matches sidebar) */}
              <div className="flex items-center gap-2 md:hidden">
                <img src="/kib-group.png" alt="KIB Group" className="h-10 w-auto object-contain shrink-0 self-center mt-1" />
                <div className="min-w-0 leading-tight self-center">
                  <p className="text-[13px] font-bold text-text truncate">{brandTitle}</p>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{brandSub}</p>
                </div>
              </div>
              <span className="hidden md:inline text-text-muted tracking-tight">Sales Force Automation</span>
              <ArrowRight2 size={14} className="text-text-subtle" />
              <span className="text-[#313131] font-medium tracking-tight">{active?.label ?? ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-text leading-none">{user?.fullName}</p>
              <p className="text-[10px] text-text-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Account menu"
              className="md:hidden p-0.5 rounded-full ring-accent/30 cursor-pointer hover:ring-2 transition"
            >
              <Avatar name={user?.fullName} size="sm" />
            </button>
            <div className="hidden md:block">
              <Avatar name={user?.fullName} size="sm" />
            </div>
          </div>
        </header>

        {/* iOS bottom tab bar (mobile) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-border/60 bg-white/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.exact === true}
                className={({ isActive }) =>
                  `group flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
                    isActive ? 'text-accent' : 'text-text-muted active:text-accent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      variant={isActive ? 'Bold' : 'Linear'}
                      className={isActive ? 'text-accent' : 'text-text-muted group-active:text-accent'}
                    />
                    <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* iOS action sheet (mobile account / sign out) */}
        {accountOpen && (
          <>
            <button
              aria-label="Close account menu"
              onClick={() => setAccountOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm cursor-pointer"
            />
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-4 py-4 border-b border-slate-100">
                  <p className="text-sm font-bold text-[#171717] leading-tight">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 break-all">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-rose-600 font-semibold text-sm bg-white hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <Logout size={17} /> Sign Out
                </button>
              </div>
              <button
                type="button"
                onClick={() => setAccountOpen(false)}
                className="w-full mt-3 py-3.5 bg-white rounded-2xl text-sm font-semibold text-slate-700 shadow-2xl cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        <main className="flex-grow overflow-y-auto p-4 md:p-8 bg-app-bg pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
