// AccountConnections.tsx
import React from 'react';
import { FiUsers, FiMessageSquare, FiBell, FiHeart } from 'react-icons/fi';
import { StatCard } from './StatCard';
import { Button } from './Button';
import { ConnectionCard } from './ConnectionCard';
import { Connection } from './types';

interface AccountConnectionsProps {
  connections: Connection[];
  onFollowUp: (connectionId: string) => void;
}

export const AccountConnections: React.FC<AccountConnectionsProps> = ({
  connections,
  onFollowUp
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Connections</h2>
          <p className="text-gray-600">People you've contacted about livestock</p>
        </div>
        <div className="flex space-x-3">
          <Button icon={<FiUsers />} variant="outline">
            All Sellers
          </Button>
          <Button icon={<FiHeart />} variant="outline">
            Favorites
          </Button>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Connections" 
          value={connections.length} 
          icon={<FiUsers />}
          trend="+5 this week"
          trendPositive={true}
        />
        <StatCard 
          title="Responded" 
          value={connections.filter(c => c.status === 'responded' || c.status === 'completed').length} 
          icon={<FiMessageSquare />}
          trend="65% response rate"
          trendPositive={true}
        />
        <StatCard 
          title="Need Follow-up" 
          value={connections.filter(c => c.status === 'pending').length} 
          icon={<FiBell />}
          trend="3 waiting for response"
          trendPositive={false}
          className="bg-amber-50 border-amber-200"
        />
      </div>
      
      <div className="space-y-4">
        {connections.map(connection => (
          <ConnectionCard 
            key={connection.id} 
            connection={connection} 
            onFollowUp={onFollowUp}
          />
        ))}
      </div>
    </div>
  );
};