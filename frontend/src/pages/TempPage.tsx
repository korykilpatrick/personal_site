import React from 'react';
// import morganBachImage from '../assets/images/morggan_bach.png'; // Removed incorrect import

const TempPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <img 
        src="/images/morggan_bach.png" // Use the public path directly
        alt="Morgan Bachelorette Prank" 
        className="max-w-full h-auto max-h-[70vh] object-contain mb-6 shadow-lg rounded-lg"
      />
      <h1 className="text-2xl md:text-4xl font-bold text-red-600 text-center px-4">
        ALERT: American women last spotted in Tulum wielding penis straws. Approach with caution.
      </h1>
    </div>
  );
};

export default TempPage; 