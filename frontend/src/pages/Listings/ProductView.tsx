import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiPhone, FiMail, FiMapPin, FiClock, FiCreditCard, FiCheck, FiLock, FiUser } from 'react-icons/fi';
import { FaStar, FaRegStar, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

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
  images: Array<{
    url: string;
    filename: string;
    _id: string;
  }>;
  
  seller: string | {
    _id: string;
    username: string;
    email: string;
    location: string;
    // Add other seller properties you might have
  };
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  preferredContactMethod: string;
  
  rating?: number;
  sellerLocation?: string;
  responseTime?: string;
}

interface MpesaResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface Transaction {
  _id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentData {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'seller'>('details');
  const [contactMethod, setContactMethod] = useState<'message' | 'call' | 'whatsapp' | 'email' | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'confirmation'>('cart');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [emailSubject, setEmailSubject] = useState('');
const [emailMessage, setEmailMessage] = useState('');


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/listings/${id}`, {
          withCredentials: true,
          timeout: 10000
        });
        setListing(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError('Listing not found. It may have been removed.');
          } else {
            setError(`Server error: ${err.response?.statusText || err.message}`);
          }
        } else {
          setError('Failed to fetch listing details. Please try again later.');
        }
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL.replace('/api', '')}/${cleanPath}`;
  };

  const formatKES = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const renderStars = (rating: number = 0) => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(rating) ? 
        <FaStar key={i} className="text-yellow-400 w-4 h-4" /> : 
        <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
    ));
  };

  const handleContactSeller = async () => {
    if (!listing || !contactMethod) return;

    try {
      await axios.post(`${API_BASE_URL}/connects`, {
        listingId: listing._id,
        sellerId: listing.seller,
        contactMethod,
        notes: '',
        status: 'pending'
      }, {
        withCredentials: true
      });
      
      toast.success(`Connected with ${listing.sellerName} via ${contactMethod}`);
      
      switch (contactMethod) {
        case 'message':
          alert(`Messaging ${listing.sellerName} at ${listing.sellerPhone}`);
          break;
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
      }
    } catch (error) {
      console.error('Error tracking connection:', error);
      switch (contactMethod) {
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
          alert(`Contacting ${listing.sellerName}`);
      }
    }
  };
  const handleSendEmail = async () => {
  if (!listing) return toast.error('Listing not found');
  if (!emailSubject || !emailMessage) {
    toast.error('Please fill in both subject and message');
    return;
  }

  try {
    await axios.post(`${API_BASE_URL}/email/send`, {
      sellerEmail: listing.sellerEmail,
      buyerName: user?.username || 'Anonymous Buyer',
      subject: emailSubject,
      message: emailMessage,
      livestockDetails: {
        animalType: listing.animalType,
        breed: listing.breed,
        price: listing.price,
        location: listing.location,
      },
    });

    toast.success('Email sent to seller successfully!');
    setEmailSubject('');
    setEmailMessage('');
    setContactMethod(null);
  } catch (error: any) {
    console.error('Error sending email:', error);
    toast.error('Failed to send email. Please try again.');
  }
};


  const handleBuyNow = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to make a purchase');
      navigate('/login');
      return;
    }
    setShowPaymentModal(true);
    setCheckoutStep('payment');
  };

  const initiateSTKPush = async (paymentData: PaymentData): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mpesa/stkpush`, 
      paymentData, 
      {
        withCredentials: true,
        timeout: 30000
      }
    );

    console.log('STK Push raw response:', response.data);
    return response.data; // Return the full response object
    
  } catch (error: any) {
    console.error('Error initiating STK push:', error);
    
    if (error.response?.data?.errorCode) {
      switch (error.response.data.errorCode) {
        case '500.001.1001':
          throw new Error('Insufficient balance in your M-Pesa account');
        case '500.001.1002':
          throw new Error('Transaction declined by user');
        case '500.001.1003':
          throw new Error('Transaction cancelled');
        default:
          throw new Error(error.response.data.errorMessage || 'Payment initiation failed');
      }
    }
    
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

  

const updateTransactionStatus = async (transactionId: string, status: string, mpesaReceiptNumber?: string) => {
  try {
    console.log('Updating transaction:', transactionId, 'to status:', status);
    
    const response = await axios.patch(
      `${API_BASE_URL}/transactions/${transactionId}`,
      {
        status,
        mpesaReceiptNumber
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Transaction updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};
  const markListingAsSold = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/listings/${listing?._id}`, {
        status: 'sold'
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error marking listing as sold:', error);
    }
  };

  // Add proper type annotations to the function parameters
