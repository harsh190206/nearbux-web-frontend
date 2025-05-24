import React from 'react';

interface Order {
  id: string;
  customerName: string;
  timeAgo: string;
  amount?: number;
  status: 'pending' | 'accepted' | 'completed';
}

interface HistoryOrdersListProps {
  orders: Order[];
  onView: (orderId: string) => void;
}

const HistoryOrdersList: React.FC<HistoryOrdersListProps> = ({ orders, onView }) => (
  <div className="space-y-4">
    {orders.map((order, index) => (
      <div key={order.id} className="bg-white border-l-4 border-l-green-400 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{order.customerName}</h3>
            <p className="text-gray-500 text-sm">{order.timeAgo}</p>
          </div>
          <div className="flex items-center gap-3">
            {order.amount && (
              <span className="text-lg font-semibold text-gray-800">₹ {order.amount.toLocaleString()}</span>
            )}
            <button
              onClick={() => onView(order.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default HistoryOrdersList;
