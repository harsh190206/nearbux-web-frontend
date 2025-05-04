import './App.css';
import SignupPage from './pages/Sgnup';
import { Signin } from './pages/Signin';
import Info from './pages/info';
import Cust from './pages/customerHome';
import NoPage from './pages/NoPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Cart} from './pages/cart';
import Wallet from './pages/wallet';
import Layout from './pages/Layout'; // Assuming you have a Layout component
import Forgotpass from './pages/forgot';
function App() {
  return (
    <BrowserRouter>
      <Routes>

        
         <Route path="/" element={<Layout />}>
          <Route path="cust" element={<Cust />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>

        {/* Standalone routes */}
        <Route path="signup" element={<SignupPage />} />
        <Route path="signin" element={<Signin />} />
        <Route path="info" element={<Info />} />
        <Route path="customer" element={<Cust />} />

        <Route path="newpass" element={<Forgotpass />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NoPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
