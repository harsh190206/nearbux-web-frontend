import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Home, LogOut, Edit3, Coins } from 'lucide-react';
import { BACKEND_URL } from '../config/constant';
interface UserData {
  id: number;
  name: string;
  username: string;
  phone: string;
  pin?: string;
  localArea?: string;
  coinsAvailable?: number;
  createdAt: string;
}

const UserProfilePage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    pin: '',
    localArea: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
     //   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const userId = localStorage.getItem('userId'); // Get userId from localStorage
        
        if (!userId) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/user/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        const result = await response.json();
        
        if (result.success) {
          setUserData(result.data);
          setEditForm({
            name: result.data.name,
            pin: result.data.pin || '',
            localArea: result.data.localArea || ''
          });
        } else {
          setError(result.message || 'Failed to fetch user data');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('pincode');
     localStorage.removeItem('area');

    localStorage.removeItem('userId');
    // Redirect to login page
    window.location.href = '/signin';
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
  //    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${BACKEND_URL}/user/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...editForm
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        setIsEditModalOpen(false);
        // You can add a toast notification here
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                My Profile
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Manage your account information
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Profile Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                    {userData.name}
                  </h2>
                  <p className="text-blue-100 text-lg mb-2">
                    @{userData.username}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Phone className="h-4 w-4 text-blue-200" />
                    <span className="text-blue-100 text-sm">{userData.phone}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Coins Balance Section */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-6 border border-amber-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Coins className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Available Coins</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {userData.coinsAvailable || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ready to spend</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center h-16 w-16 bg-white rounded-full shadow-md">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-medium group-hover:bg-gray-100 transition-colors">
                  {userData.name}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 flex items-center space-x-3 group-hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">{userData.phone}</span>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  PIN Code
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 flex items-center space-x-3 group-hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">{userData.pin || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Username
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-medium group-hover:bg-gray-100 transition-colors">
                  @{userData.username}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Local Area
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 flex items-center space-x-3 group-hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Home className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">{userData.localArea || 'Not provided'}</span>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Member Since
                </label>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 flex items-center space-x-3 group-hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-bold">📅</span>
                  </div>
                  <span className="font-medium">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={editForm.pin}
                    onChange={(e) => setEditForm({...editForm, pin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter PIN code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Local Area
                  </label>
                  <input
                    type="text"
                    value={editForm.localArea}
                    onChange={(e) => setEditForm({...editForm, localArea: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter local area"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updateLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;