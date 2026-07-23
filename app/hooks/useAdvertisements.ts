import { useCallback, useEffect, useRef, useState } from 'react';
import { listAdvertisements, AdvertisementFilters } from '../services/advertisements';
import type { Advertisement } from '../types/api';

/**
 * جلب الإعلانات من الخادم مع تصفّح وتحديث بالسحب.
 *
 * التصفية تجري على الخادم لا في الذاكرة: الشاشة كانت تُصفّي مصفوفة محلية
 * من خمسة عناصر، وهو ما لا يصمد أمام آلاف الإعلانات على شبكة جوال.
 */

export interface UseAdvertisementsResult {
  items: Advertisement[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refresh: () => void;
  loadMore: () => void;
}

const PAGE_SIZE = 20;

export const useAdvertisements = (
  filters: AdvertisementFilters = {}
): UseAdvertisementsResult => {
  const [items, setItems] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // تسلسل الطلبات: يمنع استجابة قديمة بطيئة من الكتابة فوق نتيجة أحدث
  const requestSeq = useRef(0);

  const filterKey = JSON.stringify(filters);

  const fetchPage = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' | 'more') => {
      const seq = ++requestSeq.current;

      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);
      setError(null);

      try {
        const response = await listAdvertisements({
          ...filters,
          page: targetPage,
          limit: PAGE_SIZE,
        });

        if (seq !== requestSeq.current) return; // استجابة متجاوَزة

        setItems((prev) =>
          mode === 'more' ? [...prev, ...response.data] : response.data
        );
        setPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (e: any) {
        if (seq !== requestSeq.current) return;
        setError(e?.message || 'تعذّر جلب الإعلانات');
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [filterKey]
  );

  useEffect(() => {
    fetchPage(1, 'initial');
  }, [fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(1, 'refresh');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page >= totalPages) return;
    fetchPage(page + 1, 'more');
  }, [fetchPage, loadingMore, loading, page, totalPages]);

  return {
    items,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore: page < totalPages,
    total,
    refresh,
    loadMore,
  };
};

export default useAdvertisements;
