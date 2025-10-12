import React from 'react';
import { FaHandHoldingUsd, FaTruck, FaShieldAlt, FaUserCheck, FaWhatsapp, FaMobile } from 'react-icons/fa';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaHandHoldingUsd className="text-4xl text-[#A52A2A]" />,
      title: "Fair Pricing",
      description: "Get market-value prices without middlemen cuts"
    },
    {
      icon: <FaTruck className="text-4xl text-[#A52A2A]" />,
      title: "Reliable Transport",
      description: "Verified livestock transporters across Northern Kenya"
    },
    {
      icon: <FaShieldAlt className="text-4xl text-[#A52A2A]" />,
      title: "Secure Deals",
      description: "Protected payments through trusted channels"
    },
    {
      icon: <FaUserCheck className="text-4xl text-[#A52A2A]" />,
      title: "Verified Users",
      description: "All traders are authenticated by local authorities"
    },
    {
      icon: <FaWhatsapp className="text-4xl text-[#A52A2A]" />,
      title: "Direct Chat",
      description: "Negotiate directly via WhatsApp"
    },
    {
      icon: <FaMobile className="text-4xl text-[#A52A2A]" />,
      title: "Mobile Access",
      description: "Full marketplace access from any phone"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Marketplace Advantages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 border border-gray-100 rounded-lg hover:border-[#A52A2A] transition-colors duration-300"
            >
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;