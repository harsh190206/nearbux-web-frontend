import React from 'react';

interface Order {
  id: string;
  customerName: string;
  timeAgo: string;
  status: 'pending' | 'accepted' | 'completed';
}

interface AcceptedOrdersListProps {
  orders: Order[];
  onPrintBill: (orderId: string) => void;
}

const AcceptedOrdersList: React.FC<AcceptedOrdersListProps> = ({ orders, onPrintBill }) => (
  <div className="space-y-4">
    {orders.map((order, index) => (
      <div key={order.id} className="bg-white border-l-4 border-l-yellow-400 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{order.customerName}</h3>
            <p className="text-gray-500 text-sm">{order.timeAgo}</p>
          </div>
          <button
            onClick={() => onPrintBill(order.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Print Bill
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default AcceptedOrdersList;
