// src/components/inventory/InventoryAdjust.tsx
import React, { useState } from 'react';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';

interface InventoryAdjustProps {
  partItemId: string;
  onSuccess?: () => void;
}



const InventoryAdjust: React.FC<InventoryAdjustProps> = ({ partItemId, onSuccess }) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const toast = useToast();

  const { mutate, loading } = useMutation(
    type === 'increase' 
      ? endpoints.INVENTORY.INCREASE 
      : endpoints.INVENTORY.DECREASE, 
    'post'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate({ part_item_id: partItemId, qty: quantity });
      toast.success(`Stock ${type}d successfully`);
      setQuantity(0);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Failed to adjust stock');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="number"
        min={0}
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border px-3 py-2 rounded w-24"
        required
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as 'increase' | 'decrease')}
        className="border px-2 py-2 rounded"
      >
        <option value="increase">Increase</option>
        <option value="decrease">Decrease</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Adjust Stock'}
      </button>
    </form>
  );
};

export default InventoryAdjust;
