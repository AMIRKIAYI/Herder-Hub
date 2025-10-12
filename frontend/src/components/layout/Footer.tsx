import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { BsWhatsapp, BsShieldCheck } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-[#A52A2A] text-amber-50 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo and Brand Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-6 md:mb-0">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-white">
                <span className="border-2 border-white px-2 rounded-md mr-1">H</span>
                <span>erder</span>
                <span className="text-amber-200">Hub</span>
              </a>
            </div>
            <p className="mt-3 max-w-md text-amber-100">
              Northern Kenya's premier livestock marketplace connecting buyers and sellers.
            </p>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm border border-amber-200 rounded-lg px-4 py-3">
            <BsShieldCheck className="text-2xl text-amber-200 mr-2" />
            <div>
              <p className="font-medium text-white">Trusted Marketplace</p>
              <p className="text-xs text-amber-100">Verified traders only</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 border-t border-amber-200/30 pt-8">
          
          {/* Quick Links */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-amber-200 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Browse Listings', 'Sell Livestock', 'Market Prices', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-amber-200 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-amber-200 rounded-full mr-2"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-amber-200 pb-2 inline-block">Our Services</h3>
            <ul className="space-y-3">
              {['Livestock Trading', 'Transport Logistics', 'Veterinary Connect', 'Feed Suppliers', 'Insurance'].map((service) => (
                <li key={service}>
                  <a href="#" className="hover:text-amber-200 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-amber-200 rounded-full mr-2"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-amber-200 pb-2 inline-block">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0 text-amber-200" />
                <span>Isiolo, Northern Kenya</span>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="mr-3 flex-shrink-0 text-amber-200" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center">
                <BsWhatsapp className="mr-3 flex-shrink-0 text-amber-200" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-3 flex-shrink-0 text-amber-200" />
                <span>contact@herderhub.co.ke</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-amber-200 pb-2 inline-block">Stay Connected</h3>
            <div className="flex space-x-4 mb-6">
              {[
                { icon: <FaFacebookF />, color: 'hover:text-amber-200' },
                { icon: <FaTwitter />, color: 'hover:text-amber-200' },
                { icon: <FaInstagram />, color: 'hover:text-amber-200' },
                { icon: <FaLinkedin />, color: 'hover:text-amber-200' }
              ].map((social, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className={`text-white ${social.color} transition-colors text-xl`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-amber-200/20">
              <p className="text-sm mb-2 text-white">Subscribe for market updates</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-white/20 text-white px-3 py-2 rounded-l-md text-sm flex-grow focus:outline-none focus:ring-1 focus:ring-amber-200 placeholder-amber-100"
                />
                <button className="bg-amber-200 hover:bg-amber-300 text-[#A52A2A] px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-amber-200/30 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0 text-amber-100">
            © {new Date().getFullYear()} HerderHub. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="#" className="text-amber-100 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-amber-100 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-amber-100 hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;