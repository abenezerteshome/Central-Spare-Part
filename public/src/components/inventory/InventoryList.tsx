// src/components/inventory/InventoryList.tsx
import React, {  useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import StockCard from './StockCard';

const InventoryList: React.FC = () => {
  const { data: stocks, refetch } = useFetch(endpoints.INVENTORY.STOCKS);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refresh = () => {
    setRefreshFlag(!refreshFlag);
    refetch();
  };

  return (
    <div>
      {stocks?.data?.length === 0 && <p>No stock available</p>}
      {stocks?.data?.data.map((item: any) => (
        <StockCard key={item.id} partItem={item} onStockChange={refresh} />
      ))}
    </div>
  );
};

export default InventoryList;
