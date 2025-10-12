

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiShoppingCart } from 'react-icons/fi';
import { IoLocationOutline } from 'react-icons/io5';
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

interface Listing {
  _id: string;
  animalType: string;
  breed: string;
  age: string;
  weight: string;
  price: number;
  location: string;
  description: string;
  features: string[];
  healthRecords: Array<{
    date: string;
    type: string;
    details: string;
  }>;
  images: Image[];
  
  // Seller information is stored at the top level, not nested
  seller: string; // This is just the ID
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  preferredContactMethod: string;
  
  rating?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface FilterSectionProps {
  title: string;
  items: string[];
  selectedItems: string[];
  toggleItem: (item: string) => void;
}

interface Image {
  url: string;
  filename: string;
  _id: string;
}

const Marketplace: React.FC = () => {
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 1000, max: 500000 });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Kenyan counties for location dropdown
  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Machakos',
    'Meru', 'Thika', 'Nyeri', 'Marsabit', 'Isiolo', 'Garissa',
    'Wajir', 'Mandera', 'Samburu', 'Turkana', 'Lodwar', 'Moyale'
  ];

  // Livestock categories
  const livestockCategories = [
    'Cattle', 
    'Goats', 
    'Sheep', 
    'Camels', 
    'Donkeys',
    'Poultry'
  ];

  // Breed options
  const cattleBreeds = ['Borana', 'Sahiwal', 'Zebu', 'Friesian', 'Crossbreed'];
  const goatBreeds = ['Galla', 'Boer', 'Toggenburg', 'Saanen'];
  const sheepBreeds = ['Red Maasai', 'Dorper', 'Merino'];
  const camelBreeds = ['Dromedary', 'Bactrian'];
  const donkeyBreeds = ['Somali', 'Nubian'];
  const poultryBreeds = ['Kienyeji', 'Broiler', 'Layer'];

  const getBreedOptions = () => {
    if (selectedCategories.includes('Cattle')) return cattleBreeds;
    if (selectedCategories.includes('Goats')) return goatBreeds;
    if (selectedCategories.includes('Sheep')) return sheepBreeds;
    if (selectedCategories.includes('Camels')) return camelBreeds;
    if (selectedCategories.includes('Donkeys')) return donkeyBreeds;
    if (selectedCategories.includes('Poultry')) return poultryBreeds;
    return [];
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Check for category parameter in URL on component mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && livestockCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Create params object with proper TypeScript typing
        const params: {
          status: string;
          minPrice: number;
          maxPrice: number;
          page: number;
          limit: number;
          animalType?: string;
          breed?: string;
          location?: string;
        } = {
          status: 'active',
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: 1,
          limit: 12
        };

        // Only add filters if they have values (convert arrays to strings)
        if (selectedCategories.length > 0) {
          params.animalType = selectedCategories.join(',');
        }
        
        if (selectedBreeds.length > 0) {
          params.breed = selectedBreeds.join(',');
        }
        
        if (selectedLocations.length > 0) {
          params.location = selectedLocations.join(',');
        }

        console.log('Sending params to backend:', params);

        const response = await axios.get(`${API_BASE_URL}/listings`, {
          params,
          withCredentials: true
        });
        
        setListings(response.data.listings);
      } catch (err) {
        setError('Failed to fetch listings. Please try again later.');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [priceRange, selectedCategories, selectedBreeds, selectedLocations]);

  const toggleCategory = (category: string): void => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    // Reset breeds when category changes
    setSelectedBreeds([]);
    
    // Update URL parameter when category is selected/deselected
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedCategories.includes(category)) {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    setSearchParams(newSearchParams);
  };

  const toggleBreed = (breed: string): void => {
    setSelectedBreeds(prev =>
      prev.includes(breed)
        ? prev.filter(b => b !== breed)
        : [...prev, breed]
    );
  };

  const toggleLocation = (location: string): void => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Math.min(Number(e.target.value), priceRange.max - 1000);
    setPriceRange({ ...priceRange, min: value });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Math.max(Number(e.target.value), priceRange.min + 1000);
    setPriceRange({ ...priceRange, max: value });
  };

  const clearAllFilters = (): void => {
    setSelectedCategories([]);
    setSelectedBreeds([]);
    setSelectedLocations([]);
    setPriceRange({ min: 1000, max: 500000 });
    
    // Clear URL parameters when clearing all filters
    setSearchParams({});
  };

  const formatKES = (amount: number): string => {
    return `KES ${amount.toLocaleString()}`;
  };

  const toggleCartItem = (id: string) => {
    if (cartItems.some(item => item.id === id)) {
      removeFromCart(id);
    } else {
      const listingToAdd = listings.find(listing => listing._id === id);
      if (listingToAdd) {
        addToCart({
          id: listingToAdd._id,
          type: listingToAdd.animalType,
          breed: listingToAdd.breed,
          age: listingToAdd.age,
          weight: listingToAdd.weight,
          price: listingToAdd.price,
          location: listingToAdd.location,
          image: listingToAdd.images[0]?.url || '',
          seller: {
            id: listingToAdd.seller, // This is the seller ID string
            name: listingToAdd.sellerName, // Use the top-level sellerName
            rating: listingToAdd.rating || 0,
            contact: listingToAdd.sellerPhone, // Use the top-level sellerPhone
            animalsSold: 0,
            responseTime: 'Usually responds within 1 day'
          }
        });
      }
    }
  };

  const renderStars = (rating: number = 0): React.ReactElement[] => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(rating) ? 
        <FaStar key={i} className="text-yellow-400 w-4 h-4" /> : 
        <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
    ));
  };

  const FilterSection: React.FC<FilterSectionProps> = ({ 
    title, 
    items, 
    selectedItems, 
    toggleItem 
  }) => {
    return (
      <div>
        <h6 className="text-slate-900 text-sm font-semibold">{title}</h6>
        <div className="flex px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 overflow-hidden mt-2">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}`}
            className="w-full bg-transparent outline-none text-gray-900 text-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 192.904 192.904"
            className="w-3 fill-gray-600"
          >
            <path d="M190.707 180.101l-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0S0 36.423 0 81.193s36.422 81.187 81.191 81.187c19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15s66.191 29.694 66.191 66.193-29.694 66.187-66.191 66.187S15 117.689 15 81.193z" />
          </svg>
        </div>
        <ul className="mt-4 space-y-3 max-h-60 overflow-y-auto">
          {items.map(item => (
            <li key={item} className="flex items-center gap-3">
              <input
                id={item.replace(/\s+/g, '-').toLowerCase()}
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
                className="w-4 h-4 cursor-pointer text-[#A52A2A] focus:ring-[#A52A2A]"
              />
              <label
                htmlFor={item.replace(/\s+/g, '-').toLowerCase()}
                className="text-slate-600 font-medium text-sm cursor-pointer"
              >
                {item}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  interface ProductCardProps {
    listing: Listing;
    formatCurrency: (amount: number) => string;
    inCart: boolean;
    toggleCart: (id: string) => void;
    renderStars: (rating: number) => React.ReactElement[];
  }

  const ProductCard: React.FC<ProductCardProps> = ({ 
    listing, 
    formatCurrency, 
    inCart,
    toggleCart,
    renderStars
  }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getImageUrl = () => {
      if (!listing.images || listing.images.length === 0) return null;
      
      const imagePath = listing.images[0].url;
      
      // Remove any leading slash if present
      const cleanPath = imagePath.startsWith('/') 
        ? imagePath.substring(1) 
        : imagePath;
      
      // Remove /api from base URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
      return `${baseUrl}/${cleanPath}`;
    };

    const handleViewDetails = (): void => {
      navigate(`/product/${listing._id}`);
    };

    const imageUrl = getImageUrl();

    return (
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 w-full h-full"></div>
            </div>
          )}
          
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={`${listing.breed} ${listing.animalType}`}
              className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Failed to load image:', imageUrl);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            
            <button 
              onClick={() => toggleCart(listing._id)}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-sm hover:shadow-md transition-all ${
                inCart ? 'bg-[#A52A2A] text-white' : 'bg-white/90 text-gray-600'
              }`}
              aria-label={inCart ? "Remove from cart" : "Add to cart"}
            >
              <FiShoppingCart className="w-4 h-4" />
              {inCart && (
                <span className="absolute -top-1 -right-1 bg-white text-[#A52A2A] text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
            
            <span className="absolute bottom-3 left-3 bg-[#A52A2A] text-white text-xs px-2.5 py-1 rounded-md font-medium">
              {listing.animalType}
            </span>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2 min-h-[3.5rem]">
              <h3 className="font-bold text-gray-800 line-clamp-2 pr-2">
                {listing.breed} {listing.animalType}
              </h3>
              <p className="text-[#A52A2A] font-bold whitespace-nowrap pl-2">
                {formatCurrency(listing.price)}
              </p>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <IoLocationOutline className="mr-1.5 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
            
            <div className="flex items-center mb-3">
              <div className="flex mr-2">
                {renderStars(listing.rating || 0)}
              </div>
              <span className="text-sm text-gray-600">{(listing.rating || 0).toFixed(1)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 mr-1">Breed:</span>
                <span className="text-gray-600 truncate">{listing.breed}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-gray-700 mr-1">Age:</span>
                <span className="text-gray-600">{listing.age}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-gray-700 mr-1">Weight:</span>
                <span className="text-gray-600">{listing.weight}</span>
              </div>

          <div className="flex items-start">
            <span className="font-medium text-gray-700 mr-1">Seller:</span>
            <span className="text-gray-600 truncate">{listing.sellerName || 'Unknown'}</span>
          </div>
        </div>
        
        <button
          onClick={handleViewDetails}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-[#A52A2A] text-[#A52A2A] rounded-md font-medium hover:bg-[#A52A2A] hover:text-white transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-[#A52A2A] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        >
          <FiFilter className="w-5 h-5" />
        </button>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-end">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSection 
                title="Category"
                items={livestockCategories}
                selectedItems={selectedCategories}
                toggleItem={toggleCategory}
              />
              {selectedCategories.length > 0 && (
                <>
                  <hr className="my-6 border-gray-300" />
                  <FilterSection 
                    title="Breed"
                    items={getBreedOptions()}
                    selectedItems={selectedBreeds}
                    toggleItem={toggleBreed}
                  />
                </>
              )}
              <hr className="my-6 border-gray-300" />
              <FilterSection 
                title="Location"
                items={kenyanCounties}
                selectedItems={selectedLocations}
                toggleItem={toggleLocation}
              />
              <div className="mt-4">
                <h6 className="text-sm font-semibold mb-2">Price Range (KES)</h6>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={handleMinChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={handleMaxChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{formatKES(priceRange.min)}</span>
                    <span>{formatKES(priceRange.max)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 font-semibold"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="bg-[#A52A2A] text-white px-4 py-2 rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        <div className="hidden md:block w-full max-w-[300px] shrink-0 shadow-md px-6 sm:px-8 min-h-screen py-6 bg-white">
          <div className="flex items-center border-b border-gray-300 pb-2 mb-6">
            <h3 className="text-slate-900 text-lg font-semibold">Filters</h3>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-red-500 font-semibold ml-auto cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <FilterSection 
            title="Category"
            items={livestockCategories}
            selectedItems={selectedCategories}
            toggleItem={toggleCategory}
          />

          {selectedCategories.length > 0 && (
            <>
              <hr className="my-6 border-gray-300" />
              <FilterSection 
                title="Breed"
                items={getBreedOptions()}
                selectedItems={selectedBreeds}
                toggleItem={toggleBreed}
              />
            </>
          )}

          <hr className="my-6 border-gray-300" />

          <FilterSection 
            title="Location"
            items={kenyanCounties}
            selectedItems={selectedLocations}
            toggleItem={toggleLocation}
          />

          <hr className="my-6 border-gray-300" />

          <div>
            <h6 className="text-sm font-semibold mb-2">Price Range (KES)</h6>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={handleMinChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={handleMaxChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>{formatKES(priceRange.min)}</span>
                <span>{formatKES(priceRange.max)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#A52A2A] mb-6">Livestock Marketplace</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ProductCard 
                key={listing._id} 
                listing={listing}
                formatCurrency={formatKES} 
                inCart={cartItems.some(item => item.id === listing._id)}
                toggleCart={toggleCartItem}
                renderStars={renderStars}
              />
            ))}
          </div>

          {listings.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings found matching your filters</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 text-[#A52A2A] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {listings.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button className="bg-amber-300 hover:bg-amber-400 text-[#A52A2A] font-semibold px-6 py-3 rounded-md transition-colors">
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;