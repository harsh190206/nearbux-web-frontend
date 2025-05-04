import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router";
// @ts-ignore
export default  function Info() {
  const navigate = useNavigate();
  const [area, setArea] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading , setloading] = useState<boolean>(false);

   async function handleSubmit  (e : any)  {
    setloading((e)=>!e);
    e.preventDefault();
    // Basic validation
    if (!area.trim()) {
      setError('Please enter your area name.');
      setloading(false);
      return;
    }
    if (!/^\d{6}$/.test(pinCode)) {
      setError('Please enter a valid 6-digit pin code.');
      setloading(false);
      return;
    }
    setError('');
    const phoneNumber = localStorage.getItem("phone");
    let response ;
    try {
     response =  await  axios.post("http://localhost:3000/user/info", {pinCode , area , phoneNumber});
   
    }catch(errr : any ){
      setloading(false);
      setError('network error nd');


    }

     if(response?.status ===200){
     navigate("/signin");
     setloading(false);
   

    }
    else {
      setloading(false);
      setError(response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md w-full max-w-sm p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Your Address</h2>

        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="area" className="block text-gray-700 mb-2">
            Area Name
          </label>
          <input
            id="area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., jaipur"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="pinCode" className="block text-gray-700 mb-2">
            Pin Code
          </label>
          <input
            id="pinCode"
            type="text"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., 560001"
            maxLength={6}
          />
        </div>
     
        <button
          type="submit"
          
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800 cursor-pointer transition"
        >
          {loading ? "submitting ..." : "submit"}
        </button>
      </form>
    </div>
  );
}
