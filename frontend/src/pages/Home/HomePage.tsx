import React, { useState, useEffect } from 'react';
import { GiCow, GiSheep, GiCamel, GiChicken } from 'react-icons/gi';
import { FaHorseHead, FaRegStar, FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiMenu, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { IoLocationOutline } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import FeaturesSection from '../../components/layout/FeaturesSection';
import LocalConnectSection from '../../components/layout/LocalConnectSection';
import SignInForm from '../../ Auth/SignInForm';
import type { AuthFormData } from '../../ Auth/types';
import type { FormErrors } from '../../ Auth/types';
import axios from 'axios';

// Import local images
import herdCowsSunset from "../../assets/images/herd-cows-sunset.jpg";
import herdCowsNumber1 from "../../assets/images/herd-cows-number1.jpg";
import cattleMorningLight from "../../assets/images/cattle-morning-light.jpg";

// Interface for listing data from API
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
  seller: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  preferredContactMethod: string;
  rating?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Image {
  url: string;
  filename: string;
  _id: string;
}

const HomePage = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: ''
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const categories = [
    { name: 'Cattle', icon: <GiCow className="text-3xl" />, value: 'Cattle' },
    { name: 'Goats', icon: <GiSheep className="text-3xl" />, value: 'Goats' },
    { name: 'Camels', icon: <GiCamel className="text-3xl" />, value: 'Camels' },
    { name: 'Donkeys', icon: <FaHorseHead className="text-3xl" />, value: 'Donkeys' },
    { name: 'Poultry', icon: <GiChicken className="text-3xl" />, value: 'Poultry' },
  ];

  // Hero section images (these are just for the background of the hero section)
  const heroImages =[
    herdCowsSunset,
    herdCowsNumber1,
    cattleMorningLight
  ]

  useEffect(() => {
    const loadImages = heroImages.map((src) => {
      const img = new Image();
      img.src = src;
      return new Promise((resolve) => {
        img.onload = resolve;
      });
    });

    Promise.all(loadImages).then(() => {
      setImagesLoaded(true);
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    });
  }, [heroImages.length]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true);
        
        // Create params object with proper TypeScript typing
        const params: {
          status: string;
          page: number;
          limit: number;
        } = {
          status: 'active',
          page: 1,
          limit: 12 // Fetch more than 4 to have some buffer, but we'll only display 4
        };

        const response = await axios.get(`${API_BASE_URL}/listings`, {
          params,
          withCredentials: true
        });
        
        // Take only the first 4 listings
        setListings(response.data.listings.slice(0, 4) || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Fallback to empty array if API fails
        setListings([]);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, [API_BASE_URL]);

  const toggleCart = (id: string) => {
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
            id: listingToAdd.seller,
            name: listingToAdd.sellerName,
            rating: listingToAdd.rating || 0,
            contact: listingToAdd.sellerPhone,
            animalsSold: 0,
            responseTime: 'Usually responds within 1 day'
          }
        });
      }
    }
  };

  const renderStars = (rating: number = 0) => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(rating) ? 
        <FaStar key={i} className="text-yellow-400 w-4 h-4" /> : 
        <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
    ));
  };

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (isAuthenticated) {
      navigate('/sell');
    } else {
      setShowSignInForm(true);
    }
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to marketplace with the category as a query parameter
    navigate(`/marketplace?category=${encodeURIComponent(category)}`);
  };

  const handleSignInSubmit = async (formData: AuthFormData) => {
    try {
      setFormErrors({ email: '', password: '' });
      
      const loginData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe ?? false
      };
      
      await login(loginData);
      setShowSignInForm(false);
      navigate('/sell');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors({
          email: error.response.data.errors.email?.[0] || '',
          password: error.response.data.errors.password?.[0] || ''
        });
      } else if (error.message) {
        setFormErrors({
          email: '',
          password: 'Invalid email or password'
        });
      } else {
        setFormErrors({
          email: '',
          password: 'Login failed. Please try again.'
        });
      }
    }
  };

  const getImageUrl = (listing: Listing) => {
    if (!listing.images || listing.images.length === 0) {
      // Fallback image if no image is available
      return "https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80";
    }
    
    const imagePath = listing.images[0].url;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  };

  const formatKES = (amount: number): string => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-amber-50 text-[#A52A2A] shadow-md mt-20"
        >
          <FiMenu className="h-6 w-6" />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#A52A2A] text-white py-16 md:py-24 px-4">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-repeat" 
            style={{ 
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjAgMjBINDBNMjAgNjBINDBNMjAgMTAwSDQwTTYwIDIwSDgwTTYwIDYwSDgwTTYwIDEwMEg4ME0xMDAgMjBIMTIwTTEwMCA2MEgxMjBNMTAwIDEwMEgxMjAiIHN0cm9rZT0iI0E1MkEyQSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')" 
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-lg p-0 border border-gray-200 md:ml-5 fixed md:static inset-0 z-40 mt-16 md:mt-0 overflow-y-auto`}>
              <div className="bg-amber-50 px-4 py-3 border-b border-gray-200 flex items-center sticky top-0">
                <FiMenu className="h-5 w-5 text-[#A52A2A] mr-2" />
                <h3 className="text-[#A52A2A] font-bold text-lg">All Categories</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {[
                  'Cattle',
                  'Goats', 
                  'Sheep',
                  'Camels',
                  'Poultry',
                  'Animal Feeds',
                  'Veterinary',
                  'Equipment'
                ].map((category) => (
                  <li key={category} className="hover:bg-gray-50">
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-between text-gray-800 hover:text-[#A52A2A] px-4 py-3 transition-colors duration-200"
                    >
                      <span>{category}</span>
                      <FiChevronRight className="text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero Content */}
            <div className="flex-1">
              <div className="rounded-lg shadow-lg overflow-hidden">
                <div 
                  className={`h-64 md:h-80 flex items-center p-8 relative transition-opacity duration-500 ${
                    imagesLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(165, 42, 42, 0.7), rgba(165, 42, 42, 0.3)), url(${heroImages[currentImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="max-w-lg relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Northern Kenya's Livestock Marketplace
                    </h2>
                    <p className="text-white text-opacity-90 mb-6">
                      Connect directly with herders and buyers across the region. Quality animals, fair prices.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        to="/MarketPlace" 
                        className="bg-white text-[#A52A2A] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 shadow-md"
                      >
                        Browse Listings
                      </Link>
                      <button 
                        onClick={handleSellClick}
                        className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#A52A2A] transition-colors duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Checking...' : 'Sell Your Livestock'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Listings Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800">
                <span className="text-[#A52A2A]">Latest</span> Livestock Listings
              </h3>
              <Link 
                to="/marketplace" 
                className="flex items-center text-[#A52A2A] hover:text-[#8a2323] font-medium transition-colors"
              >
                View All
                <FiArrowRight className="ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {loadingListings ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A52A2A]"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No listings available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getImageUrl(listing)} 
                        alt={`${listing.breed} ${listing.animalType}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      
                      <button 
                        onClick={() => toggleCart(listing._id)}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-sm hover:shadow-md transition-all ${
                          cartItems.some(item => item.id === listing._id) ? 'bg-[#A52A2A] text-white' : 'bg-white/90 text-gray-600'
                        }`}
                        aria-label={cartItems.some(item => item.id === listing._id) ? "Remove from cart" : "Add to cart"}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        {cartItems.some(item => item.id === listing._id) && (
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
                          {formatKES(listing.price)}
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
                      
                      <Link 
                        to={`/product/${listing._id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-[#A52A2A] text-[#A52A2A] rounded-md font-medium hover:bg-[#A52A2A] hover:text-white transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.value)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center group"
            >
              <span className="text-[#A52A2A] mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">How HerderHub Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Account', desc: 'Register as buyer or seller' },
            { step: '2', title: 'Browse or List', desc: 'Find livestock or create listings' },
            { step: '3', title: 'Connect & Transact', desc: 'Message and complete purchases' }
          ].map((item) => (
            <div key={item.step} className="text-center p-6 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-[#A52A2A] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <h3 className="font-bold mb-2 text-gray-800 text-lg">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <FeaturesSection />
      <LocalConnectSection />

      {/* SignInForm Modal */}
      {showSignInForm && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#A52A2A] to-amber-300" />
              <SignInForm 
                onSubmit={handleSignInSubmit}
                onClose={() => setShowSignInForm(false)}
                onSwitchToRegister={() => {
                  setShowSignInForm(false);
                  navigate('/register');
                }}
                formErrors={formErrors}
                loading={isLoading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;