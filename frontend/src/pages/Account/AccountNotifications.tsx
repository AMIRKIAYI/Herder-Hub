// AccountNotifications.tsx
import React from 'react';
import { FiBell } from 'react-icons/fi';
import { Button } from './Button';
import { Notification } from './types';

interface AccountNotificationsProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export const AccountNotifications: React.FC<AccountNotificationsProps> = ({
  notifications,
  onMarkAllAsRead
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Your recent account activity</p>
        </div>
        <Button 
          variant="ghost" 
          className="text-[#A52A2A]"
          onClick={onMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </div>
      
      <div className="space-y-3">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-xl border transition-all ${
              notification.read 
                ? 'bg-white border-gray-200' 
                : 'bg-[#A52A2A]/5 border-[#A52A2A]/20'
            }`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-lg mr-4 ${
                notification.read 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-[#A52A2A]/10 text-[#A52A2A]'
              }`}>
                {notification.icon || <FiBell />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${
                    notification.read ? 'text-gray-700' : 'text-gray-900'
                  }`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {notification.time || new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};