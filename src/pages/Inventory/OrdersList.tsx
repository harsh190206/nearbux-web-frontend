// import React from 'react';
// import { Check, X } from 'lucide-react';

// interface Order {
//   id: string;
//   customerName: string;
//   timeAgo: string;
//   status: 'pending' | 'accepted' | 'completed';
// }

// interface OrdersListProps {
//   orders: Order[];
//   onAccept: (orderId: string) => void;
//   onReject: (orderId: string) => void;
//   onView: (orderId: string) => void;
// }

// const OrdersList: React.FC<OrdersListProps> = ({ orders, onAccept, onReject, onView }) => (
//   <div className="space-y-4">
//     {orders.map((order, index) => (
//       <div key={order.id} className="bg-white border-l-4 border-l-blue-400 rounded-lg p-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="font-semibold text-gray-800 text-lg">{order.customerName}</h3>
//             <p className="text-gray-500 text-sm">{order.timeAgo}</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onView(order.id)}
//               className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               View
//             </button>
//             <button
//               onClick={() => onAccept(order.id)}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
//             >
//               <Check size={16} />
//               Accept
//             </button>
//             <button
//               onClick={() => onReject(order.id)}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
//             >
//               <X size={16} />
//               Reject
//             </button>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// export default OrdersList;




import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  timeAgo: string;
  status: 'pending' | 'accepted' | 'completed';
  products: Product[];
}

interface OrdersListProps {
  orders: Order[];
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onAccept, onReject }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleView = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border-l-4 border-l-blue-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{order.customerName}</h3>
              <p className="text-gray-500 text-sm">{order.timeAgo}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleView(order.id)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onAccept(order.id)}
                className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Check size={16} />
                Accept
              </button>
              <button
                onClick={() => onReject(order.id)}
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <X size={16} />
                Reject
              </button>
            </div>
          </div>
          {/* Expand order details */}
          {expandedOrderId === order.id && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {order.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center bg-white rounded-lg shadow p-3"
                  style={{ minWidth: 0 }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <div className="font-semibold text-lg">{product.name}</div>
                    <div className="flex items-center mt-2">
                      <span className="font-medium">Quantity :-</span>
                      <input
                        value={product.quantity}
                        readOnly
                        className="ml-2 w-12 border rounded px-2 py-1 text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersList;
