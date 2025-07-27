import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Coins, Tag, Clock, Gift } from 'lucide-react';

import { BACKEND_URL } from '../config/constant';

const OrderDetailsPage = () => {
  const [orderGroup, setOrderGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderGroupId, setOrderGroupId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Extract order ID from URL
    const path = window.location.pathname;
    const orderIdFromUrl = path.split('/orders/')[1];
    
    // Get user ID from localStorage
    let userIdFromStorage;
    try {
      // Note: localStorage is not available in Claude artifacts
      // In a real environment, this would work
      userIdFromStorage = localStorage.getItem("userId");
    } catch (e) {
      // Fallback for Claude environment - use demo user ID
      userIdFromStorage = "3"; // Using the user ID from your response data
    }
    
    if (!orderIdFromUrl) {
      setError('Invalid URL: Order ID not found');
      setLoading(false);
      return;
    }
    
    if (!userIdFromStorage) {
      setError('User not authenticated. Please login again.');
      setLoading(false);
      return;
    }
    
    setOrderGroupId(orderIdFromUrl);
    setUserId(userIdFromStorage);
  }, []);

  useEffect(() => {
    if (orderGroupId && userId) {
      fetchOrderDetails();
    }
  }, [orderGroupId, userId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details with:', { orderGroupId, userId });
      
      const response = await fetch(`${BACKEND_URL}/user/orders/${orderGroupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(userId) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      console.log('Response structure check:', {
        hasSuccess: 'success' in data,
        hasOrder: 'order' in data,
        hasId: 'id' in data,
        hasStatus: 'status' in data,
        dataKeys: Object.keys(data)
      });

      // Handle the response based on your actual backend structure
      if (data.id && data.status && data.orders) {
        // Direct response structure (your current backend response)
        const processedOrder = processOrderData(data);
        setOrderGroup(processedOrder);
      } else if (data.success && data.order) {
        // Wrapped response structure
        const processedOrder = processOrderData(data.order);
        setOrderGroup(processedOrder);
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (orderData) => {
    console.log('Processing order data:', orderData);
    
    // Use the values directly from your backend response
    const originalAmount = orderData.originalAmount || 0;
    const shopCoinValue = orderData.coinValueInRupees || orderData.shop?.coinValue || 100;
    const singleCoinValue = orderData.singleCoinValue || 0.1;
    const coinsDiscountValue = orderData.coinsDiscountValue || 0;
    const totalOfferDiscount = orderData.totalOfferDiscount || 0;
    const offersApplied = orderData.offersApplied || [];
    
    console.log('Calculated values:', {
      originalAmount,
      shopCoinValue,
      singleCoinValue,
      coinsDiscountValue,
      totalOfferDiscount,
      ordersLength: orderData.orders?.length || 0
    });
    
    // Map orders to the expected format
    const processedItems = (orderData.orders || []).map((item) => {
      // Find if this item has an offer applied
      const appliedOffer = offersApplied.find(offer => offer.id === item.offerId);
      
      // Calculate offer discount if we have an applied offer
      let itemOfferDiscount = 0;
      if (appliedOffer) {
        if (appliedOffer.type === 'percentage') {
          const itemTotal = (item.unitPrice || 0) * (item.quantity || 0);
          itemOfferDiscount = (itemTotal * (appliedOffer.percentage || 0)) / 100;
        } else if (appliedOffer.fixed) {
          itemOfferDiscount = appliedOffer.fixed;
        }
        // Note: product-type offers don't have itemOfferDiscount as they're free items
      }
      
      return {
        id: item.id || 0,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        offerDiscount: itemOfferDiscount,
        product: {
          id: item.productId || 0,
          name: item.product?.name || `Product ${item.productId || 'Unknown'}`,
          price: item.unitPrice || 0,
          image: item.product?.image || null
        },
        offer: appliedOffer || null
      };
    });

    // Calculate final amount with proper rounding
    const calculatedFinalAmount = originalAmount - coinsDiscountValue - totalOfferDiscount;
    const finalAmount = orderData.totalAmount;
    
    const result = {
      id: orderData.id,
      status: orderData.status,
      totalAmount: finalAmount,
      coinsUsed: orderData.coinsUsed || 0,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      soldOffline: orderData.soldOffline || false,
      totalItems: orderData.totalItems || 0,
      
      shop: {
        id: orderData.shop?.id,
        name: orderData.shop?.name,
        localArea: orderData.shop?.localArea,
        pin: orderData.shop?.pin,
        coinValue: shopCoinValue,
        phone: orderData.shop?.phone
      },
      
      user: orderData.user,
      
      orders: processedItems,
      
      // Calculated values
      originalAmount,
      coinsDiscountValue,
      singleCoinValue,
      totalOfferDiscount,
      offersApplied,
      calculatedFinalAmount,
      
      // Verification
      calculationMatches: Math.abs(calculatedFinalAmount - finalAmount) < 1
    };
    
    console.log('Processed result:', result);
    return result;
  };

  const handleBackToHome = () => {
    // In a real app, you'd use react-router navigation
    window.location.href = '/home';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderGroup) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The requested order could not be found.</p>
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-medium">Back to Home</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Order Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Order #{orderGroup.id}</h2>
                <p className="text-blue-100">
                  Placed on {new Date(orderGroup.createdAt).toLocaleDateString('en-IN')}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  From: {orderGroup.shop?.name} - {orderGroup.shop?.localArea}
                </p>
                {orderGroup.shop?.phone && (
                  <p className="text-blue-100 text-sm">
                    Contact: {orderGroup.shop.phone}
                  </p>
                )}
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderGroup.status)}`}>
                  <Clock size={16} className="inline mr-1" />
                  {orderGroup.status.charAt(0).toUpperCase() + orderGroup.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            {/* Products Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package size={20} className="mr-2 text-blue-600" />
                Order Items ({orderGroup.totalItems} items)
              </h3>
              <div className="space-y-4">
                {orderGroup.orders.map((orderItem, index) => (
                  <div key={orderItem.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-lg mb-1">
                          {orderItem.product?.name || 'Product Name'}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          Quantity: {orderItem.quantity || 0} × ₹{orderItem.unitPrice || 0}
                        </p>
                        {orderItem.offer && (
                          <div className="space-y-1">
                            <div className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                              <Tag size={12} className="mr-1" />
                              {orderItem.offer.title || `${orderItem.offer.percentage || orderItem.offer.fixed || 0}${orderItem.offer.type === 'percentage' ? '% OFF' : '₹ OFF'}`}
                            </div>
                            {(orderItem.offerDiscount || 0) > 0 && (
                              <p className="text-xs text-green-600">
                                Discount: -₹{(orderItem.offerDiscount || 0).toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <div className="text-right">
                          {(orderItem.offerDiscount || 0) > 0 ? (
                            <div>
                              <p className="text-sm text-gray-500 line-through">
                                ₹{((orderItem.unitPrice || 0) * (orderItem.quantity || 0)).toFixed(2)}
                              </p>
                              <p className="text-xl font-bold text-blue-600">
                                ₹{((orderItem.unitPrice || 0) * (orderItem.quantity || 0) - (orderItem.offerDiscount || 0)).toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-blue-600">
                              ₹{((orderItem.unitPrice || 0) * (orderItem.quantity || 0)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Coins Used */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Coins size={18} className="mr-2 text-blue-600" />
                  Coins Used
                </h4>
                <div className="text-2xl font-bold text-blue-600">
                  {orderGroup.coinsUsed || 0} coins
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Value: ₹{(orderGroup.coinsDiscountValue || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (1 coin = ₹{(orderGroup.singleCoinValue || 0).toFixed(2)})
                </p>
                <p className="text-xs text-gray-500">
                  (100 coins = ₹{orderGroup.shop?.coinValue || orderGroup.coinValueInRupees || 'N/A'})
                </p>
              </div>

              {/* Offers Applied */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag size={18} className="mr-2 text-green-600" />
                  Offers Applied
                </h4>
                {orderGroup.offersApplied && orderGroup.offersApplied.length > 0 ? (
                  <div className="space-y-3">
                    {orderGroup.offersApplied.map((offer, index) => (
                      <div key={index} className="space-y-2">
                        <div className="text-sm font-medium text-green-700">
                          • {offer.title || `${offer.percentage || offer.fixed || 'Special'}${offer.type === 'percentage' ? '% OFF' : offer.type === 'money' ? '₹ OFF' : ' Offer'}`}
                        </div>
                        
                        {/* Show free product for product-type offers */}
                        {offer.type === 'product' && offer.freeProduct && (
                          <div className="bg-white rounded-lg p-3 border-2 border-green-200">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <Gift size={20} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {offer.freeProduct.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Original Price: ₹{offer.freeProduct.price}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      FREE
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(orderGroup.totalOfferDiscount || 0) > 0 && (
                      <p className="text-sm text-gray-600 mt-3 pt-2 border-t border-green-200">
                        Total Discount: ₹{(orderGroup.totalOfferDiscount || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-green-600">
                    No offers applied
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-4">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="text-gray-800">₹{(orderGroup.originalAmount || 0).toFixed(2)}</span>
                </div>
                {(orderGroup.coinsUsed || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coins Discount ({orderGroup.coinsUsed || 0} coins):</span>
                    <span className="text-green-600">-₹{(orderGroup.coinsDiscountValue || 0).toFixed(2)}</span>
                  </div>
                )}
                {(orderGroup.totalOfferDiscount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Offer Discount:</span>
                    <span className="text-green-600">-₹{(orderGroup.totalOfferDiscount || 0).toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Final Amount Paid:</span>
                  <span className="text-blue-600 text-lg">₹{Math.ceil(orderGroup.calculatedFinalAmount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleBackToHome}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;