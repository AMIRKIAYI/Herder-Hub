// AccountOverview.tsx
import React from 'react';
import { FiStar, FiUsers, FiMessageSquare, FiCheck, FiUpload } from 'react-icons/fi';
import { GiCow } from 'react-icons/gi';
import { MdOutlineVerifiedUser, MdHealthAndSafety } from 'react-icons/md';
import { ProfileCard } from './ProfileCard';
import { StatCard } from './StatCard';
import { Button } from './Button';
import type { User, Listing, Connection, Message } from './types';

interface AccountOverviewProps {
  user: User;
  listings: Listing[];
  connections: Connection[];
  messages: Message[];
  onEditProfile: () => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  user,
  listings,
  connections,
  messages,
  onEditProfile
}) => {
  return (
    <>
      <ProfileCard 
        user={user} 
        onEditClick={onEditProfile} 
      />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Listings" 
          value={listings.filter(l => l.status === 'available').length} 
          icon={<GiCow />}
          trend="+2 this month"
          trendPositive={true}
        />
        <StatCard 
          title="Connections" 
          value={connections.length} 
          icon={<FiUsers />}
          trend="+5 this week"
          trendPositive={true}
        />
        <StatCard 
          title="Response Rate" 
          value={`${connections.length > 0 ? Math.round((connections.filter(c => c.status === 'responded' || c.status === 'completed').length / connections.length) * 100) : 0}%`} 
          icon={<FiMessageSquare />}
          trend="↑ 12% from last month"
          trendPositive={true}
        />
        <StatCard 
          title="Avg. Rating" 
          value={user.rating ? user.rating.toFixed(1) : 'N/A'} 
          icon={<FiStar />}
          trend={user.rating ? "↑ 0.2 this year" : undefined}
          trendPositive={user.rating ? true : undefined}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600">Your latest connections and interactions</p>
          </div>
          <Button variant="ghost" className="text-[#A52A2A]">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {connections.slice(0, 2).map(connection => (
            <div key={connection.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    connection.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : connection.status === 'responded'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-amber-100 text-amber-600'
                  }`}>
                    <FiUsers />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Connected with {connection.sellerName}</h3>
                    <p className="text-sm text-gray-500">
                      {connection.listingType} • {new Date(connection.lastContact).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 capitalize">{connection.status}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    connection.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : connection.status === 'responded'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {connection.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {messages.slice(0, 1).map(message => (
            <div key={message.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiMessageSquare />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">New message from {message.sender}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{message.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {message.time || new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                  {!message.read && (
                    <span className="inline-block h-2 w-2 rounded-full bg-[#A52A2A] mt-1"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {user.role === 'seller' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start">
              <div className={`p-3 rounded-lg mr-4 ${
                user.verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {user.verified ? <MdOutlineVerifiedUser size={24} /> : <MdHealthAndSafety size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.verified ? 'Verified Seller' : 'Seller Verification'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {user.verified 
                    ? 'Your verified status helps build trust with potential buyers' 
                    : 'Complete verification to access all seller features'}
                </p>
                {!user.verified && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button icon={<FiUpload />}>
                      Upload Documents
                    </Button>
                    <Button variant="ghost" className="text-[#A52A2A]">
                      Learn More
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {user.verified && (
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <FiCheck className="mr-1" /> Verified
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};