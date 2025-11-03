import React from 'react';

const SubscriptionPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <p className="text-gray-600 mb-4">You are currently on the <span className="font-bold text-blue-600">Free Plan</span>.</p>
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
          <p className="text-gray-600 mb-4">Unlock more features and enjoy unlimited access to our services.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
