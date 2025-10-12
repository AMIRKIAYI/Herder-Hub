import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useAuthForms } from '../../ Auth/useAuthForms';
import AuthModal from '../../ Auth/ AuthModal';
import SignInForm from '../../ Auth/SignInForm';
import RegisterForm from '../../ Auth/RegisterForm';

// Import your livestock images
import image1 from '../../assets/images/livestock1.jpg';
import image2 from '../../assets/images/livestock2.jpg';
import image3 from '../../assets/images/livestock3.jpg';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { isAuthenticated } = useAuth();
  const images = [image1, image2, image3];

  const {
    mode,
    setMode,
    showPassword,
    setShowPassword,
    loading,
    formErrors,
    handleRegister,
    handleLogin,
    closeAll
  } = useAuthForms();

  useEffect(() => {
    // Image rotation interval
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
      // Reset zoom when changing images
      setZoomLevel(1);
    }, 8000);

    // Zoom animation
    const zoomInterval = setInterval(() => {
      setZoomLevel((prevZoom) => {
        return prevZoom === 1 ? 1.1 : 1;
      });
    }, 15000);

    return () => {
      clearInterval(imageInterval);
      clearInterval(zoomInterval);
    };
  }, [images.length]);

  const handleSellClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setMode('signin');
      toast.info('Please sign in to list items for sale');
    }
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToSignIn = () => {
    setMode('signin');
  };

  return (
    <section className="relative bg-[#A52A2A] text-white py-12 md:py-20 px-4">
      {/* Background pattern */}
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
          {/* Left side - Categories */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-[#A52A2A] font-bold mb-4 text-lg">All Categories</h3>
            <ul className="space-y-2">
              {[
                'Cattle',
                'Goats & Sheep',
                'Camels',
                'Poultry',
                'Animal Feeds',
                'Veterinary',
                'Equipment'
              ].map((category) => (
                <li key={category}>
                  <Link 
                    to={`/category/${category.toLowerCase().replace(' & ', '-')}`}
                    className="flex items-center justify-between text-gray-800 hover:text-[#A52A2A] py-2"
                  >
                    <span>{category}</span>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side - Hero content */}
          <div className="flex-1">
            {/* Search bar */}
            <div className="bg-white rounded-full shadow-lg p-1 mb-8">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search for livestock, feeds, equipment..."
                  className="flex-grow py-3 px-6 rounded-full focus:outline-none text-gray-800"
                />
                <button className="bg-[#A52A2A] text-white rounded-full p-3 hover:bg-[#8a2323] transition">
                  <FiSearch className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Hero banner with zoom effect */}
            <div className="relative rounded-lg shadow-lg overflow-hidden h-64 md:h-80">
              <div className="absolute inset-0 overflow-hidden">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundImage: `url(${image})`,
                      transform: `scale(${index === currentImageIndex ? zoomLevel : 1})`,
                      transition: 'opacity 1.5s ease-in-out, transform 15s ease-in-out',
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-[#A52A2A]/70 to-transparent" />
              </div>
              
              <div className="relative h-full flex items-center p-8">
                <div className="max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Northern Kenya's Livestock Marketplace
                  </h2>
                  <p className="text-white text-opacity-90 mb-6">
                    Connect directly with herders and buyers across the region. Quality animals, fair prices.
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      to="/listings" 
                      className="bg-white text-[#A52A2A] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                      Browse Listings
                    </Link>
                    <Link 
                      to="/seller" 
                      onClick={handleSellClick}
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#A52A2A] transition"
                    >
                      Sell Your Livestock
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats banner */}
        <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            {[
              { value: '10,000+', label: 'Livestock Listed' },
              { value: '5,000+', label: 'Verified Sellers' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '24/7', label: 'Support' }
            ].map((stat) => (
              <div key={stat.label} className="px-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {mode && (
        <AuthModal
          mode={mode}
          onClose={closeAll}
          onSwitchMode={() => mode === 'signin' ? setMode('register') : setMode('signin')}
          isMobile={window.matchMedia('(max-width: 767px)').matches}
        >
          {mode === 'signin' ? (
            <SignInForm 
              onSubmit={handleLogin}
              onClose={closeAll}
              onSwitchToRegister={handleSwitchToRegister}
              formErrors={formErrors}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          ) : (
            <RegisterForm 
              onSubmit={handleRegister}
              onClose={closeAll}
              onSwitchToSignIn={handleSwitchToSignIn}
              formErrors={formErrors}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
        </AuthModal>
      )}
    </section>
  );
};

export default HeroSection;