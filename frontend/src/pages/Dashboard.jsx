// src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="bg-gray-50">
      
      {/* General Welcome Message */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
        <span className="text-pink-600">Welcome Home,</span> Sneha!
      </h1>
      <p className="text-lg text-gray-500 mb-8 border-b pb-4">
        This space is dedicated entirely to us.
      </p>

      {/* Main Content Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-semibold text-pink-600 mb-6">
            A Little Love Note... 💌
        </h2>
        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
          My dearest, I made this just for you. Every time you log in, I hope it reminds you of how much I cherish you and every moment we spend together. 
          This dashboard will grow with our love, holding our memories and plans. Know that you are the most beautiful part of my life.
        </p>
        <p className="mt-6 text-sm text-gray-400 italic text-right">
            — Forever yours.
        </p>
      </div>
      
    </div>
  );
};

export default Dashboard;