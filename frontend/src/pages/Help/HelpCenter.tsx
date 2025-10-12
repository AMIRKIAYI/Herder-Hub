import React, { useState } from 'react';
import { 
  FiMail, 
  FiMessageSquare, 
  FiUser,
  FiDollarSign,
  FiTruck,
  FiShield,
  FiHelpCircle,
  FiChevronRight,
  FiPhone,
  FiClock
} from 'react-icons/fi';

type SectionKey = 'buying' | 'selling' | 'transactions' | 'safety';

interface FAQItem {
  question: string;
  answer: string;
}

interface SectionContent {
  title: string;
  faqs: FAQItem[];
  description: string;
}

const HelpCenter = () => {
  const [activeSection, setActiveSection] = useState<SectionKey>('buying');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections: Record<SectionKey, SectionContent> = {
    buying: {
      title: "Buying Livestock",
      description: "Guidance for buyers looking for quality livestock",
      faqs: [
        {
          question: "How do I find quality animals?",
          answer: "Use our search filters to find animals by type, age, location, and health status. Check seller ratings and request veterinary certificates before purchasing."
        },
        {
          question: "What payment options are safest?",
          answer: "We recommend using our escrow service - funds are only released to the seller after you confirm receipt of healthy animals. M-Pesa and cash-on-delivery are also popular options."
        },
        {
          question: "How can I verify a seller's credibility?",
          answer: "Check for seller verification badges, review their transaction history, and read feedback from previous buyers. Established sellers will have more complete profiles."
        }
      ]
    },
    selling: {
      title: "Selling Livestock",
      description: "Tips for sellers to successfully market their animals",
      faqs: [
        {
          question: "How do I create an effective listing?",
          answer: "Include clear photos from multiple angles, accurate measurements (age, weight), vaccination records, and honest descriptions. Highlight unique qualities of your animals."
        },
        {
          question: "When will I receive payment?",
          answer: "For escrow transactions: after buyer confirms receipt. For direct deals: as agreed with buyer (we recommend cash on delivery for local transactions)."
        },
        {
          question: "How should I prepare animals for transfer?",
          answer: "Ensure animals are properly tagged, vaccinated, and accompanied by health certificates. Fast animals 12-24 hours before transport and provide any special care instructions."
        }
      ]
    },
    transactions: {
      title: "Transactions",
      description: "Payment and logistics information",
      faqs: [
        {
          question: "What fees does HerderHub charge?",
          answer: "Basic listings are free. We charge 2% commission on successful escrow transactions (capped at KES 5,000). Direct transactions between users are free."
        },
        {
          question: "How are disputes resolved?",
          answer: "Report issues within 24 hours with evidence (photos/videos). Our team will mediate between parties. For escrow transactions, we can withhold payment until resolution."
        }
      ]
    },
    safety: {
      title: "Safety & Trust",
      description: "How to conduct secure transactions",
      faqs: [
        {
          question: "How do I stay safe during meetups?",
          answer: "Meet in daylight at public locations like livestock markets. Bring someone with you. Avoid carrying large cash amounts - use mobile money or escrow services."
        },
        {
          question: "What if an animal gets sick after purchase?",
          answer: "Contact the seller immediately. We recommend agreeing on warranty terms before purchase (e.g., 3-day health guarantee). Document the condition with photos/videos."
        }
      ]
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white shadow-md p-4 md:sticky md:top-0 md:h-screen">
        <h2 className="text-xl font-bold text-[#A52A2A] mb-6 flex items-center">
          <FiHelpCircle className="mr-2" />
          Help Center
        </h2>

        {/* Support Section */}
        <div className="mb-6 p-4 bg-[#A52A2A] text-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Support</h3>
          <p className="text-gray-100 mb-3">For any further assistance contact us:</p>
          <p className="flex items-center mb-2">
            <FiMail className="mr-2" />
            <span>support@herderhub.co.ke</span>
          </p>
          <p className="flex items-center mb-2">
            <FiPhone className="mr-2" />
            <span>+254 700 123 456</span>
          </p>
          <p className="flex items-center text-sm text-gray-200">
            <FiClock className="mr-2" />
            <span>Mon-Fri, 8AM-6PM EAT</span>
          </p>
        </div>
        
        <nav className="space-y-2">
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveSection(key as SectionKey);
                setExpandedFaq(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                activeSection === key 
                  ? 'bg-[#A52A2A] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {key === 'buying' && <FiUser className="mr-3" />}
              {key === 'selling' && <FiDollarSign className="mr-3" />}
              {key === 'transactions' && <FiTruck className="mr-3" />}
              {key === 'safety' && <FiShield className="mr-3" />}
              {sections[key as SectionKey].title}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="text-[#A52A2A] hover:underline flex items-center">
                <FiChevronRight className="mr-1" /> Getting Started Guide
              </a>
            </li>
            <li>
              <a href="#" className="text-[#A52A2A] hover:underline flex items-center">
                <FiChevronRight className="mr-1" /> Fee Structure
              </a>
            </li>
            <li>
              <a href="#" className="text-[#A52A2A] hover:underline flex items-center">
                <FiChevronRight className="mr-1" /> Safety Tips
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {sections[activeSection].title}
          </h1>
          <p className="text-gray-600 mb-8">
            {sections[activeSection].description}
          </p>

          <div className="space-y-4 mb-12">
            {sections[activeSection].faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                  <FiChevronRight 
                    className={`text-[#A52A2A] transition-transform ${
                      expandedFaq === index ? 'transform rotate-90' : ''
                    }`}
                  />
                </div>
                {expandedFaq === index && (
                  <p className="text-gray-600 mt-3 animate-fadeIn">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Additional Contact Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Need more help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-[#A52A2A] bg-opacity-10 p-3 rounded-full mr-4">
                  <FiMessageSquare className="text-[#A52A2A]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Live Chat</h3>
                  <p className="text-gray-600 text-sm">Available 8AM-6PM EAT</p>
                  <button className="mt-2 text-sm font-medium text-[#A52A2A] hover:underline flex items-center">
                    Start Chat <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#A52A2A] bg-opacity-10 p-3 rounded-full mr-4">
                  <FiMail className="text-[#A52A2A]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Email Support</h3>
                  <p className="text-gray-600 text-sm">help@herderhub.co.ke</p>
                  <p className="text-gray-600 text-sm">Typically responds within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;