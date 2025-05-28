import React, { useState } from 'react';
import { Check, MapPin, Clock, DollarSign, Users, Gift, Shield, CreditCard, Star } from 'lucide-react';
import Footer from './landingpageFooter';
const NearBuxLanding = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const handleCustomerClick = () => {
    setShowCustomerModal(true);
  };

  const handleBusinessClick = () => {
    // Navigate to business signup
    window.location.href = '/bsignup';
  };

  const closeModal = () => {
    setShowCustomerModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img 
              src="/nearbux.png" 
              alt="NearBux Logo" 
              className="w-8 h-8"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{display: 'none'}}>
              N
            </div>
            <span className="text-xl font-semibold">NearBux</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#benefits" className="hover:text-green-400 transition-colors">Benefits</a>
            <a href="#how-it-works" className="hover:text-green-400 transition-colors">How it Works</a>
            
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Support Local,
                <br />
                <span className="text-green-400">Earn Rewards</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                NearBux connects you with local businesses while rewarding your loyalty. 
                Earn points with every purchase that you can redeem anywhere in our network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCustomerClick}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  For Customers
                </button>
                <button 
                  onClick={handleBusinessClick}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  For Businesses
                </button>
              </div>
              
              {/* Stats */}
           
            </div>
            
            {/* Mock App Interface */}
            <div className="lg:block hidden">
              <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-400">NearBux</h3>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      350 points
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-4">Your Local Rewards</div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Nearby Shops</h4>
                    
                    <div className="flex items-center justify-between bg-gray-600 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">Sunrise Bakery</div>
                        <div className="text-sm text-gray-400">2.1 km away</div>
                      </div>
                      <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        15% OFF
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-600 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">Green Grocers</div>
                        <div className="text-sm text-gray-400">0.8 km away</div>
                      </div>
                      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                        2X POINTS
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sunrise Bakery</span>
                        <span className="text-green-400">+25 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coffee Junction</span>
                        <span className="text-green-400">+15 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Book Corner</span>
                        <span className="text-red-400">-50 points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Benefits for Customers</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              NearBux transforms your everyday shopping into a rewarding experience while helping you 
              discover and support local businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Earn Points */}
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn Points Everywhere</h3>
              <p className="text-gray-300 mb-6">
                Accumulate reward points with every purchase from participating local businesses. 
                The more you shop, the more you earn!
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Points for in-store purchases</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Points for online orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Bonus points on special occasions</span>
                </div>
              </div>
            </div>

            {/* Discover Local */}
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Discover Local Gems</h3>
              <p className="text-gray-300 mb-6">
                Find the best local shops, cafes, and services in your neighborhood. 
                Filter by category, ratings, or special offers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span>Location-based shop discovery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span>Exclusive local deals and promotions</span>
                </div>
              </div>
            </div>

            {/* Convenient Shopping */}
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Convenient Shopping</h3>
              <p className="text-gray-300 mb-6">
                Shop your way - in person, online ordering with pickup, or delivery options 
                from participating merchants.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-400" />
                  <span>Online ordering with local shops</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-400" />
                  <span>save your time</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-400" />
                  <span> earn points directly to your wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How NearBux Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Supporting local businesses has never been easier or more rewarding. 
              Join the NearBux community in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Discover Local Shops</h3>
              <p className="text-gray-300">
                Find participating stores in your area by entering your pincode. 
                Browse local shops, products, and exclusive offers.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Shop & Earn Points</h3>
              <p className="text-gray-300">
                shop via NearBux  from participating 
                businesses to earn loyalty points automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Redeem & Enjoy</h3>
              <p className="text-gray-300">
                Use your accumulated points to get discounts, free products, 
                or special offers at any participating business in our network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-xl text-center">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure & Trusted</h3>
              <p className="text-gray-300">
                Your transactions and personal data are protected with 
                enterprise-grade security measures.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Driven</h3>
              <p className="text-gray-300">
                Join thousands of customers supporting local businesses 
                and building stronger communities.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-xl text-center">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Exclusive Rewards</h3>
              <p className="text-gray-300">
                Access special promotions, early bird offers, and 
                exclusive deals available only to NearBux members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
  <Footer></Footer>
      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Coming Soon for Customers!</h3>
            <p className="text-gray-300 mb-6">
              We're currently onboarding shopkeepers to bring you the best local businesses. 
              Once they're onboarded, our site will be live for customers too in a very short period.
            </p>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Onboarding local businesses...</span>
            </div>
            <button 
              onClick={closeModal}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold w-full transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearBuxLanding;