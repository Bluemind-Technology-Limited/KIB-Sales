import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Buildings2, Call, DirectInbox, Edit, ToggleOff, ToggleOn } from 'iconsax-reactjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  loadDistributors,
  saveDistributor,
  toggleDistributor,
  clearDistributorError,
  selectDistributors,
  selectDistributorsStatus,
  selectDistributorSaving,
  selectDistributorError,
} from '../../store/slices/distributorSlice';
import type { Distributor } from '../../types/domain';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import { Paginator } from '../../components/ui/Paginator';
import { usePagination } from '../../hooks/usePagination';
import { FormField, inputClass } from '../../components/ui/FormField';

const PAGE_SIZE = 10;

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  address: string;
}

const emptyForm: FormState = { name: '', email: '', phone: '', location: '', address: '' };

/** Manage distributors: create, edit and toggle active state. */
export function DistributorsPage() {
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectDistributors);
  const status = useAppSelector(selectDistributorsStatus);
  const saving = useAppSelector(selectDistributorSaving);
  const error = useAppSelector(selectDistributorError);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dismissedError, setDismissedError] = useState(false);

  const load = useCallback(() => {
    dispatch(loadDistributors());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDismissedError(false);
  }, [status, saving]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d: Distributor) => {
    setEditing(d);
    setForm({ name: d.name, email: d.email, phone: d.phone, location: d.location, address: d.address });
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const result = dispatch(saveDistributor({ id: editing?.id, input: form }));
    result.then((action) => {
      if (saveDistributor.fulfilled.match(action)) {
        setShowModal(false);
      }
    });
  };

  const handleToggle = (id: string) => {
    dispatch(toggleDistributor(id));
  };

  const loading = status === 'loading' && list.length === 0;
  const pagination = usePagination(PAGE_SIZE, list.length, status);
  const paged = pagination.slice(list);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributors"
        subtitle="Create and manage the distributors sales users are assigned to."
        actions={<Button onClick={openAdd} withPlusIcon fullWidth>Add Distributor</Button>}
      />

      {error && !dismissedError && (
        <Alert
          message={error}
          onDismiss={() => {
            setDismissedError(true);
            dispatch(clearDistributorError());
          }}
        />
      )}

      {status === 'failed' && !loading ? (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <ErrorState title="Could not load distributors" onRetry={load} />
        </div>
      ) : loading ? (
        <TableSkeleton cols={5} rows={6} hasAvatar />
      ) : (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          {list.length === 0 ? (
            <EmptyState title="No distributors yet" hint="Add your first distributor to get started." />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-semibold">Distributor</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((d) => (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#EA4335]/10 flex items-center justify-center shrink-0">
                            <Buildings2 size={16} className="text-[#EA4335]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171717] leading-none">{d.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{d.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <DirectInbox size={12} className="text-slate-400" /> {d.email}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                          <Call size={10} /> {d.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{d.location}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Edit distributor">
                            <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Edit">
                              <Edit size={14} />
                            </button>
                          </Tooltip>
                          <Tooltip content={d.isActive ? 'Deactivate' : 'Activate'}>
                            <button onClick={() => handleToggle(d.id)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Toggle active">
                              {d.isActive ? <ToggleOn size={14} variant="Bold" className="text-[#EA4335]" /> : <ToggleOff size={14} />}
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
                {editing ? 'Edit Distributor' : 'Add Distributor'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Name" required span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Email" span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Location">
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Address" span>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Distributor'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </AnimatePresence>
    </div>
  );
}
