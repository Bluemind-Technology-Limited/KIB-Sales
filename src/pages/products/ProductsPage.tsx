import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Box1, Box2, Edit, ToggleOff, ToggleOn } from 'iconsax-reactjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  loadProducts,
  saveProduct,
  toggleProduct,
  clearProductError,
  selectProducts,
  selectProductsStatus,
  selectProductSaving,
  selectProductError,
} from '../../store/slices/productSlice';
import type { Product } from '../../types/domain';
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
import { formatCurrency } from '../../utils/format';

interface FormState {
  name: string;
  sku: string;
  description: string;
  unit: string;
  price: string;
  stock: string;
}

const emptyForm: FormState = { name: '', sku: '', description: '', unit: 'Crate', price: '', stock: '' };

/** Manage the product catalogue available to the sales team. */
export function ProductsPage() {
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const saving = useAppSelector(selectProductSaving);
  const error = useAppSelector(selectProductError);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dismissedError, setDismissedError] = useState(false);

  const load = useCallback(() => {
    dispatch(loadProducts());
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

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description,
      unit: p.unit,
      price: String(p.price),
      stock: String(p.stock),
    });
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;
    const input = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      unit: form.unit,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };
    const result = dispatch(saveProduct({ id: editing?.id, input }));
    result.then((action) => {
      if (saveProduct.fulfilled.match(action)) setShowModal(false);
    });
  };

  const handleToggle = (id: string) => dispatch(toggleProduct(id));

  const loading = status === 'loading' && list.length === 0;
  const pagination = usePagination(PAGE_SIZE, list.length, status);
  const paged = pagination.slice(list);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage the products the sales team can request from distributors."
        actions={<Button onClick={openAdd} withPlusIcon fullWidth>Add Product</Button>}
      />

      {error && !dismissedError && (
        <Alert
          message={error}
          onDismiss={() => {
            setDismissedError(true);
            dispatch(clearProductError());
          }}
        />
      )}

      {status === 'failed' && !loading ? (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <ErrorState title="Could not load products" onRetry={load} />
        </div>
      ) : loading ? (
        <TableSkeleton cols={5} rows={6} hasAvatar />
      ) : (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          {list.length === 0 ? (
            <EmptyState title="No products yet" hint="Add products to make them available to the sales team." />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">SKU</th>
                    <th className="px-4 py-3 font-semibold">Unit</th>
                    <th className="px-4 py-3 font-semibold text-right">Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Stock</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#EA4335]/10 flex items-center justify-center shrink-0">
                            <Box1 size={16} className="text-[#EA4335]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#171717] leading-none">{p.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[220px] truncate">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono text-slate-500">{p.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{p.unit}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#171717] text-right">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Box2 size={12} className="text-slate-400" /> {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Edit product">
                            <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Edit">
                              <Edit size={14} />
                            </button>
                          </Tooltip>
                          <Tooltip content={p.isActive ? 'Deactivate' : 'Activate'}>
                            <button onClick={() => handleToggle(p.id)} className="text-slate-400 hover:text-[#EA4335] p-1.5 cursor-pointer" aria-label="Toggle active">
                              {p.isActive ? <ToggleOn size={14} variant="Bold" className="text-[#EA4335]" /> : <ToggleOff size={14} />}
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
              <h3 className="text-sm font-bold text-[#171717]">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Name" required span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="SKU" required>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Unit">
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Price">
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Stock">
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Description" span>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </AnimatePresence>
    </div>
  );
}
