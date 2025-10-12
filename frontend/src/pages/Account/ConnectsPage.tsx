import React, { useState, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiPhone, 
  FiMail, 
  FiArrowRight, 
  FiClock,
  FiFilter,
  FiSearch,
  FiPlus,
  FiUser,
  FiStar,
  FiRefreshCw,
  FiImage
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Connect {
  _id: string;
  userId: string;
  listingId: string | {
    _id: string;
    animalType: string;
    breed: string;
    price: number;
    images: Array<{
      url: string;
      filename: string;
      _id: string;
    }>;
    seller: string;
    sellerName: string;
    sellerEmail: string;
    sellerPhone: string;
    preferredContactMethod: string;
    rating?: number;
    location: string;
  };
  sellerId: string;
  contactMethod: string;
  status: 'pending' | 'responded' | 'completed' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Listing {
  _id: string;
  animalType: string;
  breed: string;
  price: number;
  images: Array<{
    url: string;
    filename: string;
    _id: string;
  }>;
  seller: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  preferredContactMethod: string;
  rating?: number;
  location: string;
}

const ConnectsPage = () => {
  const [connects, setConnects] = useState<Connect[]>([]);
  const [listings, setListings] = useState<{[key: string]: Listing}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchConnects();
  }, []);

  const fetchConnects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/connects`, {
        withCredentials: true
      });
      
      const connectsData: Connect[] = response.data;
      setConnects(connectsData);
      
      // Check if listing data is already populated or if we need to fetch it
      const connectsNeedingListingData = connectsData.filter(connect => 
        typeof connect.listingId === 'string'
      );
      
      if (connectsNeedingListingData.length > 0) {
        // Fetch listing details for connects that don't have populated data
        const listingIds: string[] = [...new Set(connectsNeedingListingData.map(connect => 
          connect.listingId as string
        ))];
        await fetchListings(listingIds);
      } else {
        // Listing data is already populated, create listings map from connect data
        const listingsMap: {[key: string]: Listing} = {};
        connectsData.forEach(connect => {
          if (typeof connect.listingId !== 'string') {
            listingsMap[connect.listingId._id] = connect.listingId;
          }
        });
        setListings(listingsMap);
      }
      
    } catch (error) {
      console.error('Error fetching connects:', error);
      toast.error('Failed to load connects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchListings = async (listingIds: string[]) => {
    try {
      const listingsMap: {[key: string]: Listing} = {};
      
      // Fetch each listing individually
      for (const listingId of listingIds) {
        try {
          const response = await axios.get(`${API_BASE_URL}/listings/${listingId}`, {
            withCredentials: true
          });
          listingsMap[listingId] = response.data;
        } catch (error) {
          console.error(`Error fetching listing ${listingId}:`, error);
        }
      }
      
      setListings(listingsMap);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = API_BASE_URL?.replace('/api', '') || '';
    
    return `${baseUrl}/${cleanPath}`;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConnects();
  };

  const getListingData = (connect: Connect): Listing | null => {
    if (typeof connect.listingId === 'string') {
      // Listing ID is a string, get from listings map
      return listings[connect.listingId] || null;
    } else {
      // Listing data is already populated in the connect
      return connect.listingId;
    }
  };

  const handleContact = (connect: Connect) => {
    const listing = getListingData(connect);
    if (!listing) {
      toast.error('Could not find listing details');
      return;
    }

    switch (connect.contactMethod) {
      case 'call':
        window.location.href = `tel:${listing.sellerPhone}`;
        break;
      case 'whatsapp':
        const phone = listing.sellerPhone.startsWith('+') ? 
          listing.sellerPhone : `+254${listing.sellerPhone}`;
        window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:${listing.sellerEmail}`;
        break;
      default:
        toast.info(`Messaging ${listing.sellerName}`);
    }
  };

  const updateConnectStatus = async (connectId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/connects/${connectId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update the local state
      setConnects(prevConnects => 
        prevConnects.map(connect => 
          connect._id === connectId ? response.data : connect
        )
      );
      
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating connect status:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'message': return <FiMessageSquare className="text-blue-500" />;
      case 'call': return <FiPhone className="text-green-500" />;
      case 'whatsapp': return <FaWhatsapp className="text-green-500" />;
      case 'email': return <FiMail className="text-red-500" />;
      default: return <FiMessageSquare />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConnects = connects.filter(connect => {
    const listing = getListingData(connect);
    if (!listing) return false;
    
    const matchesFilter = filter === 'all' || connect.status === filter;
    const matchesSearch = searchTerm === '' || 
      listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getContactMethodText = (method: string) => {
    switch (method) {
      case 'message': return 'Message';
      case 'call': return 'Phone Call';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      default: return method;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A52A2A]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#A52A2A]">My Connects</h1>
            <p className="text-gray-600 mt-1">People you've contacted about livestock</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="px-4 py-2 bg-[#A52A2A] text-white rounded-md hover:bg-[#8a2323] flex items-center">
              <FiPlus className="mr-2" />
              New Connect
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search connects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A52A2A] focus:border-[#A52A2A]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#A52A2A] focus:border-[#A52A2A]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-[#A52A2A]">{connects.length}</div>
            <div className="text-sm text-gray-600">Total Connects</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {connects.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {connects.filter(c => c.status === 'responded' || c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Responded</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {connects.filter(c => c.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {filteredConnects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No matches found' : 'No connects yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start connecting with sellers to see your connects here'
              }
            </p>
            <button className="px-4 py-2 bg-[#A52A2A] text-white rounded-md hover:bg-[#8a2323]">
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConnects.map(connect => {
              const listing = getListingData(connect);
              if (!listing) return null;
              
              const imageUrl = listing.images && listing.images.length > 0 
                ? getImageUrl(listing.images[0].url) 
                : null;
              
              return (
                <div key={connect._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start">
                      {/* Listing Image */}

<div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
  <div className="h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center relative">
    {imageUrl ? (
      <>
        <img
          src={imageUrl}
          alt={listing.animalType}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide the failed image and show the fallback
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex';
            }
          }}
        />
        <div 
          className="image-fallback hidden h-full w-full flex items-center justify-center absolute inset-0"
        >
          <FiImage className="h-12 w-12 text-gray-400" />
        </div>
      </>
    ) : (
      <div className="h-full w-full flex items-center justify-center">
        <FiImage className="h-12 w-12 text-gray-400" />
      </div>
    )}
  </div>
</div>

                      {/* Connect Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {listing.animalType} - {listing.breed}
                            </h3>
                            <p className="text-[#A52A2A] font-bold text-lg mt-1">
                              KES {listing.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(connect.status)}`}>
                              {connect.status.charAt(0).toUpperCase() + connect.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <FiUser className="text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{listing.sellerName}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                  {listing.rating && (
                                    <>
                                      <FiStar className="text-amber-400 mr-1" />
                                      <span className="mr-2">{listing.rating.toFixed(1)}</span>
                                    </>
                                  )}
                                  {listing.location && (
                                    <span>{listing.location}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 flex items-center">
                                {getContactIcon(connect.contactMethod)}
                                <span className="ml-1">{getContactMethodText(connect.contactMethod)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {connect.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Your note: </span>
                              {connect.notes}
                            </p>
                          </div>
                        )}

                        {/* Status Update and Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Update status:</span>
                            <select 
                              value={connect.status}
                              onChange={(e) => updateConnectStatus(connect._id, e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="responded">Responded</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiClock className="mr-1" />
                              <span>Connected on {formatDate(connect.createdAt)}</span>
                            </div>
                            <button
                              onClick={() => handleContact(connect)}
                              className="flex items-center text-sm text-[#A52A2A] hover:text-[#8a2323] ml-4"
                            >
                              Contact Again
                              <FiArrowRight className="ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectsPage;