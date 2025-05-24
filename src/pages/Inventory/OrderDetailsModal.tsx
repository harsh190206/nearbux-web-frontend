import React from "react";

interface Order {
  id: string;
  customerName: string;
  timeAgo: string;
  status: "pending" | "accepted" | "completed";
  // Add more fields as needed
}

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-center mb-4">Order Details</h2>
        <div className="bg-gray-100 rounded-lg p-6 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white">
            {order.customerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold">{order.customerName}</div>
            <div className="text-gray-700 mt-1">Order ID: {order.id}</div>
            <div className="text-gray-500 mt-1">Placed: {order.timeAgo}</div>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                  order.status === "pending"
                    ? "bg-yellow-400 text-white"
                    : order.status === "accepted"
                    ? "bg-green-400 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
        {/* Add more order details here as needed */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-8 rounded transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
