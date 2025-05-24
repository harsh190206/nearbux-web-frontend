import React, { useState } from "react";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    phone: "+91 12345 12345",
    pin: "311001",
    address: "",
    areaname: "",
    shopTimeFrom: "10:00",
    shopTimeTo: "20:00",
    coinValue: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg">
      {/* Back Arrow and Title */}
      <div className="flex items-center mb-8">
        <button className="mr-2 text-2xl">
          <span>&larr;</span>
        </button>
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src="https://pplx-res.cloudinary.com/image/private/user_uploads/63485613/bfe2e61a-2386-43b1-9ae8-07aa7abce054/a1.png.jpg"
          alt="Shop"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div className="text-2xl font-semibold">Indian Fashion</div>
        <button
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
          onClick={() => setEditMode((e) => !e)}
        >
          Edit
        </button>
      </div>

      {/* Personal Information */}
      <div>
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="+91 12345 12345"
              value={profile.phone}
              onChange={handleChange}
              disabled={!editMode}
            />
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Address"
              value={profile.address}
              onChange={handleChange}
              disabled={!editMode}
            />
            <label className="block text-sm font-medium mb-1">Shop Time</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="time"
                name="shopTimeFrom"
                className="border rounded px-3 py-2 w-28"
                value={profile.shopTimeFrom}
                onChange={handleChange}
                disabled={!editMode}
              />
              <span className="mx-2">To</span>
              <input
                type="time"
                name="shopTimeTo"
                className="border rounded px-3 py-2 w-28"
                value={profile.shopTimeTo}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
          </div>
          {/* Right */}
          <div>
            <label className="block text-sm font-medium mb-1">Pin</label>
            <input
              type="text"
              name="pin"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="311001"
              value={profile.pin}
              onChange={handleChange}
              disabled={!editMode}
            />
            <label className="block text-sm font-medium mb-1">Areaname</label>
            <input
              type="text"
              name="areaname"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="areaname"
              value={profile.areaname}
              onChange={handleChange}
              disabled={!editMode}
            />
            <label className="block text-sm font-medium mb-1">Value Of Coins</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="coinValue"
                className="border rounded px-3 py-2 w-28"
                placeholder="%"
                value={profile.coinValue}
                onChange={handleChange}
                disabled={!editMode}
              />
              <span className="text-xl font-semibold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Others */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Others</h2>
        <div className="flex flex-col gap-2">
          <a href="#" className="text-blue-600 hover:underline">
            Help & Support
          </a>
          <a href="#" className="text-blue-600 hover:underline">
            Terms & Conditions
          </a>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex justify-center mt-12">
        <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
