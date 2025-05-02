
import './App.css';
import SignupPage from './pages/Sgnup';
import {Signin} from './pages/Signin';
import Info from './pages/info';
import { BrowserRouter, Routes, Route } from "react-router-dom";



function App() {
    return (
      <BrowserRouter>
      <Routes>
        
          <Route path="signup" element={<SignupPage />} />
          <Route path="signin" element={<Signin />} />
          <Route path="info" element={<Info />} />
          {/* <Route path="*" element={<NoPage />} /> */}

      </Routes>
    </BrowserRouter>
    )
  
}

export default App;
