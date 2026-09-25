// src/components/sales/SaleForm.tsx
import React, { useMemo, useState } from 'react';
import { FiCheckCircle, FiPackage, FiSearch, FiShoppingCart } from 'react-icons/fi';
import axiosClient from '../../api/axiosClient';
import { endpoints } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';

interface SaleFormProps {
  onSuccess: () => void;
}

const getImageUrl = (item: any) => {
  const part = item?.part;
  const image = part?.images?.[0];

  if (image) {
    const thumbUrl = image.thumb_url || image.url;
    if (thumbUrl && typeof thumbUrl === 'string' && !thumbUrl.endsWith('thumb_') && thumbUrl !== '0') return thumbUrl;

    const base = axiosClient.defaults.baseURL?.replace(/\/api\/?$/, '') || window.location.origin;
    const path = String(image.thumb_path || image.file_path || '').trim();
    if (path && path !== '0' && path !== 'false' && !path.endsWith('thumb_') && !path.endsWith('/thumb_')) {
      if (/^(https?:\/\/|data:image\/)/i.test(path)) return path;
      return `${base}/storage/${path.replace(/^\/?storage\//, '').replace(/^\/+/, '')}`;
    }
  }

  // Fallback to inline Base64 image stored in technical_specs
  const specs = part?.technical_specs;
  if (specs) {
    if (Array.isArray(specs)) {
      for (const s of specs) {
        try {
          const parsed = typeof s === 'string' ? JSON.parse(s) : s;
          if (parsed?.key === '__image_data' || parsed?.key === 'image') {
            if (typeof parsed?.value === 'string' && (parsed.value.startsWith('data:image/') || parsed.value.startsWith('http'))) {
              return parsed.value;
            }
          }
        } catch {}
      }
    } else if (typeof specs === 'object') {
      const val = specs.__image_data || specs.image;
      if (typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('http'))) {
        return val;
      }
    }
  }

  return null;
};

const formatMoney = (value: any) => {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const stockState = (item: any) => {
  const quantity = Number(item?.quantity || 0);
  if (quantity <= 0 || item?.status === 'sold') return { label: 'Sold Out', className: 'bg-red-100 text-red-700' };
  if (quantity <= 3) return { label: 'Low Stock', className: 'bg-amber-100 text-amber-700' };
  return { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700' };
};

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const inventoryUrl = `${endpoints.INVENTORY.STOCKS}?per_page=200${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const { data: inventory, loading, refetch } = useFetch(inventoryUrl);
  const { mutate, loading: saving } = useMutation(endpoints.SALES.CREATE, 'post');

  const stockItems = inventory?.data?.data || [];
  const availableQty = Number(selectedItem?.quantity || 0);
  const selectedPrice = selectedItem?.unit_price ?? selectedItem?.part?.unit_price ?? 0;
  const total = useMemo(() => Number(selectedPrice || 0) * qty, [selectedPrice, qty]);

  const selectItem = (item: any) => {
    setSelectedItem(item);
    setQty(Number(item.quantity || 0) > 0 ? 1 : 0);
  };

  const submitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error('Select a part to sell');
      return;
    }
    if (qty < 1 || qty > availableQty) {
      toast.error(`Quantity must be between 1 and ${availableQty}`);
      return;
    }

    try {
      await mutate({
        buyer_name: buyerName || 'Walk-in Customer',
        buyer_phone: buyerPhone || null,
        status: 'buyed',
        items: [
          {
            part_item_id: selectedItem.id,
            qty,
            unit_price: selectedPrice,
          },
        ],
      });

      toast.success('Sale completed and stock updated');
      setSelectedItem(null);
      setQty(1);
      setBuyerName('');
      setBuyerPhone('');
      refetch();
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to complete sale');
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sell Parts</h2>
            <p className="text-sm text-gray-500">Search uploaded stock, choose quantity, and confirm the sale.</p>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, part number"
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : stockItems.length === 0 ? (
            <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
              No uploaded stock found.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stockItems.map((item: any) => {
                const state = stockState(item);
                const soldOut = Number(item.quantity || 0) <= 0 || item.status === 'sold';
                const imageUrl = getImageUrl(item);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !soldOut && selectItem(item)}
                    disabled={soldOut}
                    className={`min-w-0 rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    } ${soldOut ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.part?.name || 'Part'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <FiPackage className="h-7 w-7 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900">{item.part?.name || 'Unnamed part'}</div>
                        <div className="truncate text-xs text-gray-500">{item.part?.sku || item.part?.part_number || 'No code'}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${state.className}`}>{state.label}</span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Qty {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-400">Price</div>
                        <div className="font-semibold text-gray-900">{formatMoney(item.unit_price ?? item.part?.unit_price)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Store</div>
                        <div className="truncate font-semibold text-gray-900">{item.store?.name || 'Default Store'}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={submitSale} className="h-fit rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiShoppingCart className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Quick Sale</h3>
          </div>

          {selectedItem ? (
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="font-semibold text-gray-900">{selectedItem.part?.name}</div>
              <div className="text-sm text-gray-500">{selectedItem.store?.name || 'Default Store'}</div>
              <div className="mt-2 text-sm text-gray-700">Available: {availableQty}</div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
              Select an in-stock part.
            </div>
          )}

          <div className="space-y-3">
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Buyer name"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <input
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Buyer phone"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min={1}
                max={Math.max(availableQty, 1)}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                disabled={!selectedItem}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span>Unit price</span>
              <b>{formatMoney(selectedPrice)}</b>
            </div>
            <div className="mt-1 flex justify-between text-base">
              <span>Total</span>
              <b>{formatMoney(total)}</b>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !selectedItem || qty < 1 || qty > availableQty}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <FiCheckCircle />
            {saving ? 'Completing...' : 'Confirm Sale'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SaleForm;
