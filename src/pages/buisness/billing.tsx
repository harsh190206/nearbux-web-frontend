import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, Printer, Database, X, Package } from 'lucide-react';
import { BACKEND_URL } from "../../config/constant";

const BillingComponent = () => {
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [shopName , setshopName] = useState("shop");
  const [tagLine , setTagline] = useState("");

  // Check authentication and get shop details
  useEffect(() => {
    const storedShopId = localStorage.getItem('shopId');
    const storedOwnerId = localStorage.getItem('ownerId');
    
    if (!storedShopId || !storedOwnerId) {
      window.location.href = '/bsignin';
      return;
    }
    fetchName(parseInt(storedShopId))
    setShopId(parseInt(storedShopId));
    setOwnerId(parseInt(storedOwnerId));
    fetchProducts(parseInt(storedShopId));
  }, []);

  // Fetch products from API

  async function fetchName (shopId){
    try {
      const response =  await fetch(`${BACKEND_URL}/shop/shopname`, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json'   
        },
        body : JSON.stringify({
          shopId : shopId

        })
      });

      if(response.ok){
        const data =  await response.json();
        setshopName(data.message);
        setTagline(data.tagline);
      }
}catch(e){
  console.error(e.message);
}
  }

  const fetchProducts = async (shopId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to bill
  const addToBill = (product) => {
    const existingItem = billItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.billQuantity < product.quantity) {
        setBillItems(billItems.map(item =>
          item.id === product.id
            ? { ...item, billQuantity: item.billQuantity + 1 }
            : item
        ));
      }
    } else {
      if (product.quantity > 0) {
        setBillItems([...billItems, { ...product, billQuantity: 1 }]);
      }
    }
  };

  // Remove product from bill
  const removeFromBill = (productId) => {
    const existingItem = billItems.find(item => item.id === productId);
    
    if (existingItem && existingItem.billQuantity > 1) {
      setBillItems(billItems.map(item =>
        item.id === productId
          ? { ...item, billQuantity: item.billQuantity - 1 }
          : item
      ));
    } else {
      setBillItems(billItems.filter(item => item.id !== productId));
    }
  };

  // Calculate total price
  const totalPrice = billItems.reduce((total, item) => total + (item.price * item.billQuantity), 0);

  // Update database (reduce product quantities)
  const updateDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/update-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: billItems.map(item => ({
            productId: item.id,
            quantity: item.billQuantity
          })),
          ownerId: ownerId
        }),
      });

      if (response.ok) {
        alert('Database updated successfully!');
        // Refresh products
        fetchProducts(shopId);
        setBillItems([]);
      } else {
        alert('Failed to update database');
      }
    } catch (error) {
      console.error('Error updating database:', error);
      alert('Error updating database');
    } finally {
      setLoading(false);
    }
  };

  // Print bill (with database update)
  const printBill = async () => {
    if (billItems.length === 0) {
      alert('No items in bill to print');
      return;
    }

    setLoading(true);
    try {
      // First update the database
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/update-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: billItems.map(item => ({
            productId: item.id,
            quantity: item.billQuantity
          })),
          ownerId: ownerId
        }),
      });

      if (response.ok) {
        // Show print preview
        setShowBillPreview(true);
      } else {
        alert('Failed to update database. Cannot print bill.');
      }
    } catch (error) {
      console.error('Error processing bill:', error);
      alert('Error processing bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Add print styles to head
    const printStyles = `
      <style>
        @media print {
          * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white;
            padding: 20px;
          }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
      </style>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
        <title>&nbsp;</title>  <!-- blank space title -->

          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .bill-header { text-align: center; margin-bottom: 20px; }
            .bill-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .bill-info { font-size: 14px; color: #666; margin-bottom: 5px; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .bill-table th, .bill-table td { 
              padding: 8px; 
              text-align: left; 
              border-bottom: 1px solid #ddd; 
            }
            .bill-table th { background-color: #f5f5f5; font-weight: bold; }
            .bill-total { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: right; 
              margin-top: 20px; 
              margin-right:20px;
              padding-top: 10px;
              border-top: 2px solid #333;
            }
            .bill-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="print-area">
            <div class="bill-header">
              <div class="bill-title">${shopName}</div>
               <div class="bill-title">${tagLine}</div>

            </div>
            
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${billItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.billQuantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.billQuantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="bill-total">
              TOTAL: ₹${totalPrice}
            </div>
            
            <div class="bill-footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      
      // Clear bill and refresh products after successful print
      fetchProducts(shopId);
      setBillItems([]);
      setShowBillPreview(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shop Billing System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex flex-col items-center justify-center text-gray-500">
                        <Package className="h-8 w-8 mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600">Price: ₹{product.price}</p>
                    <p className="text-gray-600">Available: {product.quantity}</p>
                    <button
                      onClick={() => addToBill(product)}
                      disabled={product.quantity === 0}
                      className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Bill
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bill Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Bill
            </h2>
            
            {billItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items in bill</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {billItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromBill(item.id)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 font-medium">{item.billQuantity}</span>
                        <button
                          onClick={() => addToBill(item)}
                          disabled={item.billQuantity >= item.quantity}
                          className="bg-green-500 text-white p-1 rounded hover:bg-green-600 disabled:bg-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total: ₹{totalPrice}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={updateDatabase}
                      disabled={loading}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Update Database
                    </button>
                    
                    <button
                      onClick={printBill}
                      disabled={loading || billItems.length === 0}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print Bill
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showBillPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Bill Preview</h3>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
      
              <button
                onClick={() => setShowBillPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              </div>
     
          
            
            <div className="p-6">
              <PrintableBill billItems={billItems} tagLine={tagLine} shopName={shopName} totalPrice={totalPrice} />
            </div>
            
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Bill
              </button>
              <button
                onClick={() => setShowBillPreview(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Printable Bill Component
const PrintableBill = ({ billItems,shopName, tagLine,  totalPrice }) => {
  return (
    <div className="bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{shopName}</h1>
        <h1 className="text-1xl font-medium mb-2">{tagLine}</h1>
        
      
      </div>
      
      <div className="border border-gray-300">
        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 font-semibold border-b">
          <span>Item</span>
          <span className="text-center">Qty</span>
          <span className="text-center">Price</span>
          <span className="text-center">Total</span>
        </div>
        
        {billItems.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200">
            <span className="font-medium">{item.name}</span>
            <span className="text-center">{item.billQuantity}</span>
            <span className="text-center">₹{item.price}</span>
            <span className="text-center">₹{item.price * item.billQuantity}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4 p-3 border-t-2 border-gray-800">
        <span className="text-xl font-bold">TOTAL: ₹{totalPrice}</span>
      </div>
      
      <div className="text-center mt-6 text-gray-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default BillingComponent;