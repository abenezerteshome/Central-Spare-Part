import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

interface SaleDetailProps {
  saleId: string;
}

const SaleDetail: React.FC<SaleDetailProps> = ({ saleId }) => {
  const { data: sale, error } = useFetch(endpoints.SALES.DETAIL(saleId));

  if (!sale || !sale.data) return <div className="p-4">Loading sale...</div>;
  if (error) return <div className="p-4 text-red-600">Failed to load sale</div>;

  const s = sale.data;

  return (
    <div className="bg-white shadow rounded p-4 space-y-2">
      <h2 className="text-lg font-bold">Sale Details</h2>
      <p><strong>Buyer Name:</strong> {s.buyer_name || '-'}</p>
      <p><strong>Phone:</strong> {s.buyer_phone || '-'}</p>
      <p><strong>Location:</strong> {s.buyer_location || '-'}</p>
      <p><strong>Total:</strong> {s.total ?? '-'}</p>
      <p><strong>Status:</strong> {s.status || '-'}</p>
      <p><strong>Date:</strong> {s.date || s.created_at || '-'}</p>
      {s.items?.length > 0 && (
        <div className="pt-3">
          <h3 className="font-semibold">Sold Items</h3>
          <div className="mt-2 space-y-2">
            {s.items.map((item: any) => (
              <div key={item.id} className="rounded border p-2 text-sm">
                <div className="font-medium">{item.part?.name || item.partItem?.part?.name || 'Part'}</div>
                <div className="text-gray-600">Store: {item.store?.name || item.partItem?.store?.name || '-'}</div>
                <div className="text-gray-600">Qty: {item.qty} | Price: {item.unit_price} | Subtotal: {item.subtotal}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetail;
