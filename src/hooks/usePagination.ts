import { useEffect, useState } from 'react';

interface Pagination {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (n: number) => void;
  slice: <T>(items: T[]) => T[];
}

/** Client-side pagination. Resets to page 1 whenever `resetKey` changes (e.g. a filter). */
export function usePagination(pageSize: number, total: number, resetKey?: unknown): Pagination {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const safePage = Math.min(page, pageCount);
  const onPageChange = (n: number) => setPage(Math.min(Math.max(1, n), pageCount));

  return {
    page: safePage,
    pageCount,
    total,
    onPageChange,
    slice: <T,>(items: T[]): T[] => items.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}
