import { useEffect, useState } from "react";
import ChevronLeft from "../components/chevronleft";
import ChevronRight from "../components/chevronright";
import axios from "axios";
import { BACKEND_URL } from "../config/constant";

export default function Cust() {
  const [select, useSelect] = useState("shops");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.post(`${BACKEND_URL}/images`);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  function getshops() {
    useSelect("shops");
  }

  function getorders() {
    useSelect("orders");
  }

  return (
    <div className="min-h-screen max-w-screen">
      <div className="p-4 font-[Poppins] shadow-md text-4xl rounded-md font-semibold text-[#1372EE] text-center">
        Featured Shops Near You
      </div>

      {/* Interval / Arrows */}
      <div className="flex items-center justify-between px-4 py-6">
        <ChevronLeft />
        <div className="flex-1 text-center"> {/* Content goes here later */} </div>
        <ChevronRight />
      </div>

      {/* Bottom section: Toggle Buttons */}
      <div className="flex min-w-full rounded-2xl border-2 overflow-hidden">
        <div
          className="w-1/2 p-3 text-center cursor-pointer hover:bg-gray-100"
          onClick={getshops}
        >
          {select === "shops" ? (
            <div className="bg-blue-500 text-white rounded-2xl p-2">Shops</div>
          ) : (
            <div className="p-2">Shops</div>
          )}
        </div>

        <div className="w-px mt-1 mb-1 bg-gray-800"></div>

        <div
          className="w-1/2 p-3 text-center cursor-pointer hover:bg-gray-100"
          onClick={getorders}
        >
          {select === "orders" ? (
            <div className="bg-blue-500 text-white rounded-2xl p-2">My Orders</div>
          ) : (
            <div className="p-2">My Orders</div>
          )}
        </div>
      </div>

      {/* Last Div */}
      <div className="min-w-full rounded-2xl border mt-2 p-4">
        {/* Content based on selection could go here */}
        {select === "shops" ? "Showing Shops" : "Showing Orders"}
      </div>
    </div>
  );
}
