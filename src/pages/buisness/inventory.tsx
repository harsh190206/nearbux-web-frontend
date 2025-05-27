import { useState, useEffect } from 'react';
import { Search ,Edit2, Trash2, Plus, Upload, Save, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from "../../config/constant";

// UploadComponent from your existing code
function UploadComponent({ 
  skipUrl, 
  successRedirectDelay = 200000000,
  adverId,
  shopId, 
  productId, 
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Handle redirect countdown after successful upload
  useEffect(() => {
    let timer;
    let countdownTimer;
    
    if (uploadComplete && !error) {
      // Set initial countdown
      setRedirectCountdown(Math.ceil(successRedirectDelay / 1000));
      
      // Update countdown every second
      countdownTimer = setInterval(() => {
        setRedirectCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      
      // Set timeout for redirect
      timer = setTimeout(() => {
        if(skipUrl){
          window.location.href = skipUrl;
        }
      }, successRedirectDelay);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [uploadComplete, error, skipUrl, successRedirectDelay]);

  const handleChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    if(productId){
     formData.append('productId', productId);
    }
    if(shopId){
      formData.append('shopId', shopId); 
    }
    if(adverId){
      formData.append("adverId", adverId);
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server error occurred');
      }
      
      const data = await res.json();
      console.log('Uploaded URL:', data.imageUrl);
      setUploadComplete(true);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      setUploadComplete(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    if(skipUrl){
      window.location.href = skipUrl;
    }
  };
  
  const handleTryAgain = () => {
    setError(null);
    setFile(null);
  };
   

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Upload Image</h2>
        
        {error ? (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleTryAgain}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition duration-200"
            >
              Try Again
            </button>
          </div>
        ) : uploadComplete ? (
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-green-700 mb-2">Upload Successful!</h3>
            <p className="text-gray-600">
              {redirectCountdown !== null ? (
                <>Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...</>
              ) : 'Upload complete.'}
            </p>
            <button 
              onClick={handleSkip} 
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition duration-200"
            >
              Continue Now
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-blue-200"
            } ${file ? "bg-blue-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <p className="text-blue-700 font-medium">Drag and drop image here</p>
                <p className="text-blue-400 text-sm">- or -</p>
                <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition duration-200">
                  Browse Files
                  <input 
                    type="file" 
                    onChange={handleChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <p className="text-blue-700 font-medium">{file.name}</p>
                <p className="text-blue-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button 
                  onClick={() => setFile(null)}
                  className="text-blue-500 hover:text-blue-700 underline text-sm transition duration-200"
                >
                  Change file
                </button>
              </div>
            )}
          </div>
        )}
        
        {!uploadComplete && !error && (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-6 py-2 border border-blue-500 text-blue-500 rounded font-medium hover:bg-blue-50 transition duration-200 flex-1"
            >
              Skip
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`px-6 py-2 rounded font-medium transition duration-200 flex-1 relative ${
                !file 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const navigate = (path) => {
    window.location.href = path;
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [showUploadComponent, setShowUploadComponent] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({ price: '', quantity: '' });
  const [addForm, setAddForm] = useState({ name: '', price: '', quantity: '' });
  const [bulkProducts, setBulkProducts] = useState([
    { name: '', price: '', quantity: '' }
  ]);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Get shopId from URL params or context - for demo using static value
  const shopId = localStorage.getItem("shopId");
  
  if(!shopId){
    return <div onClick={()=>navigate("/bsignin")} className='h-screen flex items-center justify-center px-4'>
      <div className='bg-blue-500 rounded-xl p-4 text-center'>
        <p className="text-white">Sign in again</p>
      </div>
    </div>
  }

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/shop/products/${shopId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditForm({ price: product.price.toString(), quantity: product.quantity.toString() });
  };

  const handleSaveEdit = async (productId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/shop/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseInt(editForm.price),
          quantity: parseInt(editForm.quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      const updatedProduct = await response.json();
      
      // Update local state
      setProducts(products.map(p => 
        p.id === productId ? updatedProduct.product : p
      ));
      
      setEditingProduct(null);
      setEditForm({ price: '', quantity: '' });
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
    }
  };
  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      // Get ownerId from localStorage (you'll need to store this when user logs in)
      const ownerId = localStorage.getItem("ownerId"); // or however you store the owner ID
      
      if (!ownerId) {
        setError('Owner ID not found. Please log in again.');
        return;
      }
  
      const response = await fetch(`${BACKEND_URL}/shop/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ownerId: parseInt(ownerId)
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
    }
  };
  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.price || !addForm.quantity) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/shop/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          price: parseInt(addForm.price),
          quantity: parseInt(addForm.quantity),
          shopId: shopId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }
      
      const newProduct = await response.json();
      setProducts([...products, newProduct.product]);
      setShowAddForm(false);
      setAddForm({ name: '', price: '', quantity: '' });
      
      // Show upload component for the newly created product
      setShowUploadComponent(newProduct.product.id);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message);
    }
  };

  // Bulk add functions
  const addBulkProductRow = () => {
    setBulkProducts([...bulkProducts, { name: '', price: '', quantity: '' }]);
  };

  const removeBulkProductRow = (index) => {
    if (bulkProducts.length > 1) {
      setBulkProducts(bulkProducts.filter((_, i) => i !== index));
    }
  };

  const updateBulkProduct = (index, field, value) => {
    const updated = bulkProducts.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setBulkProducts(updated);
  };

  const handleBulkAddProducts = async () => {
    // Validate all products
    const validProducts = bulkProducts.filter(product => 
      product.name.trim() && product.price && product.quantity
    );

    if (validProducts.length === 0) {
      alert('Please fill at least one complete product');
      return;
    }

    if (validProducts.length !== bulkProducts.length) {
      if (!confirm('Some products have missing fields and will be skipped. Continue?')) {
        return;
      }
    }

    setBulkLoading(true);
    try {
      const productsToAdd = validProducts.map(product => ({
        name: product.name.trim(),
        price: parseInt(product.price),
        quantity: parseInt(product.quantity),
        shopId: shopId
      }));

      const response = await fetch(`${BACKEND_URL}/shop/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToAdd })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add products');
      }
      
      const result = await response.json();
      
      // Add new products to the state
      setProducts([...products, ...result.products]);
      
      // Reset form
      setShowBulkAddForm(false);
      setBulkProducts([{ name: '', price: '', quantity: '' }]);
      
      alert(`Successfully added ${result.products.length} products!`);
      setError(null);
    } catch (err) {
      console.error('Error bulk adding products:', err);
      setError(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  };

  if (showUploadComponent) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => {
                setShowUploadComponent(null);
                fetchProducts(); // Refresh products after upload
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <X className="w-4 h-4 mr-2" />
              Back to Inventory
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Product Image</h1>
          </div>
          
          <UploadComponent 
            productId={showUploadComponent}
            shopId={shopId}
            skipUrl="/inventory"
            successRedirectDelay={3000}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your products, prices, and quantities</p>
          </div>
          
          {/* Mobile-first button layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setShowBulkAddForm(true)}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Add Products
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Product</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm({ name: '', price: '', quantity: '' });
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAddProduct}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        )}

        {/* Bulk Add Products Form */}
        {showBulkAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Bulk Add Products</h2>
              <button
                onClick={() => {
                  setShowBulkAddForm(false);
                  setBulkProducts([{ name: '', price: '', quantity: '' }]);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
              {bulkProducts.map((product, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateBulkProduct(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateBulkProduct(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateBulkProduct(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeBulkProductRow(index)}
                        className="w-full bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-200 flex items-center justify-center"
                        disabled={bulkProducts.length === 1}
                      >
                        <X className="w-4 h-4" />
                        <span className="ml-1 sm:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={addBulkProductRow}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </button>
              <button
                onClick={handleBulkAddProducts}
                disabled={bulkLoading}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {bulkLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {bulkLoading ? 'Adding...' : 'Add All Products'}
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Product Image */}
              <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Package className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs sm:text-sm">No image</p>
                    <button
                      onClick={() => setShowUploadComponent(product.id)}
                      className="text-blue-500 hover:text-blue-700 text-xs underline mt-1"
                    >
                      Upload Image
                    </button>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                
                {editingProduct === product.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleSaveEdit(product.id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center text-sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setEditForm({ price: '', quantity: '' });
                        }}
                        className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition duration-200 flex items-center justify-center text-sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-green-600">₹{product.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className={`font-semibold ${product.quantity < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                        {product.quantity}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center text-sm"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <Package className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Start by adding your first product to the inventory</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => setShowBulkAddForm(true)}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-green-700 transition duration-200 inline-flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Add Products
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Single Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}