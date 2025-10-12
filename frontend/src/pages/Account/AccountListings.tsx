// AccountListings.tsx
import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { GiCow, GiSheep } from 'react-icons/gi';
import { FaTractor, FaRegChartBar } from 'react-icons/fa';
import { StatCard } from './StatCard';
import { Button } from './Button';
import { ListingCard } from './ListingCard';
import { Listing } from './types';

interface AccountListingsProps {
  listings: Listing[];
  onNewListing: () => void;
}

export const AccountListings: React.FC<AccountListingsProps> = ({
  listings,
  onNewListing
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
          <p className="text-gray-600">Manage your livestock and equipment listings</p>
        </div>
        <div className="flex space-x-3">
          <Button icon={<GiSheep />} variant="outline">
            Livestock
          </Button>
          <Button icon={<FaTractor />} variant="outline">
            Equipment
          </Button>
          <Button icon={<FiPlus />} className="hidden sm:flex" onClick={onNewListing}>
            New Listing
          </Button>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Active Listings" 
          value={listings.filter(l => l.status === 'available').length} 
          icon={<GiCow />}
          trend="+2 this month"
          trendPositive={true}
        />
        <StatCard 
          title="Total Views" 
          value={listings.reduce((sum, l) => sum + l.views, 0)} 
          icon={<FaRegChartBar />}
          trend="↑ 12% from last month"
          trendPositive={true}
        />
        <StatCard 
          title="Pending Approval" 
          value={listings.filter(l => l.status === 'pending').length} 
          icon={<FiCheck />}
          trend="1 needs attention"
          trendPositive={false}
          className="bg-amber-50 border-amber-200"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};