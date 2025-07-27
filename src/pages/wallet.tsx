import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Coins } from 'lucide-react';

import { BACKEND_URL } from '../config/constant'; // Replace with your actual backend URL

interface Transaction {
  id: number;
  type: 'incoming' | 'outgoing';
  amount: number;
  shopName: string;
  shopImage?: string;
  date: string;
  createdAt: string;
}

export default function Wallet() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('User not logged in');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/user/wallet-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: parseInt(userId) })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Invalid response from server');
      }

      setTransactions(data.transactions || []);
      setUserCoins(data.userCoins || 0);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
        <div className="max-w-md lg:max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 lg:h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 sm:h-20 lg:h-24 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-16 lg:h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
        <div className="max-w-md lg:max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 text-center">
            <div className="text-red-500 mb-4">
              <CreditCard size={40} className="mx-auto sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">Error Loading Wallet</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchWalletData}
              className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base lg:text-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-md lg:max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">My Wallet</h1>
            <CreditCard size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          </div>
          
          {/* Balance Card */}
          <div className="bg-white/20 rounded-lg p-4 lg:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <Coins size={24} className="mr-2 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base opacity-90">Available Balance</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{userCoins.toLocaleString()}</p>
                <p className="text-xs sm:text-sm lg:text-base opacity-90">Coins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <span className="text-xs sm:text-sm lg:text-base text-gray-500">Last 60 transactions</span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 lg:py-16">
              <div className="text-gray-400 mb-4">
                <Coins size={40} className="mx-auto sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-500">No transactions yet</p>
              <p className="text-xs sm:text-sm lg:text-base text-gray-400 mt-2">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Shop Image */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mr-3 sm:mr-4 lg:mr-5 flex-shrink-0">
                    {transaction.shopImage ? (
                      <img
                        src={transaction.shopImage}
                        alt={transaction.shopName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm lg:text-base">
                          {transaction.shopName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm sm:text-base lg:text-lg text-gray-800 truncate pr-2">
                        {transaction.shopName}
                      </p>
                      <div className="flex items-center flex-shrink-0">
                        {transaction.type === 'incoming' ? (
                          <ArrowDownLeft size={16} className="text-green-500 mr-1 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        ) : (
                          <ArrowUpRight size={16} className="text-red-500 mr-1 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        )}
                        <span
                          className={`font-semibold text-sm sm:text-base lg:text-lg ${
                            transaction.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'incoming' ? '+' : '-'}{transaction.amount}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-400">
                      {transaction.type === 'incoming' ? 'Received from' : 'Sent to'} {transaction.shopName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="p-4 sm:p-6 lg:p-8 pt-0">
          <button
            onClick={fetchWalletData}
            className="w-full bg-blue-500 text-white py-2 sm:py-3 lg:py-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base lg:text-lg"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Transactions'}
          </button>
        </div>
      </div>
    </div>
  );
}