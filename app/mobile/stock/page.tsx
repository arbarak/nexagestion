'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle } from 'lucide-react';

interface StockItem {
  id: string;
  productName: string;
  quantity: number;
  minQuantity: number;
  location: string;
  lastUpdated: string;
}

export default function MobileStockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stocks');
      if (res.ok) {
        const data = await res.json();
        setStocks(data.slice(0, 20)); // Show first 20 items
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (quantity: number, minQuantity: number) => quantity <= minQuantity;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 space-y-3">
          <h1 className="text-2xl font-bold">Stock</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">Loading stock...</div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No products found</div>
        ) : (
          filteredStocks.map((stock) => {
            const low = isLowStock(stock.quantity, stock.minQuantity);
            return (
              <Card key={stock.id} className={low ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{stock.productName}</p>
                      <p className="text-xs text-gray-600">{stock.location}</p>
                    </div>
                    {low && (
                      <AlertTriangle className="w-4 h-4 text-red-600 ml-2" />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Quantity</p>
                      <p className="font-bold text-sm">{stock.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Min: {stock.minQuantity}</p>
                      <Badge variant={low ? 'destructive' : 'secondary'}>
                        {low ? 'Low Stock' : 'OK'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

