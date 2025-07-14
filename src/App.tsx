import './App.css';
import SignupPage from './pages/Sgnup';
import { Signin } from './pages/Signin';
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy';
import Info from './pages/info';
import Cust from './pages/customerHome';
import NoPage from './pages/NoPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Cart} from './pages/cart';
import Wallet from './pages/wallet';
import Layout from './pages/Layout'; // Assuming you have a Layout component
import Forgotpass from './pages/forgot';
import BSignupPage from './pages/buisness/bsignup';
import AboutUs from './pages/aboutus'
import Faq from "./pages/FAQ"
import { BSignin } from './pages/buisness/bsignin';
import BForgotpass from './pages/buisness/bforgot';
import BInfo from './pages/buisness/binfo';
import ShopImage from './pages/buisness/shopimage'
import Blayout from "./pages/buisness/Blayout"
import Shop from "./pages/buisness/ShopHome"
import InventoryPage from './pages/buisness/inventory';
import ProfilePage from './pages/ProfilePage';
import ShopAnalyticsDashboard from "./pages/buisness/analytics"
import ShopInfoPage from './pages/buisness/shopKepperInfo';
import NearBuxLanding from './pages/Landingpage';
import BillingComponent from './pages/buisness/billing';
import Feedback from './pages/feedback';
import OfferManagement from './pages/buisness/offer'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element ={<NearBuxLanding/>}/>
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
        <Route path="terms" element={<Terms />} />
        <Route path="faq" element={<Faq />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="privacy" element={<PrivacyPolicy />} />

        <Route path="bsignup" element={<BSignupPage />} />
        <Route path="bsignin" element={<BSignin />} />
        <Route path="bnewpass" element={<BForgotpass />} />
        <Route path="newpass" element={<Forgotpass />} />
        <Route path="shopinfo" element={<BInfo />} />
        <Route path="feedback" element={<Feedback />} />
        
        <Route path="shopimage" element={<ShopImage />} />
        <Route  element={<Blayout/>}>
        <Route  path="bhome" element={<Shop/>} />

        <Route path="inventory" element={<InventoryPage  />} />
        
        <Route path="analytics" element={<ShopAnalyticsDashboard  />} />
        
        <Route path="profilePage" element={<ProfilePage  />} />
        <Route path = "bprofile" element = {<ShopInfoPage/>} />
        <Route path = "billing" element = {<BillingComponent/>} />
        <Route path = "offers" element = {<OfferManagement/>} />

        </Route>


        {/* Catch-all 404 */}
        <Route path="*" element={<NoPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
