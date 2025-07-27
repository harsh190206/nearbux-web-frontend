import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Tag, Gift, Coins } from 'lucide-react';

import { BACKEND_URL } from '../config/constant'; // Replace with your actual backend URL

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState({});
  const [shopCoins, setShopCoins] = useState({});
  const [coinPayments, setCoinPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantityUpdates, setQuantityUpdates] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const userId = localStorage.getItem('userId');

  // Debounce quantity updates
  const debouncedQuantityUpdates = useDebounce(quantityUpdates, 1000);

  useEffect(() => {
    fetchCartItems();
    fetchOffers();
    fetchShopCoins();
  }, []);

  // Handle debounced quantity updates
  useEffect(() => {
    Object.keys(debouncedQuantityUpdates).forEach(cartItemId => {
      const quantity = debouncedQuantityUpdates[cartItemId];
      updateQuantityInDB(parseInt(cartItemId), quantity);
    });
    setQuantityUpdates({});
  }, [debouncedQuantityUpdates]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(userId) }),
      });

      const data = await response.json();
      if (data.success) {
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/offers`);
      const data = await response.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchShopCoins = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/shop-coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(userId) }),
      });

      const data = await response.json();
      if (data.success) {
        setShopCoins(data.shopCoins);
      }
    } catch (error) {
      console.error('Error fetching shop coins:', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/cart/remove/${cartItemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        const updatedCartItems = cartItems.filter(item => item.id !== cartItemId);
        setCartItems(updatedCartItems);

        // Check and auto-unselect offers that no longer meet minimum requirements
        checkAndUpdateOffers(updatedCartItems);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const updateQuantityInDB = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId: cartItemId,
          quantity: newQuantity
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Error updating quantity in DB');
        // Revert the local state if DB update failed
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      fetchCartItems();
    }
  };

  // Local quantity update with debounce
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    // Update local state immediately
    const updatedCartItems = cartItems.map(item =>
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems);

    // Check and auto-unselect offers that no longer meet minimum requirements
    checkAndUpdateOffers(updatedCartItems);

    // Queue for debounced DB update
    setQuantityUpdates(prev => ({
      ...prev,
      [cartItemId]: newQuantity
    }));
  };

  // Group cart items by shop
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const shopId = item.product.shop.id;
    if (!acc[shopId]) {
      acc[shopId] = {
        shopName: item.product.shop.name,
        coinValue: item.product.shop.coinValue,
        items: [],
        isActive: item.product.shop.isActive
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  // Function to check and update offers when cart changes
  const checkAndUpdateOffers = (updatedCartItems) => {
    const updatedGroupedItems = updatedCartItems.reduce((acc, item) => {
      const shopId = item.product.shop.id;
      if (!acc[shopId]) {
        acc[shopId] = {
          shopName: item.product.shop.name,
          coinValue: item.product.shop.coinValue,
          items: [],
          isActive: item.product.shop.isActive
        };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {});

    // Check each selected offer
    const updatedSelectedOffers = { ...selectedOffers };
    let offersChanged = false;

    Object.keys(selectedOffers).forEach(shopId => {
      const selectedOfferId = selectedOffers[shopId];
      const offer = offers.find(o => o.id === selectedOfferId);

      if (offer && updatedGroupedItems[shopId]) {
        const shopTotal = updatedGroupedItems[shopId].items.reduce(
          (total, item) => total + (item.product.price * item.quantity), 0
        );

        // Check if offer still meets requirements
        let shouldRemoveOffer = false;

        if (offer.type === 'money' || offer.type === 'percentage') {
          if (offer.minimum_amount && shopTotal < offer.minimum_amount) {
            shouldRemoveOffer = true;
          }
        } else if (offer.type === 'product') {
          const availableCoins = shopCoins[shopId] || 0;
          const hasEnoughCoins = availableCoins >= (offer.coinValue || 0);
          const meetsMinimumAmount = !offer.minimum_amount || shopTotal >= offer.minimum_amount;

          if (!hasEnoughCoins || !meetsMinimumAmount) {
            shouldRemoveOffer = true;
          }
        }

        if (shouldRemoveOffer) {
          delete updatedSelectedOffers[shopId];
          offersChanged = true;
        }
      } else if (!updatedGroupedItems[shopId]) {
        // Shop no longer has items, remove offer
        delete updatedSelectedOffers[shopId];
        offersChanged = true;
      }
    });

    if (offersChanged) {
      setSelectedOffers(updatedSelectedOffers);
    }
  };

  const calculateShopTotal = (shopItems) => {
    return shopItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShopDiscount = (shopId, shopTotal) => {
    const selectedOffer = selectedOffers[shopId];
    if (!selectedOffer) return 0;

    const offer = offers.find(o => o.id === selectedOffer);
    if (!offer) return 0;

    if (offer.type === 'money' && offer.minimum_amount && shopTotal >= offer.minimum_amount) {
      return offer.fixed || 0;
    } else if (offer.type === 'percentage' && offer.minimum_amount && shopTotal >= offer.minimum_amount) {
      return (shopTotal * offer.percentage) / 100;
    }

    return 0;
  };

  const calculateCoinDiscount = (shopId, coinsUsed) => {
    const shopData = groupedCartItems[shopId];
    if (!shopData || !coinsUsed) return 0;

    // coinValue in DB is for 100 coins, so divide by 100 to get per coin value
    const perCoinValue = (shopData.coinValue) / 100;
    return (coinsUsed * perCoinValue);
  };

  // Calculate maximum coins that can be used (4% of total order)
  const getMaxCoinsAllowed = (shopTotal) => {
    const maxDiscountAllowed = shopTotal * 0.04; // 4% of total
    const shopData = Object.values(groupedCartItems)[0]; // Get any shop data for coin value
    if (!shopData) return 0;
    //@ts-ignore
    const perCoinValue = (shopData.coinValue) / 100;
    // Calculate max coins, ensure it's a whole number if possible for better UX
    return Math.floor(maxDiscountAllowed / perCoinValue);
  };

  const canApplyProductOffer = (offer, shopId, shopTotal) => {
    const availableCoins = shopCoins[shopId] || 0;
    const hasEnoughCoins = availableCoins >= (offer.coinValue || 0);
    const meetsMinimumAmount = !offer.minimum_amount || shopTotal >= offer.minimum_amount;

    return offer.type === 'product' && hasEnoughCoins && meetsMinimumAmount;
  };

  const getAvailableOffers = (shopId, shopTotal) => {
    return offers.filter(offer => {
      if (offer.shop !== shopId) return false;

      if (offer.type === 'product') {
        return canApplyProductOffer(offer, shopId, shopTotal);
      } else if (offer.minimum_amount) {
        return shopTotal >= offer.minimum_amount;
      }

      return true;
    });
  };

  const handleOfferSelect = (shopId, offerId) => {
    setSelectedOffers(prev => {
      const newSelectedOffers = { ...prev };

      // If null/empty is passed, remove the offer selection
      if (!offerId) {
        delete newSelectedOffers[shopId];
      } else {
        newSelectedOffers[shopId] = offerId;
      }

      return newSelectedOffers;
    });
  };

  const handleCoinPaymentChange = (shopId, coins) => {
    const shopTotal = calculateShopTotal(groupedCartItems[shopId].items);
    const maxCoins = shopCoins[shopId] || 0;
    const maxCoinsAllowed = getMaxCoinsAllowed(shopTotal);
    const validCoins = Math.min(Math.max(0, parseInt(coins) || 0), maxCoins, maxCoinsAllowed);

    setCoinPayments(prev => ({
      ...prev,
      [shopId]: validCoins
    }));
  };

  // Handle input focus to clear placeholder
  const handleCoinInputFocus = (shopId) => {
    if (coinPayments[shopId] === 0) {
      setCoinPayments(prev => ({
        ...prev,
        [shopId]: ''
      }));
    }
  };

  // Handle input blur to set default value
  const handleCoinInputBlur = (shopId) => {
    if (coinPayments[shopId] === '' || coinPayments[shopId] === undefined) {
      setCoinPayments(prev => ({
        ...prev,
        [shopId]: 0
      }));
    }
  };

  const placeOrder = async () => {
    // Check if any shop is inactive
    const inactiveShops = Object.keys(groupedCartItems).filter(shopId =>
      !groupedCartItems[shopId].isActive
    );

    if (inactiveShops.length > 0) {
      const inactiveShopNames = inactiveShops.map(shopId =>
        groupedCartItems[shopId].shopName
      ).join(', ');
      alert(`Cannot place order. The following shops are inactive: ${inactiveShopNames}. Please wait until they are active to place your order.`);
      return;
    }

    setPlacingOrder(true);

    try {
      const orders = Object.keys(groupedCartItems).map(shopId => ({
        shopId: parseInt(shopId),
        items: groupedCartItems[shopId].items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          cartItemId: item.id
        })),
        offerId: selectedOffers[shopId] || null,
        coinsUsed: coinPayments[shopId] || 0
      }));

      // Validate coin payments
      for (const order of orders) {
        const availableCoins = shopCoins[order.shopId] || 0;
        const shopTotal = calculateShopTotal(groupedCartItems[order.shopId].items);
        const maxCoinsAllowed = getMaxCoinsAllowed(shopTotal);

        if (order.coinsUsed > availableCoins) {
          alert(`Insufficient coins for ${groupedCartItems[order.shopId].shopName}. Available: ${availableCoins}, Requested: ${order.coinsUsed}`);
          return;
        }

        if (order.coinsUsed > maxCoinsAllowed) {
          alert(`Maximum ${maxCoinsAllowed} coins can be used for ${groupedCartItems[order.shopId].shopName} (4% of order total)`);
          return;
        }
      }

      const response = await fetch(`${BACKEND_URL}/user/place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          orders: orders
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Order placed successfully!');
        setCartItems([]);
        setSelectedOffers({});
        setCoinPayments({});
        fetchShopCoins(); // Refresh shop coins
      } else {
        alert('Error placing order: ' + data.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500">Add some items to get started!</p>
        </div>
      </div>
    );
  }

  const grandTotal = Object.keys(groupedCartItems).reduce((total, shopId) => {
    const shopTotal = calculateShopTotal(groupedCartItems[shopId].items);
    const discount = calculateShopDiscount(shopId, shopTotal);
    const coinDiscount = calculateCoinDiscount(shopId, coinPayments[shopId]);
    return total + shopTotal - discount - coinDiscount;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Cart</h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {Object.keys(groupedCartItems).map(shopId => {
            const shopData = groupedCartItems[shopId];
            const shopTotal = calculateShopTotal(shopData.items);
            const availableOffers = getAvailableOffers(parseInt(shopId), shopTotal);
            const discount = calculateShopDiscount(shopId, shopTotal);
            const coinsUsed = coinPayments[shopId] || 0;
            const coinDiscount = calculateCoinDiscount(shopId, coinsUsed);
            const finalTotal = Math.ceil(shopTotal - discount - coinDiscount); // Rounded up
            const availableCoins = shopCoins[shopId] || 0;
            const maxCoinsAllowed = getMaxCoinsAllowed(shopTotal);
            const canUseCoins = shopTotal >= 300; // Minimum 300 required to use coins

            return (
              <div key={shopId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-0">{shopData.shopName}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shopData.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shopData.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Coins className="w-3 h-3" />
                        <span>{availableCoins} coins</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Coin Value: {(shopData.coinValue / 100).toFixed(2)} points per coin</p>
                </div>

                <div className="p-4 space-y-4">
                  {shopData.items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-400 rounded"></div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <h4 className="font-medium text-gray-800 text-base sm:text-lg">{item.product.name}</h4>
                        <p className="text-lg font-semibold text-gray-900 mb-1">₹ {item.product.price}</p>
                        <p className="text-sm text-gray-500">Stock: {item.product.quantity}</p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-7 sm:w-8 text-center font-medium">{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                          disabled={item.quantity >= item.product.quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Coin Payment Section */}
                  {availableCoins > 0 && canUseCoins && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-medium text-gray-800">Pay with Coins</h4>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Use Coins (Available: {availableCoins}, Max: {maxCoinsAllowed})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={Math.min(availableCoins, maxCoinsAllowed)}
                            value={coinPayments[shopId] === 0 ? '' : coinPayments[shopId]}
                            onChange={(e) => handleCoinPaymentChange(shopId, e.target.value)}
                            onFocus={() => handleCoinInputFocus(shopId)}
                            onBlur={() => handleCoinInputBlur(shopId)}
                            //@ts-ignore
                            onWheel={(e) => e.target.blur()} // Prevent scroll wheel changes
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base"
                            placeholder="Enter coins to use"
                          />
                          <p className="text-xs text-gray-500 mt-1">Maximum 4% of order total can be paid with coins</p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                          <p className="text-sm text-gray-600">Coin Discount</p>
                          <p className="font-semibold text-yellow-700">{coinDiscount.toFixed(2)} points</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!canUseCoins && availableCoins > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <Coins className="w-4 h-4 inline mr-1" />
                          Minimum order of ₹300 required to use coins for payment
                        </p>
                      </div>
                    </div>
                  )}

                  {availableOffers.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-gray-800">Available Offers</h4>
                      </div>

                      <div className="space-y-2">
                        {availableOffers.map(offer => (
                          <div key={offer.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <input
                              type="radio"
                              name={`offer-${shopId}`}
                              value={offer.id}
                              checked={selectedOffers[shopId] === offer.id}
                              onChange={() => handleOfferSelect(shopId, offer.id)}
                              className="text-green-600 mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{offer.title}</p>
                              <p className="text-sm text-gray-600">{offer.description}</p>
                              {offer.type === 'money' && (
                                <p className="text-sm text-green-600">₹{offer.fixed} off on orders above ₹{offer.minimum_amount}</p>
                              )}
                              {offer.type === 'percentage' && (
                                <p className="text-sm text-green-600">{offer.percentage}% off on orders above ₹{offer.minimum_amount}</p>
                              )}
                              {offer.type === 'product' && (
                                <div className="text-sm text-green-600">
                                  <p>Free product with {offer.coinValue} coins</p>
                                  {offer.minimum_amount && (
                                    <p>Minimum order: ₹{offer.minimum_amount}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add "No Offer" option to allow deselecting */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <input
                            type="radio"
                            name={`offer-${shopId}`}
                            value=""
                            checked={!selectedOffers[shopId]}
                            onChange={() => handleOfferSelect(shopId, null)}
                            className="text-gray-600 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">No Offer</p>
                            <p className="text-sm text-gray-600">Don't apply any offer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Subtotal</span>
                      <span className="font-semibold">₹ {shopTotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">Offer Discount</span>
                        <span className="font-semibold">- ₹ {discount.toFixed(2)}</span>
                      </div>
                    )}

                    {coinDiscount > 0 && (
                      <div className="flex justify-between items-center text-yellow-600">
                        <span className="font-medium">Coin Discount ({coinsUsed} coins)</span>
                        <span className="font-semibold">- {coinDiscount.toFixed(2)} points</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Shop Total</span>
                      <span>₹ {finalTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Grand Total</span>
                <span className="font-bold text-2xl">₹ {Math.ceil(grandTotal)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                  placingOrder
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {placingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
// gemini
