import React, { useState } from "react";
import ImageUploadBox from "../../components/UploadImageBox";

const NewItemForm = ({ onAddItem }: { onAddItem: (item: any) => void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("Unit");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem({
      id: Date.now(),
      name,
      price: Number(price),
      quantity,
      image: image
        ? URL.createObjectURL(image)
        : "https://via.placeholder.com/80x80?text=No+Image",
    });
    setName("");
    setDesc("");
    setQuantity(1);
    setPrice("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-2">
            Name of Product<span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">
                Quantity<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                className="w-16 border border-gray-300 rounded px-2 py-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">&nbsp;</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option>Unit</option>
                <option>Kg</option>
                <option>Piece</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2">Price<span className="text-red-500">*</span></label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-xl">₹</span>
                <input
                  type="number"
                  min={0}
                  className="w-24 border border-gray-300 rounded px-2 py-2"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <label className="block font-semibold mb-2">Product Image <span className="text-gray-500">(Optional)</span></label>
          <ImageUploadBox onChange={handleImageChange} file={image} />
        </div>
        <div>
          <label className="block font-semibold mb-2">Product Description</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 h-24"
            placeholder="Product Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-12 rounded text-lg transition"
        >
          Add To Inventory
        </button>
      </div>
    </form>
  );
};

export default NewItemForm;
