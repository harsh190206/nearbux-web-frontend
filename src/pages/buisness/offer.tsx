import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Gift, Percent, DollarSign, Package, X, Coins, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../../config/constant';
import axios from 'axios';
import { useNavigate } from 'react-router';

const OfferManagement = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'product',
    title: '',
    description: '',
    minimum_amount: '',
    product: '',
    percentage: '',
    fixed: '',
    coinValue: ''
  });

  useEffect(() => {
    async function ankush() {
      const ownerId = localStorage.getItem("ownerId");
      const validateByADmin = await axios.post(`${BACKEND_URL}/shop/isverified`, { ownerId });
      if (validateByADmin.data.message) {
        
      } else {
        navigate('/bsignin');
      }
    }
    ankush();
  }, []);

  // Get shop data from localStorage
  const shopId = localStorage.getItem('shopId');
  const ownerId = localStorage.getItem('ownerId');

  // Fetch offers on component mount
  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/offers`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Enhanced input validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Title is required';
        } else if (value.trim().length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else if (value.trim().length > 100) {
          newErrors.title = 'Title must be less than 100 characters';
        } else {
          delete newErrors.title;
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else if (value.trim().length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else if (value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'minimum_amount':
        if (!value) {
          newErrors.minimum_amount = 'Minimum amount is required';
        } else if (isNaN(value) || parseFloat(value) < 300) {
          newErrors.minimum_amount = 'Minimum amount must be at least ₹300';
        } else if (parseFloat(value) > 100000) {
          newErrors.minimum_amount = 'Minimum amount cannot exceed ₹100,000';
        } else {
          delete newErrors.minimum_amount;
        }
        break;
        
      case 'product':
        if (formData.type === 'product' && !value) {
          newErrors.product = 'Product selection is required for product offers';
        } else {
          delete newErrors.product;
        }
        break;
        
      case 'percentage':
        if (formData.type === 'percentage') {
          if (!value) {
            newErrors.percentage = 'Percentage is required';
          } else if (isNaN(value) || parseFloat(value) <= 0 || parseFloat(value) > 100) {
            newErrors.percentage = 'Percentage must be between 1 and 100';
          } else if (!Number.isInteger(parseFloat(value))) {
            newErrors.percentage = 'Percentage must be a whole number';
          } else {
            delete newErrors.percentage;
          }
        } else {
          delete newErrors.percentage;
        }
        break;
        
      case 'fixed':
        if (formData.type === 'money') {
          if (!value) {
            newErrors.fixed = 'Fixed amount is required';
          } else if (isNaN(value) || parseFloat(value) <= 0) {
            newErrors.fixed = 'Fixed amount must be greater than 0';
          } else if (parseFloat(value) > 10000) {
            newErrors.fixed = 'Fixed amount cannot exceed ₹10,000';
          } else {
            delete newErrors.fixed;
          }
        } else {
          delete newErrors.fixed;
        }
        break;
        
      case 'coinValue':
        if (formData.type === 'product') {
          if (value === '') {
            newErrors.coinValue = 'Coin value is required for product offers';
          } else if (isNaN(value) || parseInt(value) < 0) {
            newErrors.coinValue = 'Coin value must be 0 or greater';
          } else if (parseInt(value) > 1000) {
            newErrors.coinValue = 'Coin value cannot exceed 1000';
          } else if (!Number.isInteger(parseFloat(value))) {
            newErrors.coinValue = 'Coin value must be a whole number';
          } else {
            delete newErrors.coinValue;
          }
        } else {
          delete newErrors.coinValue;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent negative values for numeric fields (except coinValue which can be 0)
    if (['minimum_amount', 'percentage', 'fixed'].includes(name)) {
      if (value < 0) return;
    }
    
    // Allow 0 for coinValue but prevent negative values
    if (name === 'coinValue' && value < 0) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change
    validateField(name, value);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    // Validate minimum amount - must be at least 300
    if (!formData.minimum_amount) {
      newErrors.minimum_amount = 'Minimum amount is required';
    } else if (isNaN(formData.minimum_amount) || parseFloat(formData.minimum_amount) < 300) {
      newErrors.minimum_amount = 'Minimum amount must be at least ₹300';
    }
    
    // Type-specific validation
    if (formData.type === 'product') {
      if (!formData.product) {
        newErrors.product = 'Product selection is required';
      }
      if (formData.coinValue === '') {
        newErrors.coinValue = 'Coin value is required';
      } else if (isNaN(formData.coinValue) || parseInt(formData.coinValue) < 0) {
        newErrors.coinValue = 'Coin value must be 0 or greater';
      }
    } else if (formData.type === 'percentage') {
      if (!formData.percentage) {
        newErrors.percentage = 'Percentage is required';
      } else if (isNaN(formData.percentage) || parseFloat(formData.percentage) <= 0 || parseFloat(formData.percentage) > 100) {
        newErrors.percentage = 'Percentage must be between 1 and 100';
      }
    } else if (formData.type === 'money') {
      if (!formData.fixed) {
        newErrors.fixed = 'Fixed amount is required';
      } else if (isNaN(formData.fixed) || parseFloat(formData.fixed) <= 0) {
        newErrors.fixed = 'Fixed amount must be greater than 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const offerData = {
        ...formData,
        shop: parseInt(shopId),
        minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : null,
        product: formData.product ? parseInt(formData.product) : null,
        percentage: formData.percentage ? parseInt(formData.percentage) : null,
        fixed: formData.fixed ? parseFloat(formData.fixed) : null,
        coinValue: formData.coinValue !== '' ? parseInt(formData.coinValue) : null
      };

      const url = editingOffer 
        ? `${BACKEND_URL}/shop/${shopId}/offers/${editingOffer.id}`
        : `${BACKEND_URL}/shop/${shopId}/offers`;
      
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        await fetchOffers();
        resetForm();
        setShowCreateForm(false);
        setEditingOffer(null);
      } else {
        // Handle API errors
        const errorData = await response.json();
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      type: offer.type,
      title: offer.title || '',
      description: offer.description || '',
      minimum_amount: offer.minimum_amount || '',
      product: offer.product || '',
      percentage: offer.percentage || '',
      fixed: offer.fixed || '',
      coinValue: offer.coinValue !== null ? offer.coinValue : ''
    });
    setErrors({});
    setShowCreateForm(true);
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/shop/${shopId}/offers/${offerId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchOffers();
        }
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'product',
      title: '',
      description: '',
      minimum_amount: '',
      product: '',
      percentage: '',
      fixed: '',
      coinValue: ''
    });
    setErrors({});
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingOffer(null);
    resetForm();
  };

  const getOfferIcon = (type) => {
    switch (type) {
      case 'product': return <Package className="w-5 h-5" />;
      case 'percentage': return <Percent className="w-5 h-5" />;
      case 'money': return <DollarSign className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getOfferTypeColor = (type) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'percentage': return 'bg-green-100 text-green-800';
      case 'money': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductDetails = (productId) => {
    return products.find(p => p.id === productId);
  };

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      {message}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Offer Management</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Create Offer
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-4 sm:my-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    >
                      <option value="product">Product Offer</option>
                      <option value="percentage">Percentage Discount</option>
                      <option value="money">Fixed Amount Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Weekend Special - 15% Off Fresh Pastries"
                      required
                      maxLength={100}
                    />
                    {errors.title && <ErrorMessage message={errors.title} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enjoy 15% off all fresh pastries this weekend only! Valid Friday through Sunday."
                      required
                      maxLength={500}
                    />
                    {errors.description && <ErrorMessage message={errors.description} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Purchase Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minimum_amount"
                      value={formData.minimum_amount}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.minimum_amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="300"
                      min="300"
                      max="100000"
                      step="0.01"
                      required
                    />
                    {errors.minimum_amount && <ErrorMessage message={errors.minimum_amount} />}
                  </div>

                  {formData.type === 'product' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Free Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="product"
                          value={formData.product}
                          onChange={handleInputChange}
                          className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                            errors.product ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ₹{product.price}
                            </option>
                          ))}
                        </select>
                        {errors.product && <ErrorMessage message={errors.product} />}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coin Value Required <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="coinValue"
                          value={formData.coinValue}
                          onChange={handleInputChange}
                          onWheel={(e) => e.target.blur()}
                          className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                            errors.coinValue ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0"
                          min="0"
                          max="1000"
                          required
                        />
                        {errors.coinValue && <ErrorMessage message={errors.coinValue} />}
                        <p className="text-xs text-gray-500 mt-1">
                          Number of coins required to claim this product offer (can be 0)
                        </p>
                      </div>
                    </>
                  )}

                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Percentage (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="percentage"
                        value={formData.percentage}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                          errors.percentage ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="15"
                        min="1"
                        max="100"
                        required
                      />
                      {errors.percentage && <ErrorMessage message={errors.percentage} />}
                    </div>
                  )}

                  {formData.type === 'money' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fixed Discount Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="fixed"
                        value={formData.fixed}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        className={`w-full p-2.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                          errors.fixed ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="100"
                        min="1"
                        max="10000"
                        step="0.01"
                        required
                      />
                      {errors.fixed && <ErrorMessage message={errors.fixed} />}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || Object.keys(errors).length > 0}
                      className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 bg-gray-300 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-400 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ongoing Offers */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ongoing Offers</h2>
            
            {offers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base px-4">No offers created yet. Create your first offer to attract customers!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const productDetails = offer.type === 'product' && offer.product ? getProductDetails(offer.product) : null;
                  
                  return (
                    <div
                      key={offer.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getOfferTypeColor(offer.type)} flex-shrink-0`}>
                            {getOfferIcon(offer.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                              {offer.title}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2 break-words">
                              {offer.description}
                            </p>
                            
                            {/* Product Details for Product Offers */}
                            {offer.type === 'product' && productDetails && (
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 p-2 bg-gray-50 rounded-md">
                                {productDetails.image && (
                                  <img 
                                    src={productDetails.image} 
                                    alt={productDetails.name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                    {productDetails.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ₹{productDetails.price}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                              {offer.minimum_amount && (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <DollarSign className="w-3 h-3" />
                                  Min: ₹{offer.minimum_amount}
                                </span>
                              )}
                              {offer.percentage && (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Percent className="w-3 h-3" />
                                  {offer.percentage}% off
                                </span>
                              )}
                              {offer.fixed && (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <DollarSign className="w-3 h-3" />
                                  ₹{offer.fixed} off
                                </span>
                              )}
                              {offer.coinValue !== null && offer.coinValue !== undefined && (
                                <span className="flex items-center gap-1 text-orange-600 whitespace-nowrap">
                                  <Coins className="w-3 h-3" />
                                  {offer.coinValue} coins
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2 justify-end sm:justify-start flex-shrink-0">
                          <button
                            onClick={() => handleEdit(offer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferManagement;