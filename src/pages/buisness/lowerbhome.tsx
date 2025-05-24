import { useEffect, useState } from "react";
import axios from 'axios';
export default function Lowerbhome() {
  const [selected, setSelected] = useState("orders");
  const [orders , selectOrders] = useState([]);
  useEffect(()=>{
    const a = async function (){
      const response = axios.post("http://localhost:3000/orders",{})

    };
    a();

  },[]);


  const tabClass = (tab : string) =>
    `cursor-pointer px-4 py-2 transition-all ${
      selected === tab
        ? "border-b-4 border-yellow-500 text-yellow-600 font-semibold shadow-md"
        : "text-gray-600 hover:text-yellow-500"
    }`;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-8 py-6 border-b border-gray-200">
      <div className="flex justify-around">
        <div onClick={() => setSelected("orders")} className={tabClass("orders")}>
          Orders
        </div>
        <div onClick={() => setSelected("accepted")} className={tabClass("accepted")}>
          Accepted Orders
        </div>
        <div onClick={() => setSelected("history")} className={tabClass("history")}>
          History
        </div>
      </div>




    </div>
  );
}
