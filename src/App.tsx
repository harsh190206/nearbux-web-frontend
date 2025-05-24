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
import BSignupPage from './pages/buisness/bsignup';
import { BSignin } from './pages/buisness/bsignin';
import BForgotpass from './pages/buisness/bforgot';
import BInfo from './pages/buisness/binfo';
import ShopImage from './pages/buisness/shopimage'
import Blayout from "./pages/buisness/Blayout"
import Shop from "./pages/buisness/ShopHome"
import PromotionManager from './pages/Inventory/ProductManager';
import InventoryManager from './pages/InventoryManager/InventoryManager';
import BusinessAnalyticsDashboard from './pages/buisness/BussinessAnalyst';
import QuickBilling from './pages/Billing/QuickBilling';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>
        <Route path="home" element={<Cust />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wallet" element={<Wallet />} />
        </Route>

        {/* Standalone routes */}
        <Route path="signup" element={<SignupPage />} />
        <Route path="signin" element={<Signin />} />
        <Route path="info" element={<Info />} />
        <Route path="customer" element={<Cust />} />

        <Route path="newpass" element={<Forgotpass />} />



        <Route path="bsignup" element={<BSignupPage />} />
        <Route path="bsignin" element={<BSignin />} />
        <Route path="bnewpass" element={<BForgotpass />} />
        <Route path="newpass" element={<Forgotpass />} />
        <Route path="shopinfo" element={<BInfo />} />
        <Route path="shopimage" element={<ShopImage />} />
        <Route  element={<Blayout/>}>
        <Route  path="bhome" element={<Shop/>} />

        <Route path="inventory" element={<PromotionManager  />} />
        <Route path="inventoryManager" element={<InventoryManager  />} />
        <Route path="bussinessAnalyst" element={<BusinessAnalyticsDashboard  />} />
        <Route path="quickBilling" element={<QuickBilling  />} />
        <Route path="profilePage" element={<ProfilePage  />} />


        </Route>


        {/* Catch-all 404 */}
        <Route path="*" element={<NoPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
