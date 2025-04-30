
import { useState, useRef } from "react";

export default function Signup (){



    const [number , setnumber] = useState("");
  const phnref = useRef<HTMLInputElement>(null);

  




  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      
      {/* Left side */}
      <div className="md:w-1/2 w-full bg-[#4184dd] flex flex-col justify-center items-center p-8">
        {/* You can add the NearBux logo and text here */}
        <div className="text-center">
          <div className="bg-[#1d3d7d] p-6 rounded-2xl inline-block mb-4">
            {/* Replace with actual icon if available */}
            <img src="/nearbux.png" alt="Logo" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-white text-3xl font-bold font-[Montserrat]">NearBux</h1>
          <p className="text-white mt-2 font-light">Shop Local, Save More</p>
        </div>
      </div>

      {/* Right side */}
      <div className="md:w-1/2 w-full bg-white flex justify-center items-center p-6">
        <div className="border rounded-2xl shadow-lg p-8 w-full max-w-md">
          
          {/* Header Texts */}
          <p className="text-sm font-semibold text-gray-600 mb-2 font-[Montserrat]">Let's get you started</p>
          <p className="text-3xl font-bold mb-6 font-[Montserrat]">Create a New account</p>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <p className="text-sm mb-1">Name</p>
              <input type="text" className="border rounded-md w-full px-3 py-2" />
            </div>

            <div>
              <p className="text-sm mb-1">Email</p>
              <input type="email" className="border rounded-md w-full px-3 py-2" />
            </div>

            <div>
              <p className="text-sm mb-1">Password</p>
              <input type="password" className="border rounded-md w-full px-3 py-2" />
            </div>

            <div >
              <p   className="text-sm mb-1">Phone Number</p>

              <div className='flex'>
              <input ref={phnref} onChange={() => setnumber(phnref.current?.value || "")} type="text" className="border rounded-md w-full px-3 py-2" />
              {number.length ==10 && <button onClick={()=>console.log(number)} className='ml-2 p-3 bg-blue-600
                rounded-xl'> verify </button>}
              </div>
              
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start mt-2">
              <input type="checkbox" className="mt-1" />
              <p className="text-xs ml-2">I agree to the <span className="text-blue-600 underline">Terms & Conditions</span></p>
            </div>

            {/* Button */}
            <button type="submit" className="bg-[#f9a825] hover:bg-yellow-600 text-white font-semibold py-2 rounded-md w-full">
              Get Started
            </button>

            {/* Secure and Privacy */}
        
            {/* Already have account */}
            <p className="text-center text-sm mt-4">
              Already have an account? <span className="text-blue-600 underline cursor-pointer">Log in</span>
            </p>
          </form>

        </div>
      </div>

    </div>
  );
}