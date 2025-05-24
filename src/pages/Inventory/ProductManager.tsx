import React, { useState } from 'react';
import AcceptedOrdersList from './AcceptedOrdersList';
import HistoryOrdersList from './HistoryOrdersList';
import OrdersList from './OrdersList';
import OrderDetailsModal from './OrderDetailsModal';
import NewPromotion from './NewPromotion';
import CustomerPreview from './CustomerPreview';

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
  amount?: number;
  status: 'pending' | 'accepted' | 'completed';
  products: Product[];
}

interface Promotion {
  id: string;
  businessName: string;
  title: string;
  description: string;
  validPeriod: string;
  discount: string;
  logo: string;
}

interface PromotionDetailsProps {
  promotion: Promotion;
  onEdit: () => void;
}

const PromotionManager: React.FC<PromotionDetailsProps> = ({  onEdit }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'accepted' | 'history'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const handleCloseModal = () => setSelectedOrder(null);

  // Sample data
  const promotion: Promotion = {
    id: '1',
    businessName: 'Foot Planet',
    title: 'Weekend Special - 15% Off Fresh Pastries',
    description: 'Enjoy 15% off all fresh pastries this weekend only! Valid Friday through Sunday. Don\'t miss these fresh-baked treats!',
    validPeriod: 'May 10 - May 15',
    discount: '15%',
    logo: 'FP'
  };

  // const orders: Order[] = [
  //   { id: '1', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'pending' },
  //     { id: '2', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'pending' },
  //     { id: '3', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'pending' }
  // ];
  // Sample data
const orders: Order[] = [
  {
    id: '1',
    customerName: 'Darshan Sharma',
    timeAgo: '20 min ago',
    status: 'pending',
    products: [
      {
        id: 'p1',
        name: 'Sketch Book',
        image: 'https://your-image-url/sketchbook.jpg',
        quantity: 1,
      },
      {
        id: 'p2',
        name: 'Graphics Sheet',
        image: 'https://your-image-url/graphicssheet.jpg',
        quantity: 1,
      },
      {
        id: 'p3',
        name: 'Tri-max Pen',
        image: 'https://your-image-url/trimaxpen.jpg',
        quantity: 1,
      },
      {
        id: 'p4',
        name: 'Class Mate copy',
        image: 'https://your-image-url/classmatecopy.jpg',
        quantity: 1,
      },
    ],
  },
  {
    id: '2',
    customerName: 'John Doe',
    timeAgo: '1 hour ago',
    status: 'pending',
    products: [
      {
        id: 'p5',
        name: 'Pencil',
        image: 'https://your-image-url/pencil.jpg',
        quantity: 2,
      },
      {
        id: 'p6',
        name: 'Notebook',
        image: 'https://your-image-url/notebook.jpg',
        quantity: 1,
      },
    ],
  },
  {
    id: '3',
    customerName: 'Jane Smith',
    timeAgo: '2 hours ago',
    status: 'pending',
    products: [
      {
        id: 'p7',
        name: 'Eraser',
        image: 'https://your-image-url/eraser.jpg',
        quantity: 1,
      },
      {
        id: 'p8',
        name: 'Ruler',
        image: 'https://your-image-url/ruler.jpg',
        quantity: 1,
      },
    ],
  },
];

// In your parent component
{/* <OrdersList
  orders={orders}
  onAccept={(id) => console.log('Accept', id)}
  onReject={(id) => console.log('Reject', id)}
/> */}


  const acceptedOrders: Order[] = [
    { id: '4', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'accepted' },
    { id: '5', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'accepted' },
    { id: '6', customerName: 'Darshan Sharma', timeAgo: '20 min ago', status: 'accepted' }
  ];

  const historyOrders: Order[] = [
    { id: '7', customerName: 'Darshan Sharma', timeAgo: '20 min ago', amount: 1500, status: 'completed' },
    { id: '8', customerName: 'Darshan Sharma', timeAgo: '20 min ago', amount: 2000, status: 'completed' },
    { id: '9', customerName: 'Darshan Sharma', timeAgo: '20 min ago', amount: 3500, status: 'completed' }
  ];

  // Handlers
  const handleAccept = (orderId: string) => {
    console.log('Accept order:', orderId);
  };

  const handleReject = (orderId: string) => {
    console.log('Reject order:', orderId);
  };

  const handlePrintBill = (orderId: string) => {
    console.log('Print bill for order:', orderId);
  };

  const handleView = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    setSelectedOrder(order || null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-center text-white bg-[#2196F3] rounded-xl py-2 mb-6"> Promotion Manager </h1>
      {/* Promotion Details */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        {/* <CustomerPreview onEdit={() => {}} /> */}
      <NewPromotion />

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'orders' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'accepted' ? 'border-b-2 border-yellow-500 font-bold' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-green-500 font-bold' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Orders List */}
        {activeTab === 'orders' && (
          <OrdersList
            orders={orders}
            onAccept={handleAccept}
            onReject={handleReject}
            onView={handleView}
          />
        )}
        {activeTab === 'accepted' && (
          <AcceptedOrdersList
            orders={acceptedOrders}
            onPrintBill={handlePrintBill}
          />
        )}
        {activeTab === 'history' && (
          <HistoryOrdersList
            orders={historyOrders}
            onView={handleView}
          />
        )}
         <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      </div>
    </div>
  );
};

export default PromotionManager;
