import React, { useState } from "react";
import ImageUploadBox from "../../components/UploadImageBox";
import NewItemForm from "./NewItemForm";
import InventoryList from "../../components/InventoryList";

// Sample Inventory Data
const sampleInventory = [
  {
    id: 1,
    name: "Air pro",
    price: 5700,
    quantity: 8,
    image: "https://images.unsplash.com/photo-1517263904808-5dc0d6e4a6f4?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Jordons",
    price: 4250,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Sneaks",
    price: 2730,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Air Max",
    price: 3700,
    quantity: 4,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
];

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState<"new" | "inventory">("new");
  const [inventory, setInventory] = useState(sampleInventory);

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
      {/* Tabs */}
      <div className="flex rounded-t-lg overflow-hidden border ">
        <button
          className={`flex-1 py-2 text-lg font-semibold cursor-pointer ${
            activeTab === "new"
              ? "bg-blue-500"
              : "bg-white text-blue-500"
          }`}
          onClick={() => setActiveTab("new")}
        >
            <span className={`flex-1 px-4 py-1 rounded-2xl ${
                activeTab === "new"
                ? "bg-white"
                : "bg-white"
            }`}>+ New Item
            </span>
        </button>
        <button
          className={`flex-1 py-2 text-lg font-semibold cursor-pointer ${
            activeTab === "inventory"
              ? "bg-blue-500"
              : "bg-white text-blue-500"
          }`}
          onClick={() => setActiveTab("inventory")}
        >
            <span className={`flex-1 px-4 py-1 rounded-2xl ${
                activeTab === "new"
                ? "bg-white"
                : "bg-white"
            }`}>View Inventory
            </span>
        </button>
      </div>
      <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white px-8 py-6">
        {activeTab === "new" ? (
          <NewItemForm
            onAddItem={(item) => setInventory((prev) => [...prev, item])}
          />
        ) : (
          <InventoryList inventory={inventory} />
        )}
      </div>

      {/* Upload Inventory Section */}
      <div className="mt-8 border-t pt-8">
        <div className="flex flex-col md:flex-row md:items-start md:gap-12">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Upload Your Inventory</h2>
            <p className="mb-4 text-gray-700">
              Snap a photo of your item list and upload it here. Our system will
              read the details and add your products instantly. Make sure the
              text is clear and in English!
            </p>
          </div>
          <div>
            <label className="block font-semibold mb-2">List Image</label>
            <ImageUploadBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
