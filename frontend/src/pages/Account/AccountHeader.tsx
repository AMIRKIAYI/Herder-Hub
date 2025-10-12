// AccountHeader.tsx
import React from 'react';
import { FiBell, FiHelpCircle, FiSettings, FiStar } from 'react-icons/fi'; // Added FiStar
import { MdOutlineVerifiedUser } from 'react-icons/md';
import { Button } from './Button';
import type { User } from './types'; // Changed to type import

interface AccountHeaderProps {
  user: User;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  user,
  onNotificationsClick,
  onSettingsClick
}) => {
  return (
    <div className="bg-gradient-to-r from-[#A52A2A] to-amber-600 py-8 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.username}
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#A52A2A] shadow-md">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-amber-100">{user.email}</p>
              <div className="flex items-center mt-1 space-x-2">
                {user.rating && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center">
                    <FiStar className="mr-1 text-amber-300" size={12} />
                    {user.rating.toFixed(1)} Seller Rating
                  </span>
                )}
                {user.verified && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center">
                    <MdOutlineVerifiedUser className="mr-1 text-green-300" size={12} />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              icon={<FiBell />}
              onClick={onNotificationsClick}
            />
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              icon={<FiHelpCircle />}
            />
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              icon={<FiSettings />}
              onClick={onSettingsClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};