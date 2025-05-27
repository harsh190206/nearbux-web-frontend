import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Clock, Coins, Edit2, Save, X, LogOut, Camera, Power } from 'lucide-react';
import { BACKEND_URL } from "../../config/constant";

const ShopInfoPage = () => {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingShop, setTogglingShop] = useState(false);

  useEffect(() => {
    // Check for authentication
    const shopId = localStorage.getItem('shopId');
    const ownerId = localStorage.getItem('ownerId');
    
    if (!shopId || !ownerId) {
      // Navigate to sign in - in real app this would be router navigation
      window.location.href = '/bsignin';
      return;
    }

    fetchShopData(shopId);
  }, []);

  const fetchShopData = async (shopId) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/shop/${shopId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shop data');
      }
      
      const data = await response.json();
      setShopData(data);
      setEditForm({
        name: data.name,
        tagline: data.tagline,
        pin: data.pin,
        localArea: data.localArea,
        coinValue: data.coinValue,
        opens: data.opens ? new Date(data.opens).toTimeString().slice(0, 5) : '',
        closes: data.closes ? new Date(data.closes).toTimeString().slice(0, 5) : ''
      });
    } catch (err) {
      setError('Failed to load shop information');
      console.error('Error fetching shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      name: shopData.name,
      tagline: shopData.tagline,
      pin: shopData.pin,
      localArea: shopData.localArea,
      coinValue: shopData.coinValue,
      opens: shopData.opens ? new Date(shopData.opens).toTimeString().slice(0, 5) : '',
      closes: shopData.closes ? new Date(shopData.closes).toTimeString().slice(0, 5) : ''
    });
    setError('');
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const updateData = {
        name: editForm.name,
        tagline: editForm.tagline,
        pin: editForm.pin,
        localArea: editForm.localArea,
        coinValue: parseInt(editForm.coinValue),
        opens: editForm.opens ? new Date(`1970-01-01T${editForm.opens}:00`) : null,
        closes: editForm.closes ? new Date(`1970-01-01T${editForm.closes}:00`) : null
      };

      const response = await fetch(`${BACKEND_URL}/shop/${shopData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update shop information');
      }

      const updatedData = await response.json();
      setShopData(updatedData);
      setEditing(false);
    } catch (err) {
      setError('Failed to save changes');
      console.error('Error updating shop data:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleShopStatus = async () => {
    try {
      setTogglingShop(true);
      setError('');

      const response = await fetch(`${BACKEND_URL}/shop/${shopData.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle shop status');
      }

      const updatedData = await response.json();
      setShopData(updatedData);
    } catch (err) {
      setError('Failed to toggle shop status');
      console.error('Error toggling shop status:', err);
    } finally {
      setTogglingShop(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shopId');
    localStorage.removeItem('ownerId');
    window.location.href = '/bsignin';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop information...</p>
        </div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load shop information</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shop Information</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Shop Status Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Shop Status:</span>
                <button
                  onClick={handleToggleShopStatus}
                  disabled={togglingShop}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                    ${shopData.isActive ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                >
                  <span className="sr-only">Toggle shop status</span>
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${shopData.isActive ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
                <span className={`text-sm font-medium ${shopData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {togglingShop ? 'Updating...' : (shopData.isActive ? 'Open' : 'Closed')}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto"
              >
                <LogOut size={18} />
                <span className="sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6">
            {error}
          </div>
        )}

        {/* Shop Status Alert */}
        {!shopData.isActive && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Power size={16} />
              <span className="font-medium">Your shop is currently closed.</span>
            </div>
            <p className="text-sm mt-1">
              Customers cannot place orders while your shop is closed. The shop will automatically reopen tomorrow, or you can manually open it using the toggle above.
            </p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
            {/* Profile Image */}
            <div className="relative self-center sm:self-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {shopData.image ? (
                  <img 
                    src={shopData.image} 
                    alt={shopData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                )}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${shopData.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                <Power size={10} className="text-white sm:w-3 sm:h-3" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{shopData.name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${shopData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {shopData.isActive ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{shopData.tagline}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                <span className="flex items-center justify-center sm:justify-start gap-1">
                  <User size={14} />
                  {shopData.owner?.name}
                </span>
                <span className="flex items-center justify-center sm:justify-start gap-1">
                  <Phone size={14} />
                  {shopData.owner?.phone}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Information Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Shop Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Shop Name */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 break-words">{shopData.name}</p>
              )}
            </div>

            {/* Owner Name (Read-only) */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 break-words">{shopData.owner?.name}</p>
            </div>

            {/* Phone (Read-only) */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <span className="break-all">{shopData.owner?.phone}</span>
              </p>
            </div>

            {/* Tagline */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 break-words">{shopData.tagline}</p>
              )}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span>{shopData.pin}</span>
                </p>
              )}
            </div>

            {/* Local Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Area
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.localArea}
                  onChange={(e) => handleInputChange('localArea', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 break-words">{shopData.localArea}</p>
              )}
            </div>

            {/* Opening Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              {editing ? (
                <input
                  type="time"
                  value={editForm.opens}
                  onChange={(e) => handleInputChange('opens', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="flex-shrink-0" />
                  <span>{shopData.opens ? new Date(shopData.opens).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not set'}</span>
                </p>
              )}
            </div>

            {/* Closing Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              {editing ? (
                <input
                  type="time"
                  value={editForm.closes}
                  onChange={(e) => handleInputChange('closes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="flex-shrink-0" />
                  <span>{shopData.closes ? new Date(shopData.closes).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not set'}</span>
                </p>
              )}
            </div>

            {/* Coin Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coin Value
              </label>
              {editing ? (
                <input
                  type="number"
                  value={editForm.coinValue}
                  onChange={(e) => handleInputChange('coinValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                  <Coins size={16} className="flex-shrink-0" />
                  <span>{shopData.coinValue}</span>
                </p>
              )}
            </div>

            {/* Shop Rating (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Rating
              </label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                {shopData.rating}/5 ⭐
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopInfoPage;