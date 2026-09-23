// src/components/inventory/InventoryList.tsx
import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import StockCard from './StockCard';

const InventoryList: React.FC = () => {
  const { data: stocks, refetch, loading } = useFetch(endpoints.INVENTORY.STOCKS);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const stockList = stocks?.data?.data || [];

  const refresh = () => {
    setRefreshFlag(!refreshFlag);
    refetch();
  };

  return (
    <div>
      {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-200" />)}</div>}
      {!loading && stockList.length === 0 && <p>No stock available</p>}
      {!loading && stockList.map((item: any) => (
        <StockCard key={item.id} partItem={item} onStockChange={refresh} />
      ))}
    </div>
  );
};

export default InventoryList;
