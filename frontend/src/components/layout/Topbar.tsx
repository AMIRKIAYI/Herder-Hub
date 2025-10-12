import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TopBar = () => {
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Adjust dropdown position on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDropdownOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#A52A2A] text-white py-2 px-4 shadow-sm w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Seller Center (hidden on mobile) */}
        <div className="hidden sm:flex items-center space-x-4">
          <a href="/sell" className="flex items-center font-medium hover:text-amber-200 transition-colors text-sm md:text-base">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 md:h-5 md:w-5 mr-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
            {t("Seller Center")}
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Language Selector */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center space-x-1 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 md:h-5 md:w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
                />
              </svg>
              <span className="text-xs md:text-sm font-medium">
                {i18n.language === 'en' ? t("English") : t("Somali")}
              </span>
              <svg 
                className={`h-3 w-3 md:h-4 md:w-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="fixed sm:absolute right-0 sm:right-auto mt-2 w-40 bg-white rounded-md shadow-lg z-[1000] border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-gray-100 text-[#A52A2A]' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {t("English")}
                  </button>
                  <button
                    onClick={() => changeLanguage('so')}
                    className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === 'so' ? 'bg-gray-100 text-[#A52A2A]' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {t("Somali")}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <a 
            href="/download-app" 
            className="flex items-center font-medium hover:text-amber-200 transition-colors text-xs md:text-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 md:h-5 md:w-5 mr-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
            {t("Download App")}
          </a>
          
          <a 
            href="/help-center" 
            className="flex items-center font-medium hover:text-amber-200 transition-colors text-xs md:text-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 md:h-5 md:w-5 mr-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            {t("Help Center")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;