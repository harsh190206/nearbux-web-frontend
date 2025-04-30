export function Signin (){
    return <div className="max-h-screen max-w-screen  flex h-screen w-screen">   

 {/* left side with logo  */}
    <div className="w-1/2  min-h-screen  items-center justify-center flex max-h-screen bg-blue-600">
    <div className="text-center">
          <div className="bg-[#1d3d7d] p-6 rounded-2xl inline-block mb-4">
            {/* Replace   icon if available */}
            <img src="/nearbux.png" alt="Logo" className="w-24 h-24 mx-auto" />
          </div>
          <h1 className="text-white text-3xl font-bold font-[Montserrat]">NearBux</h1>
          <p className="text-white mt-2 font-light">Shop Local, Save More</p>
        </div>

    </div>
    {/* right side  */}
    <div className="md:w-1/2 w-full bg-white flex justify-center items-center p-6">
        <div className="border rounded-2xl shadow-lg p-8 w-full max-w-md">
          
          {/* Header Texts */}
          <p className="text-sm font-semibold text-gray-600 mb-2 font-[Montserrat]">Welcome back</p>
          <p className="text-3xl font-bold mb-6 font-[Montserrat]">Login in to Your account</p>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <p className="text-sm mb-1">username or Phone</p>
              <input type="text" className="border rounded-md w-full px-3 py-2" />
            </div>

          

            <div>
              <p className="text-sm mb-1">Password</p>
              <input type="password" className="border rounded-md w-full px-3 py-2" />
            </div>

         
           
            <button type="submit" className="bg-[#f9a825] hover:bg-yellow-600 text-white font-semibold py-2 rounded-md w-full">
            Sign in
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
}