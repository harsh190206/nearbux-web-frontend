import React, { useState } from "react";

const NewPromotion = () => {
  const [title, setTitle] = useState("Weekend Special – 15% Off Fresh Pastries");
  const [message, setMessage] = useState(
    "Enjoy 15% off all fresh pastries this weekend only! Valid Friday through Sunday. Don’t miss these fresh-baked treats!"
  );
  const [shopImage, setShopImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setShopImage(e.target.files[0]);
    }
  };

  return (
    <div className=" rounded-[15px] bg-white">
      <div className="text-xl font-medium mb-4">Promote your shop for ₹50 only</div>
      <div className="bg-white rounded-[15px] border border-[#00000033] p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Create New Promotion</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Left Side */}
          <div>
            <label className="block font-semibold mb-2">Promotion Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Promotion Title"
            />

            <label className="block font-semibold mb-2">Shop Image <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center cursor-pointer bg-[#2196F3] hover:bg-[#1976D2] text-white px-5 py-2 rounded font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3m-6-6V7a4 4 0 018 0v3"></path>
                </svg>
                Upload
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 flex-1"
                placeholder="No file chosen"
                value={shopImage ? shopImage.name : ""}
                disabled
              />
            </div>
            <div className="text-xs text-gray-500 mb-8">
              Note :- JPEG, JPG, PNG format, up to 50 KB
            </div>

            {/* Customer Preview */}
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="font-semibold text-lg mb-3">Customer Preview</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white">
                  FP
                </div>
                <div>
                  <div className="font-semibold">Foot Planet</div>
                  <div className="text-gray-700">{title}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-600 text-sm">Valid : May 10 - May 15</span>
                    <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">15 %</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div>
            <label className="block font-semibold mb-2">Promotion Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-40"
              placeholder="Promotion Message"
            />
          </div>
        </div>
        {/* Pay Now Button */}
        <div className="flex justify-center mt-8">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-16 rounded text-lg transition">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPromotion;
