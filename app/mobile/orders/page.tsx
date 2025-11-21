'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function MobileOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sales');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.slice(0, 10)); // Show last 10 orders
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Orders</h1>
            <Button size="sm" className="rounded-full w-10 h-10 p-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-600">{order.clientName}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-sm">${order.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

