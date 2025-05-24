import React from "react";

const analytics = {
  totalSales: 10000,
  pointsIssued: 500,
  topProducts: [
    { name: "Black Men’s T-Shirt", sold: 5 },
    { name: "Black Men’s T-Shirt", sold: 5 },
    { name: "Black Men’s T-Shirt", sold: 5 },
    { name: "Black Men’s T-Shirt", sold: 5 },
    { name: "Black Men’s T-Shirt", sold: 5 },
  ],
};

const BusinessAnalyticsDashboard = () => (
  <div className="max-w-2xl mx-auto mt-8 px-4 bg-white shadow-lg rounded-lg p-6">
    <h1 className="text-2xl font-semibold mb-2">Business Analytics Dashboard</h1>
    <div className="text-gray-700 mb-4">Last 30 Days Analytics</div>
    <div className="flex gap-4 mb-8">
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between min-w-[180px]">
        <div className="text-gray-500 text-sm mb-2">Total Sales</div>
        <div className="text-yellow-500 text-xl font-semibold">₹ {analytics.totalSales.toLocaleString()}</div>
      </div>
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between min-w-[180px]">
        <div className="text-gray-500 text-sm mb-2">Points Issued</div>
        <div className="flex items-center text-yellow-500 text-xl font-semibold gap-1">
          <span className="inline-block">
            {/* Coin SVG */}
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
              <text x="11" y="16" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">₿</text>
            </svg>
          </span>
          {analytics.pointsIssued}
        </div>
      </div>
    </div>
    <div className="mb-2 text-lg font-medium">Top Selling Products</div>
    <div className="flex justify-between text-gray-600 font-medium mb-2 px-2">
      <div>Product Name</div>
      <div>Product Sold</div>
    </div>
    <div className="space-y-3">
      {analytics.topProducts.map((product, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
        >
          <div>{product.name}</div>
          <div className="font-semibold">{product.sold}</div>
        </div>
      ))}
    </div>
  </div>
);

export default BusinessAnalyticsDashboard;
