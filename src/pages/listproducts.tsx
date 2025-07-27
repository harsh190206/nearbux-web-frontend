import { useEffect, useState } from "react";
import { ArrowLeft, Star, MapPin, Clock, ShoppingCart, Plus, Minus, Search, Filter, AlertTriangle, X } from "lucide-react";
import { BACKEND_URL } from "../config/constant";

export default function ShopProducts() {
  // Get shopId from URL path
  const shopId = window.location.pathname.split('/')[2];
  
  const navigate = (path) => {
    if (path === -1) {
      window.history.back();
    } else {
      window.location.href = path;
    }
  };
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [localCart, setLocalCart] = useState([]); // Local cart before DB sync
  const [dbCart, setDbCart] = useState([]); // Current DB cart state
  const [existingCartShopId, setExistingCartShopId] = useState(null); // Track existing cart shop
  const [existingCartShopName, setExistingCartShopName] = useState(""); // Name of existing cart shop
  const [updatingCart, setUpdatingCart] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  
  // Modal states
  const [showCartWarning, setShowCartWarning] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Create dummy image with product name
  const createDummyImage = (productName) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Random vibrant background gradient
    const colors = [
      ['#FFD1DC', '#FFC0CB'], // Pink
      ['#A7EDFF', '#87CEFA'], // Light Blue
      ['#DFFFAD', '#BEEF9E'], // Light Green
      ['#FFDAB9', '#FFCBA4'], // Peach
      ['#E6E6FA', '#D8BFD8']  // Lavender
    ];
    const randomColors = colors[Math.floor(Math.random() * colors.length)];
    
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, randomColors[0]);
    gradient.addColorStop(1, randomColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);
    
    // Product name text
    ctx.fillStyle = '#333333'; // Darker text for contrast
    ctx.font = '20px Arial'; // Slightly larger font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if too long
    const maxWidth = 260;
    const words = productName.split(' ');
    let line = '';
    let y = 100;
    let lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = 25;
    const startY = 100 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((l, index) => {
      ctx.fillText(l, 150, startY + index * lineHeight);
    });
    
    return canvas.toDataURL();
  };

  // Fetch existing cart and set shop ID - OPTIMIZED: Only called on page load
  const fetchExistingCart = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/cart/${userId}`);
      const data = await response.json();
      
      if (data.success && data.cart && data.cart.length > 0) {
        setDbCart(data.cart);
        // Get shopId and shop name from first cart item
        const cartShopId = data.cart[0].product?.shopId;
        const cartShopName = data.cart[0].product?.shop?.name;
        if (cartShopId) {
          setExistingCartShopId(cartShopId.toString());
          setExistingCartShopName(cartShopName || "Unknown Shop");
        }
      } else {
        setDbCart([]);
        setExistingCartShopId(null);
        setExistingCartShopName("");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setDbCart([]);
      setExistingCartShopId(null);
      setExistingCartShopName("");
    }
  };

  // Clear entire cart from database using the clear cart route
  const clearCartFromDB = async () => {
    if (!userId) return false;
    
    try {
      const response = await fetch(`${BACKEND_URL}/user/cart/clear/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reset cart states
        setDbCart([]);
        setExistingCartShopId(null);
        setExistingCartShopName("");
        return true;
      } else {
        console.error("Failed to clear cart:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  };

  // Fetch shop and products
  const fetchShopProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/shop/${shopId}/products`);
      const data = await response.json();
      
      if (data.success) {
        setShop(data.shop);
        setProducts(data.products || []);
      } else {
        console.error("Failed to fetch shop products:", data.message);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching shop products:", error);
      navigate(-1);
    }
  };

  // Add to local cart with shop conflict check - OPTIMIZED: No DB calls
  const addToLocalCart = (productId) => {
    if (!userId) {
      alert("Please login to add items to cart");
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || product.quantity === 0) {
      alert("Product not available or out of stock");
      return;
    }

    // Check if there's a shop conflict
    if (existingCartShopId && existingCartShopId !== shopId) {
      setPendingCartItem({ productId, product });
      setShowCartWarning(true);
      return;
    }

    // If no conflict, add to local cart
    setLocalCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      
      if (existingItem) {
        // Check if we can add more (don't exceed product stock)
        const currentLocalQty = existingItem.quantity;
        const dbQty = dbCart.find(dbItem => dbItem.productId === productId)?.quantity || 0;
        const totalQty = currentLocalQty + dbQty;
        
        if (totalQty >= product.quantity) {
          alert("Cannot add more items. Stock limit reached.");
          return prev;
        }
        
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Check if already in DB cart
        const dbQty = dbCart.find(dbItem => dbItem.productId === productId)?.quantity || 0;
        if (dbQty >= product.quantity) {
          alert("Cannot add more items. Stock limit reached.");
          return prev;
        }
        
        return [...prev, { 
          productId, 
          quantity: 1,
          product: product 
        }];
      }
    });

    // Set the current shop as the cart shop if it's empty
    if (!existingCartShopId) {
      setExistingCartShopId(shopId);
      setExistingCartShopName(shop?.name || "");
    }
  };

  // Remove from local cart - OPTIMIZED: No DB calls
  const removeFromLocalCart = (productId) => {
    setLocalCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        const updatedCart = prev.filter(item => item.productId !== productId);
        
        // If local cart becomes empty and DB cart is also empty, reset shop ID
        if (updatedCart.length === 0 && dbCart.length === 0) {
          setExistingCartShopId(null);
          setExistingCartShopName("");
        }
        
        return updatedCart;
      }
    });
  };

  // Handle cart warning confirmation - Clear existing cart and add new item
  const handleCartWarningConfirm = async () => {
    setClearingCart(true);
    
    try {
      // Clear existing cart from database
      const clearSuccess = await clearCartFromDB();
      
      if (clearSuccess) {
        // Clear local cart as well
        setLocalCart([]);
        
        // Add the pending item to local cart
        setLocalCart([{ 
          productId: pendingCartItem.productId, 
          quantity: 1,
          product: pendingCartItem.product 
        }]);
        
        // Update the cart shop ID
        setExistingCartShopId(shopId);
        setExistingCartShopName(shop?.name || "");
        
        alert("Previous cart cleared and item added successfully!");
      } else {
        alert("Failed to clear previous cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Failed to clear previous cart");
    }

    setClearingCart(false);
    setShowCartWarning(false);
    setPendingCartItem(null);
  };

  // Handle cart warning cancel - Don't add item, keep existing cart
  const handleCartWarningCancel = () => {
    setShowCartWarning(false);
    setPendingCartItem(null);
  };

  // Update cart in database - OPTIMIZED: Single bulk operation
  const updateCartInDB = async () => {
    if (localCart.length === 0) {
      alert("No items to add to cart");
      return;
    }

    setUpdatingCart(true);

    try {
      // Use the bulk add API with conflict check
      const response = await fetch(`${BACKEND_URL}/user/cart/bulk-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          items: localCart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          clearExistingCart: false // We handle conflicts separately
        })
      });

      const result = await response.json();

      if (result.success) {
        const { successCount, failCount } = result;
        
        if (successCount > 0) {
          alert(`Successfully added ${successCount} item(s) to cart!`);
          setLocalCart([]); // Clear local cart
          // Refresh cart state
          await fetchExistingCart();
        }

        if (failCount > 0) {
          alert(`Failed to add ${failCount} item(s) to cart. Please check stock availability.`);
        }
      } else {
        alert("Failed to update cart: " + result.message);
      }

    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Failed to update cart");
    } finally {
      setUpdatingCart(false);
    }
  };

  // Get item quantity in local cart
  const getLocalCartQuantity = (productId) => {
    const item = localCart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Get total quantity (DB + Local) for a product
  const getTotalCartQuantity = (productId) => {
    const localQty = getLocalCartQuantity(productId);
    const dbQty = dbCart.find(item => item.productId === productId)?.quantity || 0;
    return localQty + dbQty;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchShopProducts();
      await fetchExistingCart(); // Fetch existing cart on page load
      setLoading(false);
    };
    
    if (shopId) {
      loadData();
    }
  }, [shopId]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop products...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 mb-4">The shop you're looking for doesn't exist or is inactive.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-4"> {/* Added padding bottom for mobile cart summary */}
      {/* Cart Warning Modal */}
      {showCartWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 sm:m-0"> {/* Added margin for mobile */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Cart Conflict Detected</h3>
              </div>
              <p className="text-gray-600 mb-4">
                You have items from <strong>{existingCartShopName}</strong> in your cart. 
              </p>
              <p className="text-gray-600 mb-6">
                Adding items from <strong>{shop?.name}</strong> will clear your existing cart. Do you want to continue?
              </p>
              <div className="flex flex-col sm:flex-row gap-3"> {/* Responsive buttons */}
                <button
                  onClick={handleCartWarningCancel}
                  disabled={clearingCart}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCartWarningConfirm}
                  disabled={clearingCart}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {clearingCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Clearing...
                    </>
                  ) : (
                    'Clear & Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10"> {/* Sticky header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate"> {/* Truncate for long titles */}
              Shop Products
            </h1>
          </div>
          
          {/* Local Cart Summary - Moved to fixed bottom for mobile */}
          {/* Will be conditionally rendered fixed at bottom */}
        </div>
      </div>

      {/* Shop Information */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center"> {/* Responsive layout */}
          <div className="flex-1 mb-4 sm:mb-0 sm:mr-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{shop.name}</h2>
            
            {/* Removed Rating Display */}
            {shop.owner?.verified && (
                <span className="mb-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block">
                  Verified
                </span>
            )}
            <p className="text-gray-600 mb-2">{shop.tagline}</p>
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{shop.localArea}, PIN: {shop.pin}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {shop.isActive ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>
          <div className="w-24 h-24 flex-shrink-0"> {/* Larger image for clarity */}
            <img
              src={shop.image || createDummyImage(shop.name)}
              alt={shop.name}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy" // Added for faster loading
            />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 mt-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4"> {/* Responsive layout */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
         
        </div>
      </div>

      {/* Cart Status Alert */}
      {existingCartShopId && existingCartShopId !== shopId && (
        <div className="mx-4 mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" /> {/* Prevent icon from shrinking */}
            <span className="text-sm text-orange-700">
              You have items from <strong>{existingCartShopName}</strong> in your cart. 
              Adding items from this shop will require clearing your existing cart.
            </span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Responsive grid */}
            {filteredProducts.map((product) => {
              const localQuantity = getLocalCartQuantity(product.id);
              const totalQuantity = getTotalCartQuantity(product.id);
              const isOutOfStock = product.quantity === 0;
              const reachedLimit = totalQuantity >= product.quantity;
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-12 w-full"> {/* Ensure image container is responsive */}
                    <img
                      src={product.image || createDummyImage(product.name)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      loading="lazy" // Added for faster loading
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.quantity} available
                        </p>
                        {totalQuantity > 0 && (
                          <p className="text-xs text-green-600">
                            {totalQuantity} in cart
                          </p>
                        )}
                      </div>
                      {product.canBePurchasedByCoin && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Coin Purchase
                        </span>
                      )}
                    </div>
                    
                    {localQuantity > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeFromLocalCart(product.id)}
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-semibold">{localQuantity}</span>
                          <button
                            onClick={() => addToLocalCart(product.id)}
                            disabled={isOutOfStock || reachedLimit}
                            className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Ready to Add</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToLocalCart(product.id)}
                        disabled={isOutOfStock || reachedLimit}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : reachedLimit
                            ? "bg-orange-300 text-orange-700 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isOutOfStock ? (
                          "Out of Stock"
                        ) : reachedLimit ? (
                          "Limit Reached"
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? "No Products Found" : "No Products Available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms."
                : "This shop doesn't have any products listed yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Products Count */}
      {filteredProducts.length > 0 && (
        <div className="px-4 py-4 text-center text-gray-500">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      {/* Fixed Bottom Local Cart Summary */}
      {localCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {localCart.reduce((sum, item) => sum + item.quantity, 0)} items ready
            </span>
          </div>
          <button
            onClick={updateCartInDB}
            disabled={updatingCart}
            className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm ${
              updatingCart ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {updatingCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Cart'
            )}
          </button>
        </div>
      )}
    </div>
  );
}