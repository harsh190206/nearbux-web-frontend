import react from 'react';
import { useState, useRef } from 'react';
import axios from 'axios';
export function Signin (){
  const [error , seterror] = useState<string>('');
  const [loading, setloading] = useState<boolean> (false);
  const [input , setinput] = useState<string>('');
  const inputref = useRef<HTMLInputElement>(null);

  const handleInputChange =  ( e : any )=>{
      const value = e.target.value; 
      setinput(()=>value);
  };
  

  async  function validate () {
    if(!input || !inputref.current?.value){
      seterror("all field are required");
      return false; 
    }
      return true; 
    

  }


       

  const  sig =  async (e : React.FormEvent)=>{
    seterror('');
    e.preventDefault();
    setloading(true);
        
    let userInput = input; 
    const password = inputref.current?.value;

      const  ver = await validate();
      if(!ver){
        setloading(false);
        return ; 
      }

     try {
      if(userInput.length===10){
        userInput = '+91' + userInput;
      } 

    const response =  await axios.post("http://localhost:3000/user/signin", {userInput, password});
    if(response.status === 500){

      throw new Error (response.data.message);

    }
    if(response.data.token){
      localStorage.setItem("token", response.data.token);
      console.log(response.data.token);
    }

     }catch (e : any ){

      const message = e.response.data.message || "error during signin" ;
      seterror(message);

          

     } finally 
     {
          setloading(false);
     }




    


  }
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
          <form  onSubmit={sig} className="space-y-4">
            <div>
              <p className="text-sm mb-1">username or Phone</p>
              <input maxLength={10} onChange={handleInputChange} type="text" className="border rounded-md w-full px-3 py-2" />
            </div>

          

            <div>
              <p className="text-sm mb-1">Password</p>
              <input ref={inputref} type="password" className="border rounded-md w-full px-3 py-2" />
            </div>

         
           
            <button  type="submit" className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-semibold py-2 rounded-md w-full">
                      { loading   ? "signing in" : "Sign in" }
            </button>

            {error && (
  <div className="flex justify-center">
    <p className="text-red-500 font-normal text-md text-center">{error}</p>
  </div>
)}

           

          

            {/* Secure and Privacy */}
        
            {/* Already have account */}
            <p className="text-center text-sm mt-4">
             Don't have an account? <a href='/signup' className="text-blue-600 underline cursor-pointer">Sign up</a>
            </p>
          </form>

        </div>
      </div>



    </div>
}