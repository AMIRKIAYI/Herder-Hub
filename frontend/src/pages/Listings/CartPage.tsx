import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiHeart, FiMessageSquare, FiTruck, FiChevronDown, FiChevronUp, FiSend, FiClipboard } from 'react-icons/fi';
import { GiCow, GiShakingHands, GiFarmTractor } from 'react-icons/gi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    toggleSaveForLater, 
    updateOffer, 
    updateNotes,
    cartItemCount,
    sendOfferToSeller
  } = useCart();

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("Seller's Preferred Transport");
  const [sendingOffers, setSendingOffers] = useState<{[key: string]: boolean}>({});

  const subtotal = cartItems.reduce((sum, item) => sum + (item.offerAmount || item.price), 0);

  const formatKES = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleOfferChange = (id: string, amount: string) => {
    const numericValue = amount ? parseInt(amount.replace(/\D/g, '')) : null;
    updateOffer(id, numericValue);
  };

  const handleNotesChange = (id: string, notes: string) => {
    updateNotes(id, notes);
  };

  const toggleExpandItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const contactSeller = (contact: string, method: 'call' | 'whatsapp') => {
    if (method === 'whatsapp') {
      window.open(`https://wa.me/${contact.replace('+', '')}`, '_blank');
    } else {
      window.location.href = `tel:${contact}`;
    }
  };

  const handleSendOffer = async (itemId: string) => {
    setSendingOffers(prev => ({...prev, [itemId]: true}));
    
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;
      
      // Send the offer to the seller
      await sendOfferToSeller(itemId);
      
      toast.success(`Offer sent to ${item.seller.name}!`);
      
      // Collapse the item after sending offer
      setExpandedItem(null);
    } catch (error) {
      toast.error('Failed to send offer. Please try again.');
      console.error('Error sending offer:', error);
    } finally {
      setSendingOffers(prev => ({...prev, [itemId]: false}));
    }
  };

  const handleSendAllOffers = async () => {
    const itemsWithOffers = cartItems.filter(item => item.offerAmount !== null);
    
    if (itemsWithOffers.length === 0) {
      toast.info('Please make offers on items before sending');
      return;
    }

    try {
      setSendingOffers(prev => ({...prev, 'all': true}));
      
      // Send all offers
      for (const item of itemsWithOffers) {
        await sendOfferToSeller(item.id);
      }
      
      toast.success(`Offers sent to ${itemsWithOffers.length} sellers!`);
      
      // Collapse all items
      setExpandedItem(null);
    } catch (error) {
      toast.error('Failed to send some offers. Please try again.');
      console.error('Error sending offers:', error);
    } finally {
      setSendingOffers(prev => ({...prev, 'all': false}));
    }
  };

  const calculateDiscountPercentage = (originalPrice: number, offerAmount: number) => {
    return Math.round(((originalPrice - offerAmount) / originalPrice) * 100);
  };


  

  const getCartImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
    
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#A52A2A]">Your Purchase Requests</h1>
          <p className="text-gray-600">Review and negotiate with sellers for these livestock</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItemCount > 0 ? (
              cartItems.map((item) => {
                const imageUrl = getCartImageUrl(item.image);
                const isExpanded = expandedItem === item.id;
                const isSending = sendingOffers[item.id];
                
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Livestock Image */}
                        <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={imageUrl || "/placeholder-livestock.jpg"}
                            alt={item.type}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-livestock.jpg";
                            }}
                          />
                        </div>

                        {/* Livestock Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[#A52A2A]">{item.type}</h3>
                              <p className="text-sm text-gray-500">{item.location}</p>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => toggleSaveForLater(item.id)}
                                className={`${item.savedForLater ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                title={item.savedForLater ? "Saved for later" : "Save for later"}
                              >
                                <FiHeart className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-400 hover:text-red-600"
                                title="Remove request"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Breed:</span> {item.breed}</p>
                            <p><span className="font-medium">Age:</span> {item.age}</p>
                            <p><span className="font-medium">Weight:</span> {item.weight}</p>
                            <p>
                              <span className="font-medium">Price:</span> 
                              {item.offerAmount ? (
                                <span className="ml-1">
                                  <span className="line-through text-gray-400">{formatKES(item.price)}</span>
                                  <span className="text-[#A52A2A] ml-2">{formatKES(item.offerAmount)}</span>
                                  {item.offerAmount < item.price && (
                                    <span className="ml-2 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                                      {calculateDiscountPercentage(item.price, item.offerAmount)}% off
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="ml-1">{formatKES(item.price)}</span>
                              )}
                            </p>
                          </div>

                          {/* Seller Information */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="font-medium">Seller:</p>
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                <p className="font-medium">{item.seller.name}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-yellow-500">★ {item.seller.rating}</span>
                                  <span>•</span>
                                  <span>{item.seller.animalsSold} animals sold</span>
                                  <span>•</span>
                                  <span>{item.seller.responseTime}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => contactSeller(item.seller.contact, 'whatsapp')}
                                  className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                                  title="Contact via WhatsApp"
                                >
                                  <FaWhatsapp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => contactSeller(item.seller.contact, 'call')}
                                  className="p-2 text-[#A52A2A] hover:bg-[#f8e8e8] rounded-full"
                                  title="Call seller"
                                >
                                  <FiMessageSquare className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse Button */}
                          <button 
                            onClick={() => toggleExpandItem(item.id)}
                            className="mt-4 w-full flex items-center justify-center gap-1 text-[#A52A2A] text-sm font-medium"
                          >
                            {isExpanded ? (
                              <>
                                <span>Show Less</span>
                                <FiChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>Negotiate or Add Notes</span>
                                <FiChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* Offer Section */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Make an Offer (KES)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.offerAmount ? formatKES(item.offerAmount) : ''}
                                onChange={(e) => handleOfferChange(item.id, e.target.value)}
                                placeholder={formatKES(item.price)}
                                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                              />
                              <button 
                                onClick={() => updateOffer(item.id, null)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                                disabled={!item.offerAmount}
                              >
                                Reset
                              </button>
                            </div>
                            {item.offerAmount && item.offerAmount < item.price && (
                              <p className="text-sm text-green-600 mt-1">
                                You're asking for {calculateDiscountPercentage(item.price, item.offerAmount)}% off
                              </p>
                            )}
                          </div>

                          {/* Notes Section */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes for Seller
                            </label>
                            <textarea
                              value={item.notes || ''}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              placeholder="Add any special requests or questions..."
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button 
                              onClick={() => handleSendOffer(item.id)}
                              disabled={!item.offerAmount || isSending}
                              className="px-4 py-2 bg-[#A52A2A] hover:bg-[#8a2323] text-white rounded-md text-sm font-medium flex items-center disabled:opacity-50"
                            >
                              {isSending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <FiSend className="mr-2" />
                                  Send Offer to Seller
                                </>
                              )}
                            </button>
                            <button className="px-4 py-2 border border-[#A52A2A] text-[#A52A2A] rounded-md text-sm font-medium hover:bg-[#f8e8e8] flex items-center">
                              <FiClipboard className="mr-2" />
                              Request Health Certificates
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <GiCow className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Your request list is empty</h3>
                <p className="mt-1 text-gray-500">Browse our marketplace to find quality livestock from trusted sellers</p>
                <div className="mt-6">
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A52A2A] hover:bg-[#8a2323]"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItemCount > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-8">
              <h2 className="text-lg font-semibold text-[#A52A2A] border-b pb-3 mb-4">Purchase Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                  <span className="font-medium">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Arrangement</span>
                  <span className="font-medium">To be discussed</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-semibold text-[#A52A2A]">
                  <span>Estimated Total</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiTruck className="w-4 h-4" />
                  Delivery Preferences
                </h3>
                <select 
                  value={selectedDelivery}
                  onChange={(e) => setSelectedDelivery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm mt-2"
                >
                  <option value="Seller's Preferred Transport">Seller's Preferred Transport</option>
                  <option value="Arrange My Own Transport">Arrange My Own Transport</option>
                  <option value="Platform Recommended Service">Platform Recommended Service</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Delivery details will be confirmed directly with the seller
                </p>
              </div>

              {/* Seller Communications */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" />
                  Seller Communications
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleSendAllOffers}
                    disabled={sendingOffers['all']}
                    className="w-full flex items-center justify-center gap-2 border border-[#A52A2A] text-[#A52A2A] py-2 rounded-md text-sm font-medium hover:bg-[#f8e8e8] disabled:opacity-50"
                  >
                    {sendingOffers['all'] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A52A2A] mr-2"></div>
                        Sending All Offers...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send All Offers
                      </>
                    )}
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md text-sm font-medium">
                    Request Combined Delivery
                  </button>
                </div>
              </div>

              {/* Connection Assurance */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <GiFarmTractor className="w-4 h-4" />
                  Secure Connection
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Our platform securely connects you with trusted livestock sellers for direct negotiation
                </p>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-2 inline-flex">
                      <GiShakingHands className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs mt-1">Direct Contact</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-2 inline-flex">
                      <FiMessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-xs mt-1">Secure Messaging</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-amber-100 rounded-full p-2 inline-flex">
                      <GiCow className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-xs mt-1">Verified Sellers</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-[#A52A2A] hover:bg-[#8a2323] text-white py-3 rounded-md font-medium"
                >
                  <GiShakingHands className="w-5 h-5" />
                  Connect with Sellers
                </button>
                <Link
                  to="/marketplace"
                  className="block text-center text-[#A52A2A] hover:text-[#8a2323] font-medium py-2 text-sm"
                >
                  Continue Browsing Marketplace
                </Link>
              </div>

              {/* Important Notes */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
                <p className="font-medium mb-2">Important Notes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Prices are negotiable - contact sellers directly</li>
                  <li>All transactions occur directly between buyer and seller</li>
                  <li>Inspect livestock thoroughly before finalizing purchase</li>
                  <li>Arrange delivery and payment directly with the seller</li>
                  <li>Our platform facilitates connections but doesn't handle transactions</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;