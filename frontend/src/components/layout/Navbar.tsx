import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiMessageSquare, FiPackage, FiSettings } from 'react-icons/fi';
import { GiCow, GiChicken, GiSheep, GiCamel, GiWheat } from 'react-icons/gi';
import { FaHorseHead, FaSyringe, FaTractor } from 'react-icons/fa';
import { MdAnalytics } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthForms } from '../../ Auth/useAuthForms';
import SignInForm from '../../ Auth/SignInForm';
import RegisterForm from '../../ Auth/RegisterForm';
import AuthModal from '../../ Auth/ AuthModal';
import axios from 'axios';


const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [connectCount, setConnectCount] = useState(0);

  
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

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setShowAccountDropdown(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch connection count
 useEffect(() => {
  const fetchConnectCount = async () => {
    if (isAuthenticated) {
      try {
        const response = await axios.get(`${API_BASE_URL}/connects/count`, {
          withCredentials: true
        });
        setConnectCount(response.data.count);
      } catch (error) {
        console.error('Error fetching connect count:', error);
      }
    }
  };
  
  fetchConnectCount();
}, [isAuthenticated]);





  const handleSellClick = () => {
    if (isAuthenticated) {
      navigate('/sell');
    } else {
      setMode('signin');
      setShowAccountDropdown(false);
      setMobileMenuOpen(false);
      toast.info('Please sign in to list items for sale');
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/marketplace?category=${encodeURIComponent(category)}`);
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  useEffect(() => {
    if (mode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mode]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { name: 'Cattle', icon: <GiCow className="mr-1" /> },
    { name: 'Goats', icon: <GiSheep className="mr-1" /> },
    { name: 'Camels', icon: <GiCamel className="mr-1" /> },
    { name: 'Donkeys', icon: <FaHorseHead className="mr-1" /> },
    { name: 'Poultry', icon: <GiChicken className="mr-1" /> },
    { name: 'Sheep', icon: <GiSheep className="mr-1" /> },
    { name: 'Animal Feeds', icon: <GiWheat className="mr-1" /> },
    { name: 'Veterinary', icon: <FaSyringe className="mr-1" /> },
    { name: 'Equipment', icon: <FaTractor className="mr-1" /> },
    { name: 'Market Info', icon: <MdAnalytics className="mr-1" /> }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowAccountDropdown(false);
      setMobileMenuOpen(false);
      setConnectCount(0);

      
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Auth Forms */}
      {isMobile && mode === 'signin' && (
        <SignInForm
          onSubmit={handleLogin}
          onClose={closeAll}
          onSwitchToRegister={() => setMode('register')}
          formErrors={formErrors}
          loading={loading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isMobile={true}
        />
      )}

      {isMobile && mode === 'register' && (
        <RegisterForm
          onSubmit={handleRegister}
          onClose={closeAll}
          onSwitchToSignIn={() => setMode('signin')}
          formErrors={formErrors}
          loading={loading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isMobile={true}
        />
      )}

      {!isMobile && mode && (
        <AuthModal
          mode={mode}
          onClose={closeAll}
          onSwitchMode={(newMode) => setMode(newMode)}
        >
          {mode === 'signin' ? (
            <SignInForm
              onSubmit={handleLogin}
              onClose={closeAll}
              onSwitchToRegister={() => setMode('register')}
              formErrors={formErrors}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              onClose={closeAll}
              onSwitchToSignIn={() => setMode('signin')}
              formErrors={formErrors}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
        </AuthModal>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#A52A2A]">
              <span className="border-2 border-[#A52A2A] px-2 rounded-md mr-1">H</span>
              <span>erder</span>
              <span className="text-amber-300">Hub</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search livestock, feeds, equipment..."
                className="w-full py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent"
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-[#A52A2A] text-white rounded-r-md hover:bg-[#8a2323] transition-colors">
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/marketplace" className="text-gray-700 hover:text-[#A52A2A] font-medium">
              Marketplace
            </Link>

            {/* Connections link - only shown when authenticated */}
            {isAuthenticated && (
              <Link to="/connects" className="text-gray-700 hover:text-[#A52A2A] font-medium flex items-center relative">
  Connects
  {connectCount > 0 && (
    <span className="absolute -top-2 -right-4 bg-[#A52A2A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {connectCount}
    </span>
  )}
</Link>
            )}
          
            <div className="relative">
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-[#A52A2A] flex items-center"
                onClick={() => {
                  setShowAccountDropdown(false);
                  setMobileMenuOpen(false);
                }}
              >
                <FiShoppingCart className="h-5 w-5" />
                <span className="ml-1">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="relative" ref={accountDropdownRef}>
              <button 
                className="text-gray-700 hover:text-[#A52A2A] flex items-center"
                onMouseEnter={() => !isMobile && setShowAccountDropdown(true)}
                onClick={() => {
                  if (isMobile) {
                    setShowAccountDropdown(!showAccountDropdown);
                  } else if (isAuthenticated) {
                    navigate('/account');
                    setShowAccountDropdown(false);
                  } else {
                    setMode('signin');
                  }
                }}
              >
                <FiUser className="h-5 w-5" />
                <span className="ml-1">Account</span>
              </button>
              
              {showAccountDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden"
                  onMouseLeave={() => !isMobile && setShowAccountDropdown(false)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A52A2A] to-amber-300"></div>
                  {isAuthenticated ? (
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">Hi, {user?.username}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      </div>
                      <Link
                        to="/account/messages"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <FiMessageSquare className="mr-2" />
                        Messages
                      </Link>
                      <Link
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <FiSettings className="mr-2" />
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 px-2">
                      <button
                        onClick={() => {
                          setMode('signin');
                          if (isMobile) setShowAccountDropdown(false);
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#A52A2A] to-amber-600 rounded-md hover:from-[#8a2323] hover:to-amber-700 transition-all duration-300 shadow-md"
                      >
                        <FiUser className="mr-2" />
                        Sign In
                      </button>
                      <div className="mt-3 text-center text-xs text-gray-500">or</div>
                      <button
                        onClick={() => {
                          setMode('register');
                          if (isMobile) setShowAccountDropdown(false);
                        }}
                        className="w-full text-center px-4 py-2 text-sm font-medium text-[#A52A2A] hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={handleSellClick}
              className="bg-amber-300 hover:bg-amber-400 text-white px-8 py-2 rounded-md font-sans font-bold uppercase tracking-wider transition-colors"
            >
              Sell
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#A52A2A]"
            >
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-3 px-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search livestock..."
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent"
            />
            <button className="absolute right-3 top-2 text-gray-500">
              <FiSearch className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-amber-50 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-6 py-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="whitespace-nowrap text-[#A52A2A] hover:text-amber-700 text-sm font-medium flex items-center"
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mobileMenuOpen && !mode && (
        <div className="md:hidden bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/marketplace" 
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              
              {/* Connections link in mobile menu - only shown when authenticated */}
              {isAuthenticated && (
                <Link to="/connects" className="text-gray-700 hover:text-[#A52A2A] font-medium flex items-center relative">
  Connects
  {connectCount > 0 && (
    <span className="absolute -top-2 -right-4 bg-[#A52A2A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {connectCount}
    </span>
  )}
</Link>
              )}

              <button 
                className="text-gray-700 hover:text-[#A52A2A] font-medium py-2 flex items-center"
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              >
                Categories
                <svg 
                  className={`ml-2 h-4 w-4 transition-transform ${mobileCategoriesOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileCategoriesOpen && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className="text-gray-700 hover:text-[#A52A2A] text-sm font-medium flex items-center py-1"
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <Link 
                  to="/cart" 
                  className="text-gray-700 hover:text-[#A52A2A] font-medium flex items-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="ml-2 bg-amber-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">ACCOUNT</h3>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account/messages"
                      className="flex items-center text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiMessageSquare className="h-5 w-5 mr-2" />
                      Messages
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiSettings className="h-5 w-5 mr-2" />
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-gray-700 hover:text-[#A52A2A] font-medium py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMode('signin');
                      }}
                      className="flex items-center text-gray-700 hover:text-[#A52A2A] font-medium py-2 w-full"
                    >
                      <FiUser className="h-5 w-5 mr-2" />
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMode('register');
                      }}
                      className="flex items-center text-gray-700 hover:text-[#A52A2A] font-medium py-2 w-full"
                    >
                      <FiUser className="h-5 w-5 mr-2" />
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;