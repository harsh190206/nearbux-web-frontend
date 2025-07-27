import { useEffect, useState, useRef, useCallback } from "react";
import { Eye, Check, X, Printer, Ban, Gift, Coins, Percent, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "../../config/constant";

// Lazy loading image component (unchanged)
const LazyImage = ({ src, alt, className, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      ) : (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
    </div>
  );
};

export default function Lowerbhome() {
  const [selected, setSelected] = useState("orders");
  const [allOrders, setAllOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printingBill, setPrintingBill] = useState(null);

  // New state to track which order is updating
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const shopId = localStorage.getItem("shopId");
      if (!shopId) {
        throw new Error("Shop ID not found. Please log in again.");
      }

      const response = await fetch(`${BACKEND_URL}/shop/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId: parseInt(shopId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setAllOrders(data.message || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "An unexpected error occurred while fetching orders.");
      }
      console.error("Error fetching all orders:", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAllOrders();

    const intervalId = setInterval(() => {
      fetchAllOrders();
    }, 300000);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchAllOrders]);

  const filteredOrders = allOrders.filter((orderGroup) => {
    if (selected === "orders") return orderGroup.status === "PENDING";
    if (selected === "accepted") return orderGroup.status === "CONFIRMED";
    if (selected === "history")
      return orderGroup.status === "CANCELLED" || orderGroup.status === "COMPLETED";
    return false;
  });

  const getTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const orderTime = new Date(dateString);
    if (isNaN(orderTime.getTime())) return "Invalid Date";

    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Updated updateOrderStatus with updatingOrderId state management and error clearing
  const updateOrderStatus = useCallback(
    async (orderGroupId, status) => {
      setUpdatingOrderId(orderGroupId);
      try {
        const response = await fetch(`${BACKEND_URL}/shop/orders/update-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: orderGroupId, status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update order status: ${response.status}`);
        }

        setAllOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderGroupId ? { ...order, status } : order
          )
        );

        setError(null); // Clear previous error on success
        setViewingOrder(null);
      } catch (err) {
        console.error("Error updating order status:", err);
        setError(err.message || "An unexpected error occurred while updating order status.");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    []
  );

  const handlePrintBill = (orderGroup) => {
    setPrintingBill(orderGroup);
  };

  const printBill = useCallback(() => {
    if (!printingBill) return;

    const printWindow = window.open("", "_blank");
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-IN");
    const formattedTime = currentDate.toLocaleTimeString("en-IN");

    const allItems = [
      ...printingBill.orders.map((order) => ({
        name: order.product?.name || "N/A",
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        total: order.itemTotal,
        isFree: false,
        offer: order.offer,
      })),
      ...printingBill.freeProducts.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: 0,
        isFree: true,
        offerTitle: item.offerTitle,
      })),
    ];

    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Order #${printingBill.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 14px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .shop-info {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .shop-tagline {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
          }
          .customer-info, .order-info {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .free-row {
            background-color: #f0f8ff;
          }
          .total-section {
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .final-total {
            font-weight: bold;
            font-size: 16px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
          .offer-badge {
            background-color: #ff6b35;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
          }
          .free-badge {
            background-color: #28a745;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-info">${printingBill.shop?.name || "Shop Name"}</div>
          <div class="shop-tagline">${printingBill.shop?.tagline || ""}</div>
          <div style="font-size: 12px;">${printingBill.shop?.localArea || ""}</div>
        </div>

        <div class="customer-info">
          <h3>Customer Details:</h3>
          <div class="info-row">
            <span>Name:</span>
            <span>${printingBill.consumer?.name || "N/A"}</span>
          </div>
          <div class="info-row">
            <span>Phone:</span>
            <span>${printingBill.consumer?.phone || "N/A"}</span>
          </div>
          <div class="info-row">
            <span>Address:</span>
            <span>${printingBill.consumer?.localArea || "N/A"}</span>
          </div>
        </div>

        <div class="order-info">
          <div class="info-row">
            <span>Order ID:</span>
            <span>#${printingBill.id}</span>
          </div>
          <div class="info-row">
            <span>Date:</span>
            <span>${formattedDate}</span>
          </div>
          <div class="info-row">
            <span>Time:</span>
            <span>${formattedTime}</span>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${allItems
              .map(
                (item) => `
              <tr ${item.isFree ? 'class="free-row"' : ''}>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice}</td>
                <td>${
                  item.isFree ? '<span class="free-badge">FREE</span>' : `₹${item.total}`
                }</td>
                <td>
                  ${
                    item.isFree
                      ? `<span class="free-badge">${item.offerTitle || "Free Item"}</span>`
                      : item.offer && item.offer.type === "money"
                      ? `<span class="offer-badge">₹${item.offer.fixed} off</span>`
                      : item.offer && item.offer.type === "product"
                      ? `<span class="free-badge">Includes free item</span>`
                      : "-"
                  }
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Total (before offers):</span>
            <span>₹${printingBill.totalBeforeAllOffers}</span>
          </div>
          ${
            printingBill.totalDiscount > 0
              ? `<div class="total-row">
            <span>Offer Discount:</span>
            <span>-₹${printingBill.totalDiscount}</span>
          </div>`
              : ""
          }
          ${
            printingBill.coinsUsed > 0
              ? `<div class="total-row">
            <span>Coins Used (${printingBill.coinsUsed}):</span>
            <span>-₹${printingBill.coinDiscount}</span>
          </div>`
              : ""
          }
          <div class="total-row final-total">
            <span>Final Total:</span>
            <span>₹${printingBill.finalTotal}</span>
          </div>
          ${
            printingBill.coinsToCredit > 0
              ? `<div class="total-row" style="color: #28a745;">
            <span>Coins to be given:</span>
            <span>+${printingBill.coinsToCredit} coins</span>
          </div>`
              : ""
          }
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          Thank you for your business!
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    updateOrderStatus(printingBill.id, "COMPLETED");
    setPrintingBill(null);
  }, [printingBill, updateOrderStatus]);

  const tabClass = (tab) =>
    `cursor-pointer px-3 sm:px-6 py-3 transition-all font-medium text-sm sm:text-base ${
      selected === tab
        ? "border-b-4 border-yellow-500 text-yellow-600 font-semibold"
        : "text-gray-600 hover:text-yellow-500"
    }`;

  // Updated OrderGroupCard component to show updating message while updating
  const OrderGroupCard = ({ orderGroup }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-yellow-600 font-semibold text-sm">
              {orderGroup.consumer?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-800 truncate">{orderGroup.consumer?.name || "Unknown User"}</h3>
            <p className="text-sm text-gray-500">{getTimeAgo(orderGroup.createdAt)}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-bold text-green-600">₹{orderGroup.finalTotal}</span>
              {orderGroup.coinsUsed > 0 && (
                <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <Coins size={12} />
                  <span>{orderGroup.coinsUsed} used</span>
                </div>
              )}
              {orderGroup.coinsToCredit > 0 && (
                <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <Coins size={12} />
                  <span>+{orderGroup.coinsToCredit} to give</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:space-x-2">
          <button
            onClick={() => setViewingOrder(viewingOrder === orderGroup.id ? null : orderGroup.id)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 flex-1 sm:flex-none justify-center"
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span>View</span>
          </button>

          {/* Show updating message if this order is being updated */}
          {updatingOrderId === orderGroup.id ? (
            <div className="flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-yellow-100 text-yellow-600 flex-1 sm:flex-none">
              Updating order...
            </div>
          ) : selected === "orders" ? (
            <>
              <button
                onClick={() => updateOrderStatus(orderGroup.id, "CONFIRMED")}
                className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 flex-1 sm:flex-none justify-center"
              >
                <Check size={14} className="sm:w-4 sm:h-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => updateOrderStatus(orderGroup.id, "CANCELLED")}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 flex-1 sm:flex-none justify-center"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                <span>Reject</span>
              </button>
            </>
          ) : selected === "accepted" ? (
            <button
              onClick={() => handlePrintBill(orderGroup)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center space-x-1 flex-1 sm:flex-none justify-center"
            >
              <Printer size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Print Bill</span>
              <span className="xs:hidden">Print</span>
            </button>
          ) : null}
        </div>
      </div>

      {viewingOrder === orderGroup.id && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Order Details:</h4>

          {/* Regular Ordered Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            {orderGroup.orders &&
              orderGroup.orders.map((order, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LazyImage
                      src={order.product?.image || ""}
                      alt={order.product?.name || "Product Image"}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiA4QzEyLjY4NjMgOCAxMCAxMC42ODYzIDEwIDE0VjE4QzEwIDIxLjMxMzcgMTIuNjg2MyAyNCAxNiAyNEMxOS4zMTM3IDI0IDIyIDIxLjMxMzcgMjIgMThWMTRDMjIgMTAuNjg2MyAxOS4zMTM3IDggMTYgOFoiIGZpbGw9IiM5QzlCNCIvPgo8L3N2Zz4=";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{order.product?.name || "N/A"}</p>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <span>Qty: {order.quantity}</span>
                      <span>×</span>
                      <span>₹{order.unitPrice}</span>
                    </div>
                    {order.offer && order.offer.type === "money" && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          <span>₹{order.offer.fixed} off</span>
                        </div>
                      </div>
                    )}
                    {order.offer && order.offer.type === "product" && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <Gift size={12} />
                          <span>Free item included</span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      {order.itemDiscount > 0 ? (
                        <span>
                          <span className="line-through text-gray-400">₹{order.unitPrice * order.quantity}</span> ₹{order.itemTotal}
                        </span>
                      ) : (
                        `₹${order.itemTotal}`
                      )}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Free Items from Product Offers */}
          {orderGroup.freeProducts && orderGroup.freeProducts.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-800 mb-2 text-sm flex items-center space-x-1">
                <Gift size={16} className="text-green-600" />
                <span>Free Items (from offers):</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orderGroup.freeProducts.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        FREE <span className="line-through text-gray-400">₹{item.unitPrice}</span> - {item.offerTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total (before offers):</span>
              <span>₹{orderGroup.totalBeforeAllOffers}</span>
            </div>
            {orderGroup.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Offer Discount:</span>
                <span>-₹{orderGroup.totalDiscount}</span>
              </div>
            )}
            {orderGroup.coinsUsed > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Coins Used ({orderGroup.coinsUsed}):</span>
                <span>-₹{orderGroup.coinDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold border-t pt-2">
              <span>Final Total:</span>
              <span>₹{orderGroup.finalTotal}</span>
            </div>
            {orderGroup.coinsToCredit > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coins to be given:</span>
                <span>+{orderGroup.coinsToCredit} coins</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen mt-2 sm:mt-5 rounded-t-2xl sm:rounded-4xl bg-gray-50">
      {/* Print Bill Modal */}
      {printingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Print Bill</h3>
            <p className="text-gray-600 mb-6">
              Ready to print bill for order #{printingBill.id}?
              <br />
              Final Amount: ₹{printingBill.finalTotal}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={printBill}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2"
              >
                <Printer size={16} />
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setPrintingBill(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex justify-center space-x-2 sm:space-x-8 border-b overflow-x-auto">
            <div onClick={() => setSelected("orders")} className={tabClass("orders")}>
              Orders
            </div>
            <div onClick={() => setSelected("accepted")} className={tabClass("accepted")}>
              <span className="hidden sm:inline">Accepted Orders</span>
              <span className="sm:hidden">Accepted</span>
            </div>
            <div onClick={() => setSelected("history")} className={tabClass("history")}>
              History
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading  orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((orderGroup) => (
            <OrderGroupCard key={orderGroup.id} orderGroup={orderGroup} />
          ))
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {selected === "orders" && "No pending orders at the moment."}
              {selected === "accepted" && "No accepted orders to show."}
              {selected === "history" && "No order history available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
