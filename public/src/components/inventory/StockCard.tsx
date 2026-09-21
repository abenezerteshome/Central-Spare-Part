// src/components/inventory/StockCard.tsx
import React from 'react';
import InventoryAdjust from './InventoryAdjust';
import { useAuth } from '../../context/AuthContext';

interface StockCardProps {
  partItem: any;
  onStockChange?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ partItem, onStockChange }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="border p-4 rounded shadow mb-4">
      <h3 className="font-bold">{partItem.part.name} ({partItem.partItemCode || 'N/A'})</h3>
      <p>Store: {partItem.store.name}</p>
      <p>Available Quantity: {partItem.quantity}</p>
      {isAdmin && <InventoryAdjust partItemId={partItem.id} onSuccess={onStockChange} />}
    </div>
  );
};

export default StockCard;

