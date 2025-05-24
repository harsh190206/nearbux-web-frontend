const InventoryList = ({ inventory }: { inventory: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {inventory.map((item) => (
      <div
        key={item.id}
        className="flex items-center border rounded-lg shadow-sm p-3"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 object-cover rounded mr-4"
        />
        <div>
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-gray-700 font-bold text-lg mb-1">
            ₹ {item.price.toLocaleString()}
          </div>
          <div className="text-gray-500 text-sm">
            Available Quantity : {item.quantity}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default InventoryList;
