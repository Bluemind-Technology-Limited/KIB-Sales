import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Call, DirectInbox, Edit, ToggleOff, ToggleOn } from 'iconsax-reactjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  loadSalesUsers,
  saveSalesUser,
  toggleSalesUser,
  clearSalesUserError,
  selectSalesUsers,
  selectSalesUsersStatus,
  selectSalesUserSaving,
  selectSalesUserError,
} from '../../store/slices/salesUserSlice';
import {
  loadDistributors,
  selectDistributors,
  selectDistributorsStatus,
} from '../../store/slices/distributorSlice';
import type { User } from '../../types/domain';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import { Avatar } from '../../components/ui/Avatar';
import { FormField, inputClass } from '../../components/ui/FormField';
import { Paginator } from '../../components/ui/Paginator';
import { usePagination } from '../../hooks/usePagination';

const PAGE_SIZE = 10;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  authId: string;
  distributorId: string;
}

const emptyForm: FormState = { fullName: '', email: '', phone: '', authId: '', distributorId: '' };

/** Manage sales users: create, edit, assign to a distributor, toggle active. */
export function SalesUsersPage() {
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectSalesUsers);
  const status = useAppSelector(selectSalesUsersStatus);
  const saving = useAppSelector(selectSalesUserSaving);
  const error = useAppSelector(selectSalesUserError);
  const distributors = useAppSelector(selectDistributors);
  const distributorStatus = useAppSelector(selectDistributorsStatus);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dismissedError, setDismissedError] = useState(false);

  const load = useCallback(() => {
    dispatch(loadSalesUsers());
    if (distributorStatus === 'idle') dispatch(loadDistributors());
  }, [dispatch, distributorStatus]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDismissedError(false);
  }, [status, saving]);

  const distributorName = (id: string | null) => distributors.find((d) => d.id === id)?.name ?? 'Unassigned';

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone ?? '',
      authId: '', // only needed when creating — the backend never returns it on the wire
      distributorId: u.distributorId ?? '',
    });
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;
    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      distributorId: form.distributorId || null,
      // The backend links users to an existing Supabase auth account via authId.
      ...(!editing ? { authId: form.authId } : {}),
    };
    const result = dispatch(saveSalesUser({ id: editing?.id, input: payload }));
    result.then((action) => {
      if (saveSalesUser.fulfilled.match(action)) setShowModal(false);
    });
  };

  const handleToggle = (id: string) => dispatch(toggleSalesUser(id));

  const loading = status === 'loading' && list.length === 0;
  const pagination = usePagination(PAGE_SIZE, list.length, status);
  const paged = pagination.slice(list);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Users"
        subtitle="Create, edit and assign the sales team to distributors."
        actions={<Button onClick={openAdd} withPlusIcon fullWidth>Add Sales User</Button>}
      />

      {error && !dismissedError && (
        <Alert
          message={error}
          onDismiss={() => {
            setDismissedError(true);
            dispatch(clearSalesUserError());
          }}
        />
      )}

      {status === 'failed' && !loading ? (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <ErrorState title="Could not load sales users" onRetry={load} />
        </div>
      ) : loading ? (
        <TableSkeleton cols={5} rows={6} hasAvatar />
      ) : (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          {list.length === 0 ? (
            <EmptyState title="No sales users yet" hint="Add sales users and assign them to distributors." />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-semibold">Sales User</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Assigned Distributor</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.fullName} size="sm" />
                          <p className="text-xs font-bold text-[#171717] leading-none">{u.fullName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <DirectInbox size={12} className="text-slate-400" /> {u.email}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                          <Call size={10} /> {u.phone || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            u.distributorId
                              ? 'bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {u.distributorId ? distributorName(u.distributorId) : 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Edit sales user">
                            <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Edit">
                              <Edit size={14} />
                            </button>
                          </Tooltip>
                          <Tooltip content={u.isActive ? 'Deactivate' : 'Activate'}>
                            <button onClick={() => handleToggle(u.id)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Toggle active">
                              {u.isActive ? <ToggleOn size={14} variant="Bold" className="text-[#EA4335]" /> : <ToggleOff size={14} />}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <Paginator
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={PAGE_SIZE}
                total={pagination.total}
                onChange={pagination.onPageChange}
              />
            </>
          )}
        </div>
      )}

      <AnimatePresence>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} maxWidth="max-w-xl">
          <form onSubmit={submit} className="kib-scroll bg-white rounded-xl w-full max-w-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#171717]">
                {editing ? 'Edit Sales User' : 'Add Sales User'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Full Name" required span>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Email" required span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Supabase Auth ID" required={!editing} span>
                <input
                  value={form.authId}
                  onChange={(e) => setForm({ ...form, authId: e.target.value })}
                  placeholder={editing ? 'Only used when creating' : "e.g. the user's Supabase UID"}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Assigned Distributor" span>
                <select
                  value={form.distributorId}
                  onChange={(e) => setForm({ ...form, distributorId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Unassigned</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Sales User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </AnimatePresence>
    </div>
  );
}
