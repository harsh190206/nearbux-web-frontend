import  { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, Printer, Database, X, Package, User, UserPlus } from 'lucide-react';
import { BACKEND_URL } from "../../config/constant";
import { useRef } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router';
const BillingComponent = () => {
  const navigate = useNavigate();
  const  updatedCoin = useRef(null);
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [offer  , setOffer]  = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [shopName , setshopName] = useState("shop");
  const [tagLine , setTagline] = useState("");
  const[message , setMessage] = useState("");
  const[enoughCoins, setenoughCoins] = useState(0);
  const [appliedOffer , setApplied] = useState(); // stores the final offer to be applied 
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const closeBillPreview = () => {
  setShowBillPreview(false);
  // Clean up any temporary data
  delete window.finalBillItemsForPrint;
};
  // Add this useEffect to handle coin checking
useEffect(() => {
  async function checkCoin() {
    //@ts-ignore
    if (appliedOffer?.type === "product" && customerInfo.phone.length === 10) {
      try {
        const response = await axios.get(`${BACKEND_URL}/shop/${customerInfo.phone}/coins`);
        const par = response.data.message;
        //@ts-ignore
        if (par > appliedOffer.coinValue) {
          setenoughCoins(1);
          //@ts-ignore
          const updatedCoins = par - appliedOffer.coinValue;
          updatedCoin.current = updatedCoins;
        } else {
          setenoughCoins(0);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
//@ts-ignore
  if (appliedOffer?.type === "product" && customerInfo.phone.length === 10) {
    checkCoin();
  }
}, [appliedOffer, customerInfo.phone]); // Only run when these change
  useEffect(()=>{

  // Calculate total price
  const totalPrice = billItems.reduce((total, item) => total + (item.price * item.billQuantity), 0);
   let eligible =[];
   let n = offer.length;
   for(let  i =0; i<n; i++){
    if(totalPrice >= offer[i].minimum_amount ){
      eligible.push(offer[i]);


    }
   }
   n = eligible.length;
   let minimum = -1;
   let temp;
   for(let i = 0; i<n; i++){
    if(minimum <= eligible[i].minimum_amount){
      minimum = eligible[i].minimum_amount
      temp = eligible[i];
    }
   }
   setApplied(temp) ;
  },[billItems,offer])
// check localstorage and navigate;
  useEffect(()=>{
    async function ankush (){
      const ownerId  = localStorage.getItem("ownerId");
     const validateByADmin = await axios.post(`${BACKEND_URL}/shop/isverified`,{ownerId });
              if(validateByADmin.data.message){
                console.log("valid");
              }
              else{ 
                console.log("false");
                
                  navigate('/bsignin');
  
              }
            }
            ankush();
  
  
  },[]);
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

  //  fetch shop name and tagline from API

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
 // fetcch products
  const fetchProducts = async (shopId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        
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

const handleCustomerInfoChange = (field, value) => {
  setCustomerInfo(prev => ({
    ...prev,
    [field]: value
  }));

  // Only call backend when phone field has exactly 10 digits and is different from previous
  if (field === "phone" && value.length === 10 && value !== customerInfo.phone) {
    callbackend(value);
  }
};
  // check for useispresent and then  for offers 
 // Add this ref at the top with other useRef declarations
const debounceTimer = useRef(null);

// Replace your callbackend function with this debounced version
async function callbackend(phone) {
  if (!phone || phone.length !== 10) {
    return;
  }

  // Clear previous timer
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }

  // Set new timer
  debounceTimer.current = setTimeout(async () => {
    let isphonePrsent = 0;
    try {
      const response = await axios.get(`${BACKEND_URL}/shop/${phone}/present`);
      if (response.data.message == 1) {
        isphonePrsent = 1;
      } else {
        setMessage("number not registered on nearbux.com");
      }
    } catch (e) {
      console.error("error occured while getting nearbux user phone status");
    }

    if (isphonePrsent == 1) {
      const shopId = localStorage.getItem("shopId");
      try {
        const response = await axios.get(`${BACKEND_URL}/shop/${shopId}/offers`);
        console.log(response);
        let offers = response.data;
        if (!Array.isArray(offers)) {
          console.error("Expected 'message' to be an array of offers, got:", offers);
          return;
        }
        setOffer(offers);
      } catch (e) {
        console.error("error while getting offers" + e);
      }
    }
  }, 500); // 500ms delay
}
  // Clear customer info
  const clearCustomerInfo = () => {
    setCustomerInfo({
      name: '',
      phone: '',
      address: ''
    });
  };


  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToBill = (product) => {
  // Prevent adding items marked as free
  if (product.isFreeItem) {
    return;
  }
  
  const existingItem = billItems.find(item => item.id === product.id);
  
  if (existingItem) {
    // Don't increase quantity if it's a free item
    if (existingItem.isFreeItem) {
      return;
    }
    
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
  
  // Don't allow removal of free items through normal bill operations
  if (existingItem && existingItem.isFreeItem) {
    return;
  }
  
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

// Calculate final price after offer
let finalPrice = totalPrice;
if (appliedOffer) {
  // @ts-ignore
  if (appliedOffer.type === "money") {
    // @ts-ignore
    finalPrice = totalPrice - (appliedOffer.fixed || 0);
  }
// @ts-ignore
  if(appliedOffer?.type =="percentage"){
    //@ts-ignore
    let temp =( totalPrice * appliedOffer.percentage)/100;
    finalPrice = totalPrice - temp;

  }
// if we have to remove huhu
  //@ts-ignore   

//   //@ts-ignore
// if(appliedOffer.type =="product" && customerInfo.phone.length == 10){
//   async function checkCoin (){
//     try {
//     const response =  await axios.get(`${BACKEND_URL}/shop/${customerInfo.phone}/coins`);
//     const par = response.data.message;
//     //@ts-ignore
//     if(par>appliedOffer.coinValue){
//       setenoughCoins(1);
//       //@ts-ignore
//       const updatedCoins = par - appliedOffer.coinValue
//       updatedCoin.current = updatedCoins;

// //@ts-ignore
    


//     }
    
//   }catch(e){
//     console.error(e);
//   }

//   }
//   checkCoin();
  

// }

}

async function updateDatabase() {
  // Validate mandatory fields first
  if (!customerInfo.name.trim() || !customerInfo.phone.trim() || customerInfo.phone.length !== 10) {
    alert('Please fill in customer name and phone number (10 digits)');
    return;
  }

  if (billItems.length === 0) {
    alert('No items in bill to update');
    return;
  }

  let updatedBillItems = [...billItems];

  // Apply offer if conditions are met
  
  //@ts-ignore
  if (enoughCoins === 1 && appliedOffer?.type === "product" && appliedOffer.products) {
  
  //@ts-ignore
    const productId = appliedOffer.products.id;
    const existingItemIndex = updatedBillItems.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
      updatedBillItems[existingItemIndex] = {
        ...updatedBillItems[existingItemIndex],
        billQuantity: updatedBillItems[existingItemIndex].billQuantity + 1
      };
    } else {
      updatedBillItems.push({

  //@ts-ignore
        ...appliedOffer.products,
        billQuantity: 1,

  //@ts-ignore
        price: appliedOffer.products.price,

  //@ts-ignore
        id: appliedOffer.products.id,

  //@ts-ignore
        name: appliedOffer.products.name
      });
    }
    
    setBillItems(updatedBillItems);
  }

  setLoading(true);
  
  try {
    const response = await fetch(`${BACKEND_URL}/shop/${shopId}/update-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: updatedBillItems.map(item => ({
          productId: item.id,
          quantity: item.billQuantity
        })),
        ownerId: ownerId
      }),
    });

    if (response.ok) {
      // Only update coins if there's a valid phone and coin value
      if (customerInfo.phone.length === 10 && updatedCoin.current !== null) {
        try {
          const resp = await axios.post(`${BACKEND_URL}/shop/updatecoinss`, {
            phone: customerInfo.phone,
            updatedCoin: updatedCoin.current
          });
          console.log(resp);
        } catch (e) {
          console.log(e);
        }
      }

      alert('Database updated successfully!');
      
      // Efficiently update products in state by deducting sold quantities
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const soldItem = updatedBillItems.find(item => item.id === product.id);
          if (soldItem) {
            return {
              ...product,
              quantity: Math.max(0, product.quantity - soldItem.billQuantity) // Ensure quantity doesn't go negative
            };
          }
          return product;
        })
      );
      
      // Reset all states
      setBillItems([]);
      clearCustomerInfo();
      setOffer([]);
      setenoughCoins(0);
      setMessage("");
      updatedCoin.current = null;
      setApplied(undefined);
      
    } else {
      alert('Failed to update database');
    }
  } catch (error) {
    console.error('Error updating database:', error);
    alert('Error updating database');
  } finally {
    setLoading(false);
  }
}
const printBill = async () => {
  // Validate mandatory fields
  if (!customerInfo.name.trim() || !customerInfo.phone.trim() || customerInfo.phone.length !== 10) {
    alert('Please fill in customer name and phone number (10 digits)');
    return;
  }

  if (billItems.length === 0) {
    alert('No items in bill to print');
    return;
  }

  setLoading(true);
  try {
    // Create final bill items without modifying state yet
    let finalBillItems = [...billItems];

    // Apply offer product if conditions are met - but don't add to state yet
    let freeProductAdded = false;
    //@ts-ignore
    if (enoughCoins === 1 && appliedOffer?.type === "product" && appliedOffer.products) {
      //@ts-ignore
      const productId = appliedOffer.products.id;
      const existingItemIndex = finalBillItems.findIndex(item => item.id === productId);
      
      if (existingItemIndex !== -1) {
        finalBillItems[existingItemIndex] = {
          ...finalBillItems[existingItemIndex],
          billQuantity: finalBillItems[existingItemIndex].billQuantity + 1
        };
      } else {
        finalBillItems.push({
          //@ts-ignore
          ...appliedOffer.products,
          billQuantity: 1,
          //@ts-ignore
          price: appliedOffer.products.price,
          //@ts-ignore
          id: appliedOffer.products.id,
          //@ts-ignore
          name: appliedOffer.products.name,
          isFreeItem: true // Mark as free item
        });
      }
      freeProductAdded = true;
    }

    // Update database first
    const response = await fetch(`${BACKEND_URL}/shop/${shopId}/update-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: finalBillItems.map(item => ({
          productId: item.id,
          quantity: item.billQuantity
        })),
        ownerId: ownerId
      }),
    });

    if (response.ok) {
      // Update coins if applicable
      if (customerInfo.phone.length === 10 && updatedCoin.current !== null) {
        try {
          await axios.post(`${BACKEND_URL}/shop/updatecoinss`, {
            phone: customerInfo.phone,
            updatedCoin: updatedCoin.current
          });
        } catch (e) {
          console.log(e);
        }
      }

      // Efficiently update products in state
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const soldItem = finalBillItems.find(item => item.id === product.id);
          if (soldItem) {
            return {
              ...product,
              quantity: Math.max(0, product.quantity - soldItem.billQuantity)
            };
          }
          return product;
        })
      );

      // Store the final bill items for printing (including free items)
      window.finalBillItemsForPrint = finalBillItems;
      
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

// 2. Modified handlePrint function
const handlePrint = () => {
  // Use the stored final bill items for printing
  const finalBillItems = window.finalBillItemsForPrint || billItems;
  
  // Calculate totals for print
  const printTotalPrice = billItems.reduce((total, item) => total + (item.price * item.billQuantity), 0);
  let printFinalPrice = printTotalPrice;
  
  if (appliedOffer) {
    // @ts-ignore
    if (appliedOffer.type === "money") {
      // @ts-ignore
      printFinalPrice = printTotalPrice - (appliedOffer.fixed || 0);
    }
    // @ts-ignore
    if(appliedOffer?.type =="percentage"){
      //@ts-ignore
      let temp =( printTotalPrice * appliedOffer.percentage)/100;
      printFinalPrice = printTotalPrice - temp;
    }
  }
  
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
          .customer-info { margin-bottom: 20px; font-size: 14px; }
          .customer-info p { margin: 5px 0; }
          .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .bill-table th, .bill-table td { 
            padding: 8px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
          }
          .bill-table th { background-color: #f5f5f5; font-weight: bold; }
          .free-item { color: #28a745; font-style: italic; }
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
          
          ${customerInfo.name || customerInfo.phone || customerInfo.address ? `
            <div class="customer-info">
              <h3 style="margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Information</h3>
              ${customerInfo.name ? `<p><strong>Name:</strong> ${customerInfo.name}</p>` : ''}
              ${customerInfo.phone ? `<p><strong>Phone:</strong> ${customerInfo.phone}</p>` : ''}
              ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}</p>` : ''}
            </div>
          ` : ''}
          
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
              ${finalBillItems.map(item => `
                <tr ${item.isFreeItem ? 'class="free-item"' : ''}>
                  <td>${item.name}${item.isFreeItem ? ' (FREE)' : ''}</td>
                  <td>${item.billQuantity}</td>
                  <td>₹${item.isFreeItem ? '0' : item.price}</td>
                  <td>₹${item.isFreeItem ? '0' : (item.price * item.billQuantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
        <div class="bill-total">
TOTAL: ₹${printTotalPrice}
${printFinalPrice !== printTotalPrice ? `<div class="text-lg font-semibold">Final: ₹${printFinalPrice}</div>` : ''}
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
    
    // Clear bill and reset all states after successful print
    setBillItems([]);
    clearCustomerInfo();
    setOffer([]);
    setenoughCoins(0);
    setMessage("");
    updatedCoin.current = null;
    setApplied(undefined);
    setShowBillPreview(false);
    
    // Clean up the stored print data
    delete window.finalBillItemsForPrint;
  }, 500);
};
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shop Billing System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Information Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name *"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                required
              />
              
              <input
              type="tel"   
                placeholder="Phone *"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={customerInfo.phone}
                 maxLength={10}
                //  type = "number"
                 pattern="[0-9]*" 
 onKeyDown={(e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it's a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
     }}                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                required
              />
              
              <input
                type="text"
                placeholder="Address (Optional)"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={customerInfo.address}
                onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 mt-3">
              {/* <button
                onClick={saveCustomerDetails}
                disabled={loading || !customerInfo.name.trim() || !customerInfo.phone.trim() || customerInfo.phone.length !=10}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                check for offer 
              </button>
               */}
              {(customerInfo.name || customerInfo.phone || customerInfo.address) && (
                <button
                  onClick={clearCustomerInfo}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

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
                    {finalPrice !== totalPrice && (
                      <span className="text-lg font-semibold">Final: ₹{finalPrice}</span>
                    )}
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
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
                <button
                  onClick={() => setShowBillPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PrintableBill 
                billItems={billItems} 
                tagLine={tagLine} 
                shopName={shopName} 
                totalPrice={totalPrice}
                finalPrice = {finalPrice}
                customerInfo={customerInfo}
              />
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

const PrintableBill = ({ billItems, finalPrice, shopName, tagLine, totalPrice, customerInfo }) => {
  const hasCustomerInfo = customerInfo.name || customerInfo.phone || customerInfo.address;
  
  // Use stored final bill items if available, otherwise use current billItems
  const itemsToDisplay = window.finalBillItemsForPrint || billItems;
  
  // Calculate display totals (excluding free items from total)
  const displayTotal = billItems.reduce((total, item) => total + (item.price * item.billQuantity), 0);
  
  return (
    <div className="bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{shopName}</h1>
        <h1 className="text-1xl font-medium mb-2">{tagLine}</h1>
      </div>
      
      {hasCustomerInfo && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg mb-3 border-b border-gray-300 pb-2">Customer Information</h3>
          <div className="space-y-2">
            {customerInfo.name && (
              <p className="text-sm"><span className="font-medium">Name:</span> {customerInfo.name}</p>
            )}
            {customerInfo.phone && (
              <p className="text-sm"><span className="font-medium">Phone:</span> {customerInfo.phone}</p>
            )}
            {customerInfo.address && (
              <p className="text-sm"><span className="font-medium">Address:</span> {customerInfo.address}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="border border-gray-300">
        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 font-semibold border-b">
          <span>Item</span>
          <span className="text-center">Qty</span>
          <span className="text-center">Price</span>
          <span className="text-center">Total</span>
        </div>
        
        {itemsToDisplay.map((item, index) => (
          <div key={index} className={`grid grid-cols-4 gap-4 p-3 border-b border-gray-200 ${item.isFreeItem ? 'bg-green-50 text-green-700' : ''}`}>
            <span className="font-medium">
              {item.name}
              {item.isFreeItem && <span className="text-xs ml-1 font-normal">(FREE)</span>}
            </span>
            <span className="text-center">{item.billQuantity}</span>
            <span className="text-center">₹{item.isFreeItem ? '0' : item.price}</span>
            <span className="text-center">₹{item.isFreeItem ? '0' : (item.price * item.billQuantity)}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4 p-3 border-t-2 border-gray-800">
        <span className="text-lg font-semibold">TOTAL: ₹{displayTotal}</span>
         {finalPrice !== displayTotal && (
           <span className="text-xl pl-3 font-bold">Final: ₹{finalPrice}</span>
         )}
      </div>
      
      <div className="text-center mt-6 text-gray-600">
        <br />
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default BillingComponent;