const pollPaymentStatus = async (checkoutRequestId: string, transactionId: string): Promise<void> => {
  let attempts = 0;
  const maxAttempts = 30;
  const pollInterval = 3000;
  
  console.log('Starting payment status polling for transaction:', transactionId);
  
  const checkPayment = async (): Promise<boolean> => {
    attempts++;
    console.log(`Polling attempt ${attempts}/${maxAttempts} for transaction:`, transactionId);
    
    try {
      const statusResponse = await axios.get(
        `${API_BASE_URL}/mpesa/transaction-status/${checkoutRequestId}`,
        { 
          withCredentials: true, 
          timeout: 10000 
        }
      );
      
      console.log('Status response:', statusResponse.data);
      
      if (statusResponse.data.status === 'Completed') {
        console.log('Payment completed successfully!');
        setPaymentProcessing(false);
        setPaymentSuccess(true);
        setTransactionCode(statusResponse.data.mpesaReceiptNumber);
        
        await updateTransactionStatus(transactionId, 'completed', statusResponse.data.mpesaReceiptNumber);
        
        // Add null check before calling markListingAsSold
        if (listing) {
          await markListingAsSold();
        }
        
        toast.success('Payment successful! The seller has been notified.');
        return true;
      } else if (statusResponse.data.status === 'Failed') {
        console.log('Payment failed');
        setPaymentProcessing(false);
        toast.error('Payment failed. Please try again.');
        await updateTransactionStatus(transactionId, 'failed');
        return true;
      } else {
        console.log('Payment still pending...');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    
    if (attempts >= maxAttempts) {
      console.log('Polling timeout reached');
      setPaymentProcessing(false);
      toast.error('Payment confirmation timeout. Please check your M-Pesa messages.');
      await updateTransactionStatus(transactionId, 'failed');
      return true;
    }
    
    return false;
  };
  
  // First check immediately
  if (await checkPayment()) return;
  
  // Then set up interval for subsequent checks
  const intervalId = setInterval(async () => {
    try {
      if (await checkPayment()) {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error in polling interval:', error);
      clearInterval(intervalId);
    }
  }, pollInterval);
  
  // Clean up interval after max time (90 seconds)
  setTimeout(() => {
    clearInterval(intervalId);
  }, maxAttempts * pollInterval);
};

const handlePayment = async () => {
  // Add early return if listing is null
  if (!listing) {
    toast.error('Listing information is not available');
    return;
  }
  
  if (!user || !user.id) {
    toast.error('Please log in to make a purchase');
    navigate('/login');
    return;
  }
  
  if (!phoneNumber) {
    toast.error('Please enter your M-Pesa phone number');
    return;
  }
  
  let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }
  
  if (!/^254[17]\d{8}$/.test(formattedPhone)) {
    toast.error('Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)');
    return;
  }
  
  setPaymentProcessing(true);
  setPaymentError('');
  
  try {
    const transactionData = {
      listingId: listing._id,
      buyerId: user.id,
      amount: Number(listing.price) + 2,
      paymentMethod: 'mpesa',
      phoneNumber: formattedPhone,
      status: 'pending',
      accountReference: `LS${listing._id.slice(-6)}`,
      transactionDesc: `Purchase of ${listing.breed} ${listing.animalType}`
    };
    
    console.log('Transaction data being sent:', JSON.stringify(transactionData, null, 2));
    
    const transactionResponse = await axios.post(
      `${API_BASE_URL}/transactions`, 
      transactionData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Full transaction response:', transactionResponse.data);
    
    // Extract the transaction ID correctly with proper type checking
    const transactionId = transactionResponse.data.transaction?._id;
    
    // Check if the ID is valid before proceeding
    if (!transactionId) {
      throw new Error('Transaction ID is undefined');
    }
    
    setTransaction(transactionResponse.data);
    
    const stkResponse = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount: listing.price + 2,
      accountReference: `LS${listing._id.slice(-6)}`,
      transactionDesc: `Purchase of ${listing.breed} ${listing.animalType}`
    });
    
    console.log('Full STK response:', stkResponse);
    
    // Check the response structure - it should be stkResponse.data.ResponseCode
    if (stkResponse.data && stkResponse.data.ResponseCode === '0') {
      toast.success('Please check your phone to complete the payment');
      setCheckoutStep('confirmation');
      
      // Store the checkoutRequestId and merchantRequestId in the transaction
      await axios.patch(
        `${API_BASE_URL}/transactions/${transactionId}`,
        {
          checkoutRequestId: stkResponse.data.checkoutRequestId || stkResponse.data.CheckoutRequestID,
          merchantRequestId: stkResponse.data.merchantRequestId || stkResponse.data.MerchantRequestID
        },
        {
          withCredentials: true
        }
      );
      
      // Use the correct transactionId variable here
      await pollPaymentStatus(stkResponse.data.CheckoutRequestID, transactionId);
    } else {
      setPaymentProcessing(false);
      // Handle different response structures
      const errorMessage = stkResponse.CustomerMessage || 
                          stkResponse.message || 
                          'Payment initiation failed';
      toast.error(errorMessage);
      
      // Use the correct transactionId variable here too
      await updateTransactionStatus(transactionId, 'failed');
    }
  } catch (error: any) {
    console.error('Full error details:', error);
    
    if (error.response?.data) {
      console.error('Server response data:', error.response.data);
      console.error('Server response status:', error.response.status);
      
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const validationErrors = Object.values(error.response.data.errors)
          .map((err: any) => err.message)
          .join(', ');
        setPaymentError(`Validation failed: ${validationErrors}`);
        toast.error(`Validation failed: ${validationErrors}`);
      } else {
        const errorMessage = error.response.data.message || 
                            error.response.data.error || 
                            'Transaction creation failed';
        setPaymentError(errorMessage);
        toast.error(errorMessage);
      }
    } else {
      const errorMessage = error.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    }
    
    setPaymentProcessing(false);
  }
};

  const handleRetryPayment = () => {
    setPaymentSuccess(false);
    setTransactionCode('');
    setCheckoutStep('payment');
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentProcessing(false);
    setPaymentSuccess(false);
    setPhoneNumber('');
    setTransactionCode('');
    setCheckoutStep('cart');
    setPaymentError('');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A52A2A] mb-4"></div>
      <p>Loading listing details...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-[#A52A2A] text-white rounded hover:bg-[#8a2323]"
        >
          Back to Marketplace
        </button>
      </div>
    </div>
  );

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#A52A2A] mb-6 hover:underline"
        >
          <FiArrowLeft className="mr-2" />
          Back to Marketplace
        </button>

        <div className="grid items-start grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="col-span-2">
            <div className="sticky top-4 grid grid-cols-2 gap-2">
              <div className="columns-2 gap-2 space-y-2">
                {listing.images.slice(0, 4).map((img, index) => (
                  <div key={index} className="overflow-hidden rounded-lg shadow-md">
                    <img 
                      src={getImageUrl(img.url)} 
                      alt={`${listing.breed} ${index + 1}`} 
                      className="w-full aspect-square object-cover object-center hover:scale-[1.03] transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-lg shadow-md">
                <img 
                  src={getImageUrl(listing.images[0]?.url)} 
                  alt={`${listing.breed} main`} 
                  className="w-full aspect-square object-cover object-center hover:scale-[1.03] transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="py-6 px-4 bg-white rounded-lg shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#A52A2A]">{listing.breed} {listing.animalType}</h2>
              <p className="text-gray-600 mt-1">{listing.location}</p>
            </div>

            {/* Price */}
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{formatKES(listing.price)}</p>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 font-medium text-sm ${activeTab === 'details' ? 'text-[#A52A2A] border-b-2 border-[#A52A2A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Livestock Details
                </button>
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`py-2 px-1 font-medium text-sm ${activeTab === 'seller' ? 'text-[#A52A2A] border-b-2 border-[#A52A2A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Seller Information
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'details' ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Breed</p>
                      <p className="font-medium">{listing.breed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{listing.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{listing.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{listing.location}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 mt-2">{listing.description}</p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Features</h3>
                    <ul className="mt-2 space-y-2 list-disc pl-5 text-gray-600">
                      {listing.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mt-4">Health Records</h3>
                    <div className="mt-2 space-y-3">
                      {listing.healthRecords.map((record, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">{record.type}</span>
                            <span className="text-sm text-gray-500">{record.date}</span>
                          </div>
                          <p className="text-gray-600 mt-1">{record.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{listing.sellerName}</h3>
                    <div className="flex items-center mt-2">
                      <div className="flex mr-2">
                        {renderStars(listing.rating || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {(listing.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center">
                        <FiMapPin className="text-gray-500 mr-2" />
                        <span className="text-gray-600">{listing.sellerLocation || listing.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-gray-500 mr-2" />
                        <span className="text-gray-600">{listing.responseTime || 'Usually responds within 24 hours'}</span>
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="text-gray-500 mr-2" />
                        <span className="text-gray-600">{listing.sellerPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <FiMail className="text-gray-500 mr-2" />
                        <span className="text-gray-600">{listing.sellerEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <FaWhatsapp className="text-gray-500 mr-2" />
                        <span className="text-gray-600">
                          Prefers contact via {listing.preferredContactMethod || 'whatsapp'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Seller Buttons */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Contact Seller</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setContactMethod('message')}
                  className={`p-3 flex items-center justify-center rounded-md border ${contactMethod === 'message' ? 'border-[#A52A2A] bg-[#f8f0f0]' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FiMessageSquare className="mr-2 text-[#A52A2A]" />
                  Message
                </button>
                <button 
                  onClick={() => setContactMethod('call')}
                  className={`p-3 flex items-center justify-center rounded-md border ${contactMethod === 'call' ? 'border-[#A52A2A] bg-[#f8f0f0]' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FiPhone className="mr-2 text-[#A52A2A]" />
                  Call
                </button>
                <button 
                  onClick={() => setContactMethod('whatsapp')}
                  className={`p-3 flex items-center justify-center rounded-md border ${contactMethod === 'whatsapp' ? 'border-[#A52A2A] bg-[#f8f0f0]' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FaWhatsapp className="mr-2 text-[#A52A2A]" />
                  WhatsApp
                </button>
                <button 
                  onClick={() => setContactMethod('email')}
                  className={`p-3 flex items-center justify-center rounded-md border ${contactMethod === 'email' ? 'border-[#A52A2A] bg-[#f8f0f0]' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <FiMail className="mr-2 text-[#A52A2A]" />
                  Email
                </button>
              </div>

              {contactMethod && contactMethod !== 'email' && (
  <button
    onClick={handleContactSeller}
    className="w-full mt-4 px-4 py-3 bg-[#A52A2A] hover:bg-[#8a2323] text-white font-medium rounded-md transition-colors"
  >
    {contactMethod === 'message' && `Message ${listing.sellerName}`}
    {contactMethod === 'call' && `Call ${listing.sellerPhone}`}
    {contactMethod === 'whatsapp' && `Chat on WhatsApp`}
  </button>
)}
{contactMethod === 'message' && (
  <div className="mt-4 p-4 border rounded-md bg-gray-50">
    <h4 className="font-semibold text-gray-800 mb-2">
      Send a Message to {listing.sellerName}
    </h4>
    <textarea
      placeholder="Write your message..."
      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A]"
      rows={4}
      value={emailMessage}
      onChange={(e) => setEmailMessage(e.target.value)}
    />
    <button
      onClick={async () => {
        if (!emailMessage) return toast.error("Message cannot be empty");
        try {
          await axios.post(`${API_BASE_URL}/sms/send`, {
  sellerPhone: listing.sellerPhone,
  message: emailMessage,
  senderName: user?.username || "Anonymous Buyer",
});

          toast.success("SMS sent successfully!");
          setEmailMessage("");
          setContactMethod(null);
        } catch (error: any) {
          console.error("Error sending SMS:", error);
          toast.error("Failed to send SMS. Please try again.");
        }
      }}
      className="w-full px-4 py-2 bg-[#A52A2A] hover:bg-[#8a2323] text-white rounded-md"
    >
      Send SMS
    </button>
  </div>
)}


{contactMethod === 'email' && (
  <div className="mt-4 p-4 border rounded-md bg-gray-50">
    <h4 className="font-semibold text-gray-800 mb-2">Send an Email to {listing.sellerName}</h4>
    <input
      type="text"
      placeholder="Subject"
      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A]"
      value={emailSubject}
      onChange={(e) => setEmailSubject(e.target.value)}
    />
    <textarea
      placeholder="Write your message..."
      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A]"
      rows={4}
      value={emailMessage}
      onChange={(e) => setEmailMessage(e.target.value)}
    />
    <button
      onClick={handleSendEmail}
      className="w-full px-4 py-2 bg-[#A52A2A] hover:bg-[#8a2323] text-white rounded-md"
    >
      Send Email
    </button>
  </div>
)}

            </div>

            {/* Buy Now Button */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Ready to purchase?</h3>
              <button
                onClick={handleBuyNow}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors flex items-center justify-center"
              >
                <FiCreditCard className="mr-2" />
                Buy Now with M-Pesa
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                We recommend contacting the seller first before purchasing
              </p>
            </div>

            {/* Safety Tips */}
            <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-800">Safety Tips</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                <li>• Meet in a safe public place for inspection</li>
                <li>• Verify all health certificates and vaccination records</li>
                <li>• Use secure payment methods</li>
                <li>• Never pay without seeing the livestock first</li>
                <li>• Report suspicious activity to support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {paymentSuccess ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <FiCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Payment Successful!</h3>
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium">{listing.breed} {listing.animalType}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatKES(listing.price + 2)}</span>
                  </div>
                  {transactionCode && (
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Transaction Code:</span>
                      <span className="font-medium">{transactionCode}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  The seller has been notified and will contact you within 24 hours to arrange delivery.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={closePaymentModal}
                    className="w-full px-4 py-2 bg-[#A52A2A] text-white rounded-md hover:bg-[#8a2323]"
                  >
                    Continue Browsing
                  </button>
                  <button
                    onClick={() => {
                      closePaymentModal();
                      navigate('/purchases');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    View My Purchases
                  </button>
                </div>
              </div>
            ) : checkoutStep === 'confirmation' ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <FiClock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Waiting for Payment</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Please check your phone and enter your M-Pesa PIN to complete the payment.
                </p>
                {paymentProcessing && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A52A2A] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Checking payment status...</p>
                  </div>
                )}
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={handleRetryPayment}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Retry Payment
                  </button>
                  <button
                    onClick={closePaymentModal}
                    className="flex-1 px-4 py-2 bg-[#A52A2A] text-white rounded-md hover:bg-[#8a2323]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Your Purchase</h3>
                
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium">{listing.breed} {listing.animalType}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{formatKES(listing.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction fee:</span>
                    <span className="font-medium">KES 100</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="text-gray-900 font-semibold">{formatKES(listing.price + 2)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 07XX XXX XXX"
                    value={formatPhoneNumber(phoneNumber)}
                    onChange={(e) => {
    // keep only digits
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);
  }}
  required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A52A2A]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>

                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{paymentError}</p>
                  </div>
                )}

                <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-md">
                  <FiLock className="text-blue-500 mr-2" />
                  <p className="text-sm text-blue-700">
                    Your payment is secure and encrypted. We never store your M-Pesa details.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing || !phoneNumber}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatKES(listing.price + 2)} with M-Pesa`
                  )}
                </button>

                <button
                  onClick={closePaymentModal}
                  className="w-full mt-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;