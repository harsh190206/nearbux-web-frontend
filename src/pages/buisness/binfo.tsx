import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { BACKEND_URL } from "../../config/constant";

export default function BInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: '',
    tagline: '',
    pin: '',
    localArea: '',
    coinValue: '',
    ownerId: '',
    opens: '',
    closes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const beforesubmitcheck = async () => {
    if (!formData.shopName || !formData.coinValue || !formData.pin || !formData.localArea || !formData.tagline || !formData.opens || !formData.closes) {
      setError("All fields are mandatory");
      return 1;
    }
    
    const value = parseInt(formData.coinValue);
    if (value > 10 || value < 5) {
      setError('Value of coin can be only from 5 to 10');
      return 1;
    }

    // Validate time format and logic
    if (formData.opens >= formData.closes) {
      setError('Opening time must be before closing time');
      return 1;
    }

    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const phone = localStorage.getItem('phone');
      if (!phone) return;
      
      const bool = await beforesubmitcheck();
      if (bool) {
        setLoading(false);
        return;
      }
      
      const responseOwnerId = await axios.post(`${BACKEND_URL}/shop/id`, { phone });
      const ownerId = responseOwnerId.data.message;
  
      // Convert time strings to DateTime objects for the API
      const today = new Date();
      const opensDateTime = new Date(today.toDateString() + ' ' + formData.opens);
      const closesDateTime = new Date(today.toDateString() + ' ' + formData.closes);
      
      const payload = {
        ...formData,
        ownerId,
        opens: opensDateTime.toISOString(),
        closes: closesDateTime.toISOString(),
      };
  
      const response = await fetch(`${BACKEND_URL}/shop/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit shop information');
      }
  
      const data = await response.json();
      console.log("Shop creation response:", data);

      localStorage.setItem("ownerId", ownerId);
      localStorage.setItem("shopId", data.id);
      navigate('/shopimage');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full h-screen flex">
      {/* left div */}
      <div className="w-1/2 bg-[#1A87DD] flex flex-col items-center justify-center">
        <img src="/nearbux.png" alt="nearbuxlogo" className="w-32 rounded-2xl h-auto mb-2" />
        <p className="text-white text-2xl font-extrabold">NearBux</p>
        <p className="text-white text-sm font-bold mt-1">Shop Local, Save More</p>
      </div>
      
      {/* right div - Form */}
      <div className="w-1/2 bg-white p-8 flex flex-col justify-center overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code
            </label>
            <input
              type="text"
              id="pin"
              name="pin"
              value={formData.pin}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,6}$/.test(value)) {
                  setFormData({ ...formData, pin: value });
                }
              }}
              inputMode="numeric"
              pattern="\d*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="localArea" className="block text-sm font-medium text-gray-700 mb-1">
              Local Area
            </label>
            <input
              type="text"
              id="localArea"
              name="localArea"
              value={formData.localArea}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="coinValue" className="block text-sm font-medium text-gray-700 mb-1">
              Value of 100 coins
            </label>
            <input
              type="number"
              id="coinValue"
              name="coinValue"
              value={formData.coinValue}
              placeholder="Value must lie between 5 to 10"
              max={10}
              min={5}
              step={1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="opens" className="block text-sm font-medium text-gray-700 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                id="opens"
                name="opens"
                value={formData.opens}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="closes" className="block text-sm font-medium text-gray-700 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                id="closes"
                name="closes"
                value={formData.closes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
          >
            {loading ? 'Submitting...' : 'Submit & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}