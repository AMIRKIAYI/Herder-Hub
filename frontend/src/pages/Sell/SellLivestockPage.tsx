import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiUser, FiPhone, FiMapPin, FiCheck, FiX, FiCamera, FiPlus, FiTrash2, FiMail } from 'react-icons/fi';
import { GiCow, GiWeight, GiFarmTractor, GiHealthNormal } from 'react-icons/gi';
import { FaShieldAlt, FaRegCheckCircle, FaRegTimesCircle, FaWhatsapp } from 'react-icons/fa';
import { MdOutlineDescription, MdOutlineSell } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

interface HealthRecord {
  date: string;
  type: string;
  details: string;
}

const SellLivestockPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/sell' } });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Kenyan counties for location dropdown
  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Machakos',
    'Meru', 'Thika', 'Nyeri', 'Marsabit', 'Isiolo', 'Garissa',
    'Wajir', 'Mandera', 'Samburu', 'Turkana', 'Lodwar', 'Moyale'
  ];
  
  // Form state
  // Initialize form data with user information
  const [formData, setFormData] = useState({
    animalType: '',
    breed: '',
    age: '',
    weight: '',
    healthStatus: 'Excellent',
    vaccinationStatus: 'Fully Vaccinated',
    price: '',
    description: '',
    location: user?.location || '', // Use user's location if available
    features: [''],
    healthRecords: [] as Array<{date: string, type: string, details: string}>,
    
    // Seller Details - populated from authenticated user
    name: user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    sellerSince: user?.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
    preferredContactMethod: user?.preferredContact || 'whatsapp',
    responseTime: 'Usually responds within 2 hours'
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        location: user.location || prev.location,
        sellerSince: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : prev.sellerSince,
        preferredContactMethod: user.preferredContact || prev.preferredContactMethod
      }));
    }
  }, [user]);

  const animalTypes = [
    { value: 'Cattle', label: 'Cattle' },
    { value: 'Goat', label: 'Goat' },
    { value: 'Sheep', label: 'Sheep' },
    { value: 'Camel', label: 'Camel' },
    { value: 'Donkey', label: 'Donkey' },
    { value: 'Poultry', label: 'Poultry' }
  ];

  const cattleBreeds = ['Borana', 'Sahiwal', 'Zebu', 'Friesian', 'Crossbreed'];
  const goatBreeds = ['Galla', 'Boer', 'Toggenburg', 'Saanen'];
  const sheepBreeds = ['Red Maasai', 'Dorper', 'Merino'];
  const camelBreeds = ['Dromedary', 'Bactrian'];
  const donkeyBreeds = ['Somali', 'Nubian'];
  const poultryBreeds = ['Kienyeji', 'Broiler', 'Layer'];

  const getBreedOptions = () => {
    switch (formData.animalType) {
      case 'Cattle': return cattleBreeds;
      case 'Goat': return goatBreeds;
      case 'Sheep': return sheepBreeds;
      case 'Camel': return camelBreeds;
      case 'Donkey': return donkeyBreeds;
      case 'Poultry': return poultryBreeds;
      default: return [];
    }
  };

  const healthStatusOptions = [
    { value: 'Excellent', label: 'Excellent', icon: <FaRegCheckCircle className="text-green-500" /> },
    { value: 'Good', label: 'Good', icon: <FaRegCheckCircle className="text-green-400" /> },
    { value: 'Fair', label: 'Fair', icon: <FaRegTimesCircle className="text-yellow-500" /> },
    { value: 'Poor', label: 'Poor', icon: <FaRegTimesCircle className="text-red-500" /> }
  ];

  const vaccinationOptions = [
    'Fully Vaccinated',
    'Partially Vaccinated',
    'Not Vaccinated',
    'Unknown'
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.animalType) newErrors.animalType = 'Animal type is required';
    if (!formData.breed) newErrors.breed = 'Breed is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (Number(formData.price) < 1) newErrors.price = 'Minimum price is KES 1,000';
    if (!formData.description) newErrors.description = 'Description is required';
    if (previewImages.length === 0) newErrors.images = 'At least one image is required';
    if (formData.features.some(f => !f.trim())) newErrors.features = 'All features must be filled';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addHealthRecord = () => {
    setFormData(prev => ({
      ...prev,
      healthRecords: [...prev.healthRecords, { date: '', type: '', details: '' }]
    }));
  };

  const updateHealthRecord = (index: number, field: keyof HealthRecord, value: string) => {
    const newRecords = [...formData.healthRecords];
    newRecords[index][field] = value;
    setFormData(prev => ({
      ...prev,
      healthRecords: newRecords
    }));
  };

  const removeHealthRecord = (index: number) => {
    const newRecords = formData.healthRecords.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      healthRecords: newRecords
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files].slice(0, 5));
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews].slice(0, 5));
      
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!user) {
    toast.error('You must be logged in to list livestock');
    return navigate('/login');
  }

  setIsSubmitting(true);

  try {
    // 1. Upload images
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('images', file));

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/listings/upload`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Image upload failed');
        } catch {
          throw new Error('Image upload failed');
        }
      }

      imageUrls = (await uploadResponse.json()).urls;
    }

    // 2. Update user's phone number and preferred contact method
    if (formData.phone && (formData.phone !== user.phone || formData.preferredContactMethod !== user.preferredContact)) {
      try {
        const updateUserResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/update-contact`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              phone: formData.phone,
              preferredContact: formData.preferredContactMethod
            }),
          }
        );

        if (!updateUserResponse.ok) {
          const errorText = await updateUserResponse.text();
          console.warn('Failed to update user contact info:', errorText);
          // Continue with listing creation even if update fails
        }
      } catch (error) {
        console.warn('Error updating contact info:', error);
        // Continue with listing creation
      }
    }

    // 3. Create listing with seller contact information
    const listingResponse = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/listings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          // Livestock information
          animalType: formData.animalType,
          breed: formData.breed,
          age: formData.age,
          weight: formData.weight,
          healthStatus: formData.healthStatus,
          vaccinationStatus: formData.vaccinationStatus,
          price: Number(formData.price),
          description: formData.description,
          location: formData.location,
          features: formData.features.filter(f => f.trim()),
          healthRecords: formData.healthRecords,
          images: imageUrls,
          
          // Seller information
          seller: user.id,
          sellerName: user.username,
          sellerEmail: user.email,
          sellerPhone: formData.phone,
          preferredContactMethod: formData.preferredContactMethod
        }),
      }
    );

    if (!listingResponse.ok) {
      const errorText = await listingResponse.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Listing creation failed');
      } catch {
        throw new Error('Listing creation failed');
      }
    }

    const createdListing = await listingResponse.json();

    // 4. Show success toast
    toast(<SuccessToast />, {
      className: 'custom-toast'
    });

    // 5. Redirect to the new listing after a short delay
    setTimeout(() => {
      if (createdListing && createdListing._id) {
        navigate(`/listing/${createdListing._id}`);
      } else {
        // If no listing ID, redirect to marketplace
        navigate('/marketplace');
      }
    }, 2000);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    toast.error(message);
    console.error('Submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  const toastStyles = `
    .Toastify__toast-container {
      width: auto;
      max-width: 100%;
      padding: 0 20px;
    }
    
    .custom-toast {
      background: white;
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 1rem;
      min-height: auto;
    }
    
    .Toastify__toast-body {
      padding: 0;
      margin: 0;
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
    
    .Toastify__slide-enter {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    .Toastify__slide-exit {
      animation: fadeOut 0.3s ease-in forwards;
    }
    
    /* Custom animations */
    @keyframes ping-slow {
      0% { transform: scale(0.95); opacity: 0.6; }
      70% { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    
    .animate-ping-slow {
      animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    @keyframes progress {
      0% { width: 100%; }
      100% { width: 0%; }
    }
    
    .animate-progress {
      animation: progress 3s linear forwards;
    }
      .Toastify__close-button {
      position: absolute;
      right: 12px;
      top: 12px;
      color: #A52A2A;
      background: transparent;
      outline: none;
      border: none;
      padding: 0;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }
    
    .Toastify__close-button:hover {
      opacity: 1;
    }
    
    .Toastify__close-button > svg {
      width: 18px;
      height: 18px;
    }
  `;

  const SuccessToast = () => (
    <div className="relative flex flex-col items-center justify-center p-8 pr-12">
      {/* Brown check circle with animation */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-[#A52A2A] rounded-full opacity-20 animate-ping-slow"></div>
        <div className="w-16 h-16 rounded-full bg-[#A52A2A] flex items-center justify-center relative z-10 shadow-lg">
          <FiCheck className="text-white text-2xl" />
        </div>
      </div>
      
      {/* Message */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Listing Successful</h3>
        <p className="text-gray-600">Your livestock has been posted to the marketplace</p>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A52A2A]/20 overflow-hidden rounded-b-lg">
        <div className="h-full bg-[#A52A2A] animate-progress"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Updated Toast Container */}
      <style>{toastStyles}</style>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        toastClassName="custom-toast"
        closeButton={true}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#A52A2A] mb-2">Sell Your Livestock</h1>
        <p className="text-gray-600">Fill in the details below to list your animal for sale</p>
      </div>

      {/* Progress Steps */}
      <div className="flex mb-8">
        <div className={`flex-1 border-t-4 ${step >= 1 ? 'border-[#A52A2A]' : 'border-gray-300'} pt-2 relative`}>
          <p className={`text-sm ${step >= 1 ? 'text-[#A52A2A] font-medium' : 'text-gray-500'}`}>
            Livestock Details
          </p>
          <div className={`absolute -top-3 left-0 w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#A52A2A] text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
        </div>
        <div className={`flex-1 border-t-4 ${step >= 2 ? 'border-[#A52A2A]' : 'border-gray-300'} pt-2 relative`}>
          <p className={`text-sm ${step >= 2 ? 'text-[#A52A2A] font-medium' : 'text-gray-500'}`}>
            Seller Confirmation
          </p>
          <div className={`absolute -top-3 left-0 w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#A52A2A] text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNextStep} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#A52A2A] mb-6 flex items-center">
            <GiCow className="mr-2" /> Livestock Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type*</label>
              <select
                name="animalType"
                value={formData.animalType}
                onChange={handleInputChange}
                className={`w-full p-2 border ${errors.animalType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                required
              >
                <option value="">Select animal type</option>
                {animalTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.animalType && <p className="mt-1 text-sm text-red-600">{errors.animalType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed*</label>
              {getBreedOptions().length > 0 ? (
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                  required
                >
                  <option value="">Select breed</option>
                  {getBreedOptions().map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                  placeholder="Enter breed"
                  required
                />
              )}
              {errors.breed && <p className="mt-1 text-sm text-red-600">{errors.breed}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full p-2 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                placeholder="e.g. 3 years"
                required
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <GiWeight className="mr-1" /> Weight (kg)*
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className={`w-full p-2 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                placeholder="e.g. 450"
                required
              />
              {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <GiHealthNormal className="mr-1" /> Health Status*
              </label>
              <select
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                required
              >
                {healthStatusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Status*</label>
              <select
                name="vaccinationStatus"
                value={formData.vaccinationStatus}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                required
              >
                {vaccinationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MdOutlineSell className="mr-1" /> Price (KES)*
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">KES</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full pl-12 p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                  placeholder="e.g. 45000"
                  min="1"
                  required
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiMapPin className="mr-1" /> Location*
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full p-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                required
              >
                <option value="">Select location</option>
                {kenyanCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MdOutlineDescription className="mr-1" /> Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
              placeholder="Describe your livestock (vaccination history, special features, temperament, etc.)"
              required
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-gray-500">Include details that would help buyers make a decision</p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className={`w-full p-2 border ${errors.features ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]`}
                  placeholder="e.g. Fully vaccinated, Dewormed regularly"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 text-sm text-[#A52A2A] hover:underline flex items-center"
            >
              <FiPlus className="mr-1" /> Add Feature
            </button>
            {errors.features && <p className="mt-1 text-sm text-red-600">{errors.features}</p>}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Records</label>
            {formData.healthRecords.map((record, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={record.date}
                    onChange={(e) => updateHealthRecord(index, 'date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <input
                    type="text"
                    value={record.type}
                    onChange={(e) => updateHealthRecord(index, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                    placeholder="e.g. Vaccination"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Details</label>
                    <input
                      type="text"
                      value={record.details}
                      onChange={(e) => updateHealthRecord(index, 'details', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                      placeholder="e.g. Foot and Mouth Disease"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHealthRecord(index)}
                    className="ml-2 mb-[9px] text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addHealthRecord}
              className="mt-2 text-sm text-[#A52A2A] hover:underline flex items-center"
            >
              <FiPlus className="mr-1" /> Add Health Record
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiCamera className="mr-1" /> Upload Photos (Max 5)*
            </label>
            <div className="mt-1 flex flex-wrap gap-4">
              {previewImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img} 
                    alt={`Preview ${index}`} 
                    className="h-24 w-24 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {previewImages.length < 5 && (
                <>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-[#A52A2A] transition-colors"
                  >
                    <FiUpload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </>
              )}
            </div>
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Clear photos from different angles help attract buyers. Include full body shots and any distinguishing features.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-[#A52A2A] hover:bg-[#8a2323] text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center"
            >
              Continue to Seller Details
              <FiCheck className="ml-2" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#A52A2A] mb-6 flex items-center">
            <FiUser className="mr-2" /> Seller Confirmation
          </h2>

          <div className="bg-amber-50 p-4 rounded-md mb-6 border border-amber-100">
            <h3 className="font-medium text-[#A52A2A] mb-3 text-lg">Your Listing Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Animal Type</p>
                <p className="text-gray-800">{formData.animalType || 'Not specified'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Breed</p>
                <p className="text-gray-800">{formData.breed || 'Not specified'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Age</p>
                <p className="text-gray-800">{formData.age || 'Not specified'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Weight</p>
                <p className="text-gray-800">{formData.weight ? `${formData.weight} kg` : 'Not specified'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Price</p>
                <p className="text-gray-800">{formData.price ? `KES ${parseInt(formData.price).toLocaleString()}` : 'Not specified'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Health Status</p>
                <p className="text-gray-800">{formData.healthStatus}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <p className="font-medium text-gray-500">Vaccination Status</p>
                <p className="text-gray-800">{formData.vaccinationStatus}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200 md:col-span-2">
                <p className="font-medium text-gray-500">Description</p>
                <p className="text-gray-800">{formData.description || 'Not provided'}</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200 md:col-span-2">
                <p className="font-medium text-gray-500">Key Features</p>
                <ul className="list-disc pl-5 text-gray-800">
                  {formData.features.filter(f => f.trim()).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              {formData.healthRecords.length > 0 && (
                <div className="bg-white p-3 rounded-md border border-gray-200 md:col-span-2">
                  <p className="font-medium text-gray-500">Health Records</p>
                  <div className="space-y-2 mt-2">
                    {formData.healthRecords.map((record, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{record.type}</span>
                          <span className="text-xs text-gray-500">{record.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{record.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white p-3 rounded-md border border-gray-200 md:col-span-2">
                <p className="font-medium text-gray-500">Photos</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewImages.map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt={`Preview ${index}`} 
                      className="h-16 w-16 object-cover rounded border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-lg">Your Seller Information</h3>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-[#A52A2A] text-white p-2 rounded-full mr-4">
                <FiUser className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{formData.name}</p>
                <p className="text-sm text-gray-600">Verified Seller</p>
              </div>
              <button 
                type="button"
                className="text-sm text-[#A52A2A] hover:text-[#8a2323]"
                onClick={() => setStep(1)}
              >
                Edit
              </button>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-[#A52A2A] text-white p-2 rounded-full mr-4">
                <FiPhone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{formData.phone}</p>
                <p className="text-sm text-gray-600">Contact Number</p>
              </div>
              <div className="text-sm">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="preferredContactMethod"
                    value="call"
                    checked={formData.preferredContactMethod === 'call'}
                    onChange={handleInputChange}
                    className="text-[#A52A2A] focus:ring-[#A52A2A]"
                  />
                  <span className="ml-2">Call</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name="preferredContactMethod"
                    value="whatsapp"
                    checked={formData.preferredContactMethod === 'whatsapp'}
                    onChange={handleInputChange}
                    className="text-[#A52A2A] focus:ring-[#A52A2A]"
                  />
                  <span className="ml-2">WhatsApp</span>
                </label>
              </div>
            </div>

            {/* Phone Number Input Field */}
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Contact Number
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">+254</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#A52A2A] focus:border-[#A52A2A]"
                  placeholder="700 123456"
                  pattern="[0-9]{9}"
                  title="Please enter a valid Kenyan phone number (without the country code)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your 9-digit Kenyan phone number (without +254)
              </p>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-[#A52A2A] text-white p-2 rounded-full mr-4">
                <FiMail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{formData.email}</p>
                <p className="text-sm text-gray-600">Email Address</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-[#A52A2A] text-white p-2 rounded-full mr-4">
                <FiMapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{formData.location}</p>
                <p className="text-sm text-gray-600">Location</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="bg-[#A52A2A] text-white p-2 rounded-full mr-4">
                <GiFarmTractor className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Seller since {formData.sellerSince}</p>
                <p className="text-sm text-gray-600">Member for {new Date().getFullYear() - new Date(formData.sellerSince).getFullYear()} years</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-md">
            <div className="flex items-start">
              <FaShieldAlt className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
              <div>
                <h4 className="font-medium text-green-800 text-lg">Secure Transaction</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your contact information will only be shared with serious buyers after they make an inquiry.
                  All transactions are protected by our marketplace guarantee.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#A52A2A] hover:text-[#8a2323] font-medium px-6 py-2 border border-[#A52A2A] rounded-md transition-colors flex items-center"
            >
              <FiX className="mr-2" /> Back to Edit
            </button>
            <button
              type="submit"
              className="bg-[#A52A2A] hover:bg-[#8a2323] text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" /> Confirm and List for Sale
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SellLivestockPage;