import React, { useState } from "react";

// Sample inventory data
const INVENTORY = [
  { id: 1, name: "Black Men's T-Shirt", price: 400 },
  { id: 2, name: "Adidas T-shirt", price: 400 },
  { id: 3, name: "Real Madrid Original", price: 40000 },
  { id: 4, name: "Man United Original", price: 35000 },
];

const QuickBilling = () => {
  // User details state
  const [user, setUser] = useState({
    name: "Priyanka Sharma",
    username: "Priyanka@142",
    phone: "12345 12345",
  });

  // Inventory state
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState<{ [id: number]: number }>({});
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

  // Billing state
  const [manual, setManual] = useState(false);
  const [manualTotal, setManualTotal] = useState("");
  const [manualTax, setManualTax] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // Filtered inventory
  const filteredInventory = INVENTORY.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add to cart handler
  const handleAdd = (item: typeof INVENTORY[0]) => {
    const quantity = qty[item.id] || 1;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setQty((q) => ({ ...q, [item.id]: 1 }));
  };

  // Remove from cart handler
  const handleRemove = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = manual
    ? Number(manualTax) || 0
    : Math.round(subTotal * 0.09 * 100) / 100; // Example 9% tax
  const total = manual
    ? Number(manualTotal) + Number(manualTax) || 0
    : subTotal + taxes;
  const paid = Number(amountPaid) || 0;
  const change = paid > total ? paid - total : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-semibold mb-6">Quick Billing</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        {/* Left Column: User Details + Billing Summary */}
        <div className="flex flex-col flex-1 gap-6">
          {/* User Details */}
          <div className="border rounded-xl p-6 min-w-[320px] bg-white shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-xl font-semibold">User details</div>
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden" />
            </div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
            />
            <label className="block text-sm font-medium">Username</label>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              value={user.username}
              onChange={(e) => setUser((u) => ({ ...u, username: e.target.value }))}
            />
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={user.phone}
              onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
            />
          </div>

          {/* Billing Summary */}
          <div className="border rounded-xl p-6 min-w-[320px] bg-white shadow-sm">
            <div className="text-lg font-semibold text-blue-600 mb-2">
              Billing Summary
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={manual}
                onChange={() => setManual((m) => !m)}
                className="accent-blue-600"
                id="manual"
              />
              <label htmlFor="manual" className="font-medium">
                Use Manual Entry Instead
              </label>
            </div>
            <hr className="mb-3" />
            {manual ? (
              <div>
                <label className="block text-sm mb-1">Total Amount :</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  placeholder="Enter total amount"
                />
                <label className="block text-sm mb-1">Taxes (%) :</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-4"
                  value={manualTax}
                  onChange={(e) => setManualTax(e.target.value)}
                  placeholder="Enter tax amount"
                />
                <button className="bg-blue-500 text-white px-8 py-2 rounded font-semibold">
                  Save
                </button>
              </div>
            ) : (
              <div>
                {cart.length === 0 ? (
                  <div className="text-gray-500 mb-3">No items added yet.</div>
                ) : (
                  <ul className="mb-3">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center mb-1"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          ₹ {(item.price * item.quantity).toLocaleString()}
                          <button
                            className="ml-2 text-red-500 text-xs"
                            onClick={() => handleRemove(item.id)}
                          >
                            Remove
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between mb-1">
                  <span>Sub Total :</span>
                  <span>₹ {subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Taxes :</span>
                  <span>₹ {taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1 font-semibold text-blue-600">
                  <span>Total :</span>
                  <span>₹ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Amount Paid :</span>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-28 text-right"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="₹ 00.00"
                  />
                </div>
                <div className="flex justify-between mb-4 font-semibold">
                  <span>Change :</span>
                  <span>₹ {change.toFixed(2)}</span>
                </div>
                <button className="bg-blue-500 text-white px-8 py-2 rounded font-semibold">
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory */}
        <div className="flex-1 border rounded-xl p-6 min-w-[320px] bg-white shadow-sm">
          <div className="text-lg font-semibold text-blue-600 mb-2">
            Inventory
          </div>
          <div className="flex items-center bg-gray-100 rounded px-2 mb-3">
            <svg
              className="w-5 h-5 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="bg-gray-100 border-0 focus:ring-0 w-full py-2"
              placeholder="Search...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-2"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-600 text-sm">
                    ₹ {item.price.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    className="w-12 border rounded px-2 py-1 text-center"
                    value={qty[item.id] || 1}
                    onChange={(e) =>
                      setQty((q) => ({
                        ...q,
                        [item.id]: Math.max(1, Number(e.target.value)),
                      }))
                    }
                  />
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-1 rounded"
                    onClick={() => handleAdd(item)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBilling;
