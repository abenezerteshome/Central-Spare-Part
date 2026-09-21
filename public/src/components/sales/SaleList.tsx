// src/components/sales/SaleList.tsx
import React, { useMemo, useState } from 'react';
import { FiEye, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
// ...existing code...

interface SaleListProps {
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}
const SaleList: React.FC<SaleListProps> = ({ onView, onEdit }) => {
  const { data: sales, refetch, loading, refreshing } = useFetch(endpoints.SALES.LIST, [], {
    cacheKey: 'sales:list',
    cacheTime: 2 * 60 * 1000,
    keepPreviousData: true,
    revalidateOnMount: true,
  });
  const list = sales?.data?.data || [];
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { mutate: deleteSale, loading: deleting } = useMutation(endpoints.SALES.DETAIL, 'delete');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const itemSummary = (sale: any) => {
    const items = sale.items || [];
    if (!items.length) return sale.product_detail || '-';
    return items
      .map((item: any) => `${item.part?.name || item.partItem?.part?.name || 'Part'} x${item.qty}`)
      .join(', ');
  };

  const indexedSales = useMemo(() => {
    return list.map((sale: any) => ({
      sale,
      searchText: [
        sale?.buyer_name,
        sale?.buyer_phone,
        sale?.buyer_location,
        sale?.product_detail,
        sale?.total,
        sale?.status,
        sale?.date,
        sale?.created_at,
        ...(sale?.items || []).flatMap((item: any) => [
          item?.part?.name,
          item?.partItem?.part?.name,
          item?.store?.name,
          item?.partItem?.store?.name,
          item?.qty,
          item?.unit_price,
          item?.subtotal,
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));
  }, [list]);

  const filteredSales = useMemo(() => {
    const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return list;

    return indexedSales
      .filter(({ searchText }: any) => terms.every((term) => searchText.includes(term)))
      .map(({ sale }: any) => sale);
  }, [search, list, indexedSales]);

  const handleView = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    onView(id);
  };

  // Skeleton loader for loading state
  const SkeletonRow = () => (
    <div className="bg-white rounded-lg border shadow-sm p-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-4 bg-gray-300 rounded"></div>
        <div className="flex-1 h-4 bg-gray-300 rounded"></div>
        <div className="w-24 h-4 bg-gray-300 rounded"></div>
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Total sales counter
  const TotalSalesBox = () => (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {loading ? (
        <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      ) : (
        <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow">
          Total Sales: {filteredSales.length}
        </div>
      )}
      {refreshing && (
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          Updating sales...
        </div>
      )}
    </div>
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      await deleteSale(undefined, id);
      toast.success('Sale deleted');
      refetch?.();
    } catch (err) {
      toast.error('Failed to delete sale');
    }
  };

  return (
    <div className="mt-3">
      <div className="relative mb-4 max-w-xl group">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyer, phone, item, status, store..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-semibold"
        />
      </div>

      <TotalSalesBox />

      {refreshing && (
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-blue-50">
          <div className="h-full w-1/3 rounded-full bg-blue-500 animate-pulse" />
        </div>
      )}

      {/* Desktop header */}
      <div className="hidden md:grid grid-cols-7 font-semibold text-gray-700 px-2 py-2 border-b">
        <div>No</div>
        <div>Buyer</div>
        <div>Phone</div>
        <div>Items</div>
        <div>Total</div>
        <div>Status</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="space-y-3">
          {filteredSales.length === 0 && (
            <div className="w-full p-4 text-center text-gray-600 bg-gray-100 rounded-lg border">
              🚫 No sales found.
            </div>
          )}

          {filteredSales.map((s: any, idx: number) => (
            <div key={s.id} className="animate-fade-in">
              <div className="bg-white rounded-lg border shadow-sm p-3 transition-all">
                {/* Mobile row */}
                <div className="md:hidden flex items-center gap-3">
                  <div className="text-xs font-semibold w-6">{idx + 1}</div>
                  <div className="flex-1 font-medium truncate">{s.buyer_name}</div>
                  <div className="text-sm w-14 truncate">{s.buyer_phone || '-'}</div>
                  <div className="text-sm w-14 truncate">{s.total}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(s.id)}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      {expandedId === s.id ? <FiEye /> : <FiEye />}
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit?.(s.id)}
                          className="p-2 rounded hover:bg-gray-100 text-green-600"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                          disabled={deleting}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-7 items-center px-2">
                  <div>{idx + 1}</div>
                  <div className="font-medium">{s.buyer_name}</div>
                  <div>{s.buyer_phone || '-'}</div>
                  <div className="truncate pr-2">{itemSummary(s)}</div>
                  <div>{s.total}</div>
                  <div className="capitalize">{s.status}</div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleView(s.id)}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <FiEye />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit?.(s.id)}
                          className="p-2 rounded hover:bg-gray-100 text-green-600"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                          disabled={deleting}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded panel for details */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedId === s.id ? 'max-h-[900px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="text-sm space-y-1">
                    <div><b>Buyer Name:</b> {s.buyer_name}</div>
                    <div><b>Phone:</b> {s.buyer_phone || '-'}</div>
                    <div><b>Location:</b> {s.buyer_location || '-'}</div>
                    <div><b>Items:</b> {itemSummary(s)}</div>
                    {s.items?.length > 0 && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="text-gray-500">
                            <tr>
                              <th className="py-1 pr-2">Part</th>
                              <th className="py-1 pr-2">Store</th>
                              <th className="py-1 pr-2">Qty</th>
                              <th className="py-1 pr-2">Price</th>
                              <th className="py-1">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.items.map((item: any) => (
                              <tr key={item.id} className="border-t">
                                <td className="py-1 pr-2">{item.part?.name || item.partItem?.part?.name || '-'}</td>
                                <td className="py-1 pr-2">{item.store?.name || item.partItem?.store?.name || '-'}</td>
                                <td className="py-1 pr-2">{item.qty}</td>
                                <td className="py-1 pr-2">{item.unit_price}</td>
                                <td className="py-1">{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div><b>Total:</b> {s.total}</div>
                    <div><b>Status:</b> {s.status}</div>
                    <div><b>Date:</b> {s.date || s.created_at}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SaleList;
