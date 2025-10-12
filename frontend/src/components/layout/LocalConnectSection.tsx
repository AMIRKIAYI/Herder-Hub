import React from 'react';
import { FaPhoneAlt, FaFacebookF, FaTwitter, FaHeadset, FaMoneyBillWave } from 'react-icons/fa';
import { BsWhatsapp, BsCash, BsCurrencyDollar } from 'react-icons/bs';

const LocalConnectSection = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left Section - Customer Care */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-amber-800">
              <FaHeadset className="mr-2" />
              <span>Customer Care: <strong>0712 345 678</strong></span>
            </div>
            
            <div className="hidden sm:flex items-center text-amber-800">
              <FaPhoneAlt className="mr-2" />
              <span>SMS: <strong>0712 345 678</strong></span>
            </div>
          </div>

          {/* Middle Section - Payment Methods */}
          <div className="flex items-center space-x-4 overflow-x-auto py-1">
            <span className="text-amber-800 whitespace-nowrap">Payment Methods:</span>
            <div className="flex space-x-3">
              <div className="flex items-center space-x-1 text-green-600">
                <FaMoneyBillWave className="text-lg" />
                <span>M-PESA</span>
              </div>
              <div className="flex items-center space-x-1 text-red-600">
                <BsCurrencyDollar className="text-lg" />
                <span>Airtel Money</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-800">
                <BsCash className="text-lg" />
                <span>Cash</span>
              </div>
            </div>
          </div>

          {/* Right Section - Social Media */}
          <div className="flex items-center space-x-4">
            <span className="text-amber-800">Follow Us:</span>
            <div className="flex space-x-3">
              <a href="#" className="text-amber-700 hover:text-blue-600">
                <FaFacebookF />
              </a>
              <a href="#" className="text-amber-700 hover:text-blue-400">
                <FaTwitter />
              </a>
              <a href="#" className="text-amber-700 hover:text-green-500">
                <BsWhatsapp />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalConnectSection;