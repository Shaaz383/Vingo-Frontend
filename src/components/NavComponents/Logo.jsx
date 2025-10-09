import React from 'react';

const Logo = ({ navigate }) => {
  return (
    <div className="flex-shrink-0 flex items-center">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg p-1 -m-1"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <span className="text-xl font-bold text-gray-800 hidden sm:block">Vingo</span>
      </button>
    </div>
  );
};

export default Logo;