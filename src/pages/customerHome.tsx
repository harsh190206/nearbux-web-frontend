import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Star, MapPin, Clock, ShoppingBag, X, CheckCircle, XCircle, AlertCircle, Package, Gift, ChevronRight as ArrowRight } from "lucide-react";
import { BACKEND_URL } from "../config/constant";
import { useNavigate } from "react-router";
import axios from 'axios';

export default function CustomerHome() {
  const [select, setSelect] = useState("shops");
  const [advertisements, setAdvertisements] = useState([]);
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Initial loading state for overall page
  const [loadingOrders, setLoadingOrders] = useState(false); // New loading state for orders tab
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const navigate = useNavigate();
  
  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Use state for pincode and area to trigger re-renders when they are set
  const [pincode, setPincode] = useState(localStorage.getItem("pincode"));
  const [area, setArea] = useState(localStorage.getItem("area"));
  
  // Effect to handle initial address fetching and navigation
  useEffect(() => {
    // Check if pincode or area are missing AND if userId is present
    if (!pincode || !area) {
      if (userId) {
        const getAddress = async () => {
          try {
            const response = await axios.post(`${BACKEND_URL}/user/getaddress`, { userId: userId });
            if (response.data.pincode && response.data.area) {
              localStorage.setItem("pincode", response.data.pincode);
              localStorage.setItem("area", response.data.area);
              // Update state to trigger re-render with new values
              setPincode(response.data.pincode);
              setArea(response.data.area);
            } else {
              // If address not found on backend, navigate to signin
              navigate("/signin");
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            // Handle error, maybe navigate to signin or show a message
            navigate("/signin");
          }
        };
        getAddress();
      } else {
        // If no userId, navigate to signin
        navigate("/signin");
      }
    }
  }, [pincode, area, userId, navigate]);
 
  // Fetch advertisements - FIXED URL
  const fetchAdvertisements = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/advertisements`);
      const data = await response.json();
      setAdvertisements(data.advertisements || []);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    }
  };

  // Fetch shops - FIXED URL
  const fetchShops = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/shops-available`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: area,
          pincode: pincode
        })
      });
      const data = await response.json();
      setShops(data.shops || []);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  // Fetch orders - FIXED URL and method
  // This function is now called conditionally
  const fetchOrders = async () => {
    if (!userId) {
      console.error("No user ID found");
      return;
    }
    
    setLoadingOrders(true); // Start loading for orders
    try {
      const response = await fetch(`${BACKEND_URL}/user/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false); // End loading for orders
    }
  };

  // Cancel order function
  const cancelOrder = async (orderGroupId) => {
    if (!userId) {
      console.error("No user ID found");
      return;
    }
    
    setCancellingOrder(orderGroupId);
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/orders/${orderGroupId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update orders list locally
        setOrders(orders.map(order => 
          order.id === orderGroupId 
            ? { ...order, status: 'CANCELLED' }
            : order
        ));
        alert("Order cancelled successfully! Coins have been refunded.");
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Error cancelling order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  // Initial data load for Advertisements and Shops only
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      // Only fetch advertisements and shops initially
      await Promise.all([fetchAdvertisements(), fetchShops()]);
      setLoading(false);
    };
    if (area && pincode) { // Only load if address is available
        loadInitialData();
    }
  }, [area, pincode]); // Depend on area and pincode to ensure data loads after address is set

  // Effect to fetch orders ONLY when the 'orders' tab is selected
  useEffect(() => {
    if (select === "orders" && userId && orders.length === 0 && !loadingOrders) {
      // Fetch orders only if the tab is selected, user ID exists,
      // orders are not already loaded, and not currently loading
      fetchOrders();
    }
  }, [select, userId, orders.length, loadingOrders]); // Added loadingOrders to dependency to avoid redundant calls

  // Auto-scroll advertisements
  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [advertisements.length]);

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const navigateToShop = (shopId) => {
    // Navigate to shop products page - FIXED URL
    window.location.href = `/shop/${shopId}/products`;
  };

  const navigateToOrderDetails = (orderId) => {
    // Navigate to order details page
    window.location.href = `/orders/${orderId}`;
  };

  // Function to record advertisement view - FIXED URL
  const recordAdView = async (adId) => {
    try {
      await fetch(`${BACKEND_URL}/user/advertisement/${adId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error("Error recording ad view:", error);
    }
  };

  // Function to record advertisement click - FIXED URL
  const recordAdClick = async (adId) => {
    try {
      await fetch(`${BACKEND_URL}/user/advertisement/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error("Error recording ad click:", error);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status icon and color
  const getStatusDetails = (status) => {
    switch (status) {
      case 'PENDING':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', text: 'text-amber-800' };
      case 'CONFIRMED':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', text: 'text-emerald-800' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  // Generate shop name display for missing images
  const generateShopNameDisplay = (shopName) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-indigo-400 to-indigo-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-yellow-400 to-yellow-600',
      'from-green-400 to-green-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    const colorIndex = shopName.length % colors.length;
    return colors[colorIndex];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading Shops </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Featured Advertisements Section */}
      <div className="px-3 pt-3">
        <div className="relative bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden"> {/* Added relative here for chevron positioning */}
          {advertisements.length > 0 ? (
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
              >
                {advertisements.map((ad, index) => (
                  <div key={ad.id} className="w-full flex-shrink-0">
                    <div className="relative flex flex-col sm:flex-row bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden min-h-[280px] sm:min-h-[220px] lg:min-h-[250px] items-center"> {/* Increased min-h, added items-center for vertical alignment */}
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-20 -translate-y-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
                      </div>
                      
                      {/* Text Content Section - Left side */}
                      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center order-2 sm:order-1"> {/* Adjusted padding, order for responsive layout */}
                        <div className="mb-3">
                          <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white mb-2">
                            ✨ Featured Deal
                          </span>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight"> {/* Increased text size for larger screens */}
                            {ad.title}
                          </h3>
                        </div>
                        
                        {ad.shop?.rating && (
                          <div className="flex items-center mb-3">
                            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(ad.shop.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-white/50"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-white text-xs font-semibold">
                                {ad.shop.rating}.0
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-blue-100 text-sm sm:text-base mb-4 leading-relaxed line-clamp-2"> {/* Increased text size for larger screens */}
                          {ad.message}
                        </p>
                        
                        <div className="flex items-center text-blue-200 mb-4">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {ad.shop?.localArea}, PIN: {ad.shop?.pin}
                          </span>
                        </div>
                        
                        <button 
                          className="bg-white text-blue-700 px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                          onClick={() => {
                            recordAdClick(ad.id);
                            navigateToShop(ad.shopId);
                          }}
                        >
                          Shop Now
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>

                      {/* Image Section - Right side */}
                      <div className="relative w-full h-48 sm:w-1/2 sm:h-auto overflow-hidden rounded-md sm:rounded-none order-1 sm:order-2"> {/* Increased mobile height, added rounded corners for mobile image, order for responsive layout */}
                        {ad.image ? ( 
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                            loading="lazy" 
                            onLoad={() => recordAdView(ad.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-base"> {/* Adjusted text size */}
                            No Image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chevron Navigation Buttons - Moved outside the inner flex, relative to the main `bg-white rounded-xl` div */}
              {advertisements.length > 1 && (
                <>
                  <button
                    onClick={prevAd}
                    className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg transition-all duration-300 z-20 hidden sm:block" /* Adjusted position, padding, hidden on mobile */
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextAd}
                    className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg transition-all duration-300 z-20 hidden sm:block" /* Adjusted position, padding, hidden on mobile */
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                    {advertisements.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAdIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8 text-center min-h-[280px] sm:min-h-[220px] lg:min-h-[250px] flex flex-col justify-center items-center"> {/* Adjusted padding and min-h */}
              <div className="text-3xl sm:text-4xl mb-3">🎯</div> {/* Adjusted icon size */}
              <h3 className="text-lg font-semibold mb-2">
                No Featured Deals
              </h3>
              <p className="text-blue-200 text-sm">
                Check back for exciting offers!
              </p>
            </div>
          )}
        </div>
      </div>

      

      {/* Navigation Tabs */}
      <div className="px-3 mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setSelect("shops")}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 text-center text-sm sm:text-base font-semibold transition-all duration-300 ${ /* Adjusted padding and text size */
                select === "shops"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              🏪 Shops
            </button>
            <button
              onClick={() => setSelect("orders")}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 text-center text-sm sm:text-base font-semibold transition-all duration-300 ${ /* Adjusted padding and text size */
                select === "orders"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              📦 Orders
            </button>
          </div>
        </div>
      </div>

      

      {/* Content based on selected tab */}
      {select === "shops" && (
        <div className="px-3 mt-4 pb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-blue-100 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base" /* Adjusted padding and text size */
              />
            </div>
          </div>

          {/* Shops Grid */}
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-300"
                onClick={() => navigateToShop(shop.id)}
              >
                <div className="flex items-center"> {/* Added items-center for vertical alignment */}
                  <div className="flex-1 p-3 sm:p-4"> {/* Adjusted padding */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight"> {/* Adjusted text size */}
                        {shop.name}
                      </h3>
                      <div className={`ml-2 rounded-full p-1 ${shop.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${shop.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                    
                    {shop.tagline && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1"> {/* Adjusted text size */}
                        {shop.tagline}
                      </p>
                    )}
                    
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1 text-blue-600 sm:w-4 h-4" /> {/* Adjusted icon size */}
                      <span className="text-xs sm:text-sm"> {/* Adjusted text size */}
                        {shop.localArea}, PIN: {shop.pin}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        shop.isActive 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {shop.isActive ? "Open" : "Closed"}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-400 sm:w-4 h-4" /> {/* Adjusted icon size */}
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 sm:w-20 h-20 m-2 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0"> {/* Adjusted size and added flex-shrink-0 */}
                    {shop.image ? (
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                        loading="lazy" 
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${generateShopNameDisplay(shop.name)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs text-center px-1 leading-tight">
                          {shop.name.split(' ').map(word => word[0]).join('').substring(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredShops.length === 0 && (
            <div className="text-center py-8 sm:py-12"> {/* Adjusted padding */}
              <div className="w-12 h-12 sm:w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjusted size */}
                <ShoppingBag className="w-6 h-6 sm:w-8 h-8 text-blue-600" /> {/* Adjusted icon size */}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2"> {/* Adjusted text size */}
                No Shops Found
              </h3>
              <p className="text-sm text-gray-500"> {/* Adjusted text size */}
                Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      )}

      

      {select === "orders" && (
        <div className="px-3 mt-4 pb-6">
          {loadingOrders ? ( 
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="text-center p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-blue-600 font-medium">Loading Orders...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusDetails = getStatusDetails(order.status);
                const StatusIcon = statusDetails.icon;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-3 sm:p-4"> {/* Adjusted padding */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between"> {/* Changed to flex-col on small screens */}
                        {/* Left side - Shop info and status */}
                        <div className="flex-1 w-full space-y-2 sm:space-y-3 mb-3 sm:mb-0"> {/* Adjusted spacing and width */}
                          {/* Shop name */}
                          <div className="flex items-center space-x-2 sm:space-x-3"> {/* Adjusted spacing */}
                            <div className={`p-1 sm:p-2 rounded-lg ${statusDetails.bg}`}> {/* Adjusted padding */}
                              <StatusIcon className={`w-3 h-3 sm:w-4 h-4 ${statusDetails.color}`} /> {/* Adjusted icon size */}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg"> {/* Adjusted text size */}
                                {order.seller?.name || order.shop?.name}
                              </h3>
                            </div>
                          </div>
                          
                          {/* Date and time */}
                          <div className="flex items-center space-x-2 ml-10 sm:ml-12"> {/* Adjusted ml */}
                            <Clock className="w-3 h-3 text-gray-400 sm:w-4 h-4" /> {/* Adjusted icon size */}
                            <span className="text-xs sm:text-sm text-gray-600"> {/* Adjusted text size */}
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          {/* Status and cancel button */}
                          <div className="flex flex-wrap items-center gap-2 sm:space-x-3 ml-10 sm:ml-12"> {/* Used gap for flex wrap, adjusted ml */}
                            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${statusDetails.text} ${statusDetails.bg}`}> {/* Adjusted padding and text size */}
                              {order.status}
                            </span>
                            
                            {order.status === 'PENDING' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelOrder(order.id);
                                }}
                                disabled={cancellingOrder === order.id}
                                className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs sm:text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1" /* Adjusted padding and text size */
                              >
                                {cancellingOrder === order.id ? (
                                  <>
                                    <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Cancelling...</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    <span>Cancel</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Right side - View details button */}
                        <div className="w-full sm:w-auto flex justify-end"> {/* Ensured button is at the end on small screens */}
                          <button
                            onClick={() => navigateToOrderDetails(order.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-1 sm:space-x-2 text-sm" /* Adjusted padding, spacing, and text size */
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 h-4" /> {/* Adjusted icon size */}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {orders.length === 0 && !loadingOrders && ( 
            <div className="text-center py-12 sm:py-16"> {/* Adjusted padding */}
              <div className="w-16 h-16 sm:w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjusted size */}
                <Package className="w-8 h-8 sm:w-10 h-10 text-blue-600" /> {/* Adjusted icon size */}
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm"> {/* Adjusted margin and text size */}
                Start shopping to see your orders here.
              </p>
              <button
                onClick={() => setSelect("shops")}
                className="bg-blue-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base" /* Adjusted padding and text size */
              >
                Browse Shops
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}