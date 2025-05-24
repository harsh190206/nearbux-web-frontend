import React, { useState } from "react";

interface Promotion {
  id: string;
  businessName: string;
  title: string;
  description: string;
  validPeriod: string;
  discount: string;
  logo: string;
}
const CustomerPreview = ({ onEdit }) => {
  const promotion: Promotion = {
    id: '1',
    businessName: 'Foot Planet',
    title: 'Weekend Special - 15% Off Fresh Pastries',
    description: 'Enjoy 15% off all fresh pastries this weekend only! Valid Friday through Sunday. Don\'t miss these fresh-baked treats!',
    validPeriod: 'May 10 - May 15',
    discount: '15%',
    logo: 'FP'
  };

  return (
    <div className=" rounded-[15px] bg-white">
         <span className="text-xl font-bold text-center flex justify-center mb-6">Ongoing Promotion</span>
 
        <div className="bg-gray-100 rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Customer Preview</h3>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-white">
                {promotion.logo}
                </div>
                <div>
                    <div className="text-lg font-semibold">{promotion.businessName}</div>
                    <div className="text-gray-700 mt-1">{promotion.description}</div>
                    <div className="mt-2 font-medium">{promotion.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Valid : {promotion.validPeriod}</span>
                        <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">{promotion.discount}</span>
                    </div>
                </div>
            </div>
            </div>
            <div className="flex justify-center mt-8">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-8 rounded transition" onClick={onEdit} >
                Edit
            </button>
        </div>
    </div>
  );
};

export default CustomerPreview;
