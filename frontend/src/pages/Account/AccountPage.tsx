import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiShoppingCart, FiMessageSquare, FiSettings, FiX, 
  FiStar, FiCheck, FiUpload, FiCalendar, FiEdit2, FiPlus, 
  FiChevronRight, FiBell, FiHelpCircle, FiHeart, FiUsers,
  FiPhone, FiMail
} from 'react-icons/fi';
import { GiCow, GiSheep, GiWeight, GiFarmTractor } from 'react-icons/gi';
import { FaTractor, FaRegChartBar, FaWhatsapp } from 'react-icons/fa';
import { MdAnalytics, MdHealthAndSafety, MdOutlineVerifiedUser } from 'react-icons/md';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { accountService } from '../../services/api';


// Type Definitions
interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  role: 'seller' | 'buyer';
  rating?: number | null;
  verified: boolean;
  location?: string | null;
  phone?: string | null;
  bio?: string | null;
  sellerSince?: string | null;
  totalListings?: number;
  profilePhoto?: string | null;
}

interface Listing {
  id: string;
  animalType: string;
  breed: string;
  age: number;
  weight: number;
  healthStatus: string;
  vaccinationStatus: string;
  price: number;
  description: string;
  location: string;
  status: 'available' | 'pending' | 'sold';
  views: number;
  images: string[];
  createdAt: string;
}

interface Connection {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  sellerPhone?: string;
  listingId?: string;
  listingType?: string;
  listingPrice?: number;
  contactMethod: 'call' | 'whatsapp' | 'message' | 'email';
  status: 'pending' | 'responded' | 'completed' | 'rejected';
  notes?: string;
  createdAt: string;
  lastContact: string;
}

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  avatar?: string;
  time?: string;
  preview?: string;
}

interface Notification {
  id: string;
  type: 'connection' | 'message' | 'system' | 'listing';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon?: React.ReactNode;
  time?: string;
}

// Component Props Types
interface NavItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
}

interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

interface ListingCardProps {
  listing: Listing;
}

interface ConnectionCardProps {
  connection: Connection;
  onFollowUp: (connectionId: string) => void;
}

interface ProfileCardProps {
  user: User;
  onEditClick: () => void;
}

interface SettingsFormProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
}

// Kenyan counties for location dropdown
const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Machakos',
  'Meru', 'Thika', 'Nyeri', 'Marsabit', 'Isiolo', 'Garissa',
  'Wajir', 'Mandera', 'Samburu', 'Turkana', 'Lodwar', 'Moyale'
];

// Components
const NavItem: React.FC<NavItemProps> = ({ icon, children, active = false, onClick, badge }) => (
  <li>
    <button 
      className={`flex items-center w-full p-3 rounded-lg transition-colors ${
        active ? 'bg-[#A52A2A]/10 text-[#A52A2A] font-medium' : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
    >
      <span className={`mr-3 ${active ? 'text-[#A52A2A]' : 'text-gray-500'}`}>{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-[#A52A2A] text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  </li>
);

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendPositive, className = '' }) => (
  <div className={`border rounded-xl p-5 bg-white ${className}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
      </div>
      <span className={`p-3 rounded-lg ${
        trendPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {icon}
      </span>
    </div>
    {trend && (
      <p className={`text-xs mt-3 ${
        trendPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend}
      </p>
    )}
  </div>
);

const Button: React.FC<ButtonProps> = ({ 
  children, 
  icon, 
  variant = 'solid', 
  size = 'base', 
  className = '',
  onClick,
  type = 'button',
  disabled = false
}) => (
  <button
    type={type}
    className={`flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
      variant === 'solid' 
        ? 'bg-[#A52A2A] text-white hover:bg-[#8a2323] shadow-sm' 
        : variant === 'outline'
          ? 'border border-[#A52A2A] text-[#A52A2A] hover:bg-[#A52A2A]/10'
          : 'text-[#A52A2A] hover:bg-[#A52A2A]/5'
    } ${
      size === 'sm' ? 'px-3 py-1.5 text-xs' : 
      size === 'lg' ? 'px-6 py-3 text-base' : 
      'px-4 py-2 text-sm'
    } ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
    {children}
  </button>
);

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    pending: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white">
      <div className="h-48 w-full bg-gray-100 flex items-center justify-center relative">
        {listing.images && listing.images.length > 0 ? (
          <img src={listing.images[0]} alt={listing.animalType} className="h-full w-full object-cover" />
        ) : (
          <GiCow className="text-5xl text-gray-400" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[listing.status]}`}>
            {listing.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900">{listing.animalType}</h3>
            <p className="text-sm text-gray-600">{listing.breed}</p>
          </div>
          <span className="text-[#A52A2A] font-bold">KES {listing.price.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400 text-sm" />
            <span className="text-xs text-gray-500">
              Listed {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" icon={<FiEdit2 size={14} />} />
            <Button size="sm">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onFollowUp }) => {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    responded: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const contactIcons = {
    call: <FiPhone className="text-green-600" />,
    whatsapp: <FaWhatsapp className="text-green-600" />,
    message: <FiMessageSquare className="text-blue-600" />,
    email: <FiMail className="text-red-600" />
  };

  const contactMethods = {
    call: 'Phone Call',
    whatsapp: 'WhatsApp',
    message: 'Message',
    email: 'Email'
  };

  const handleContact = () => {
    if (connection.sellerPhone) {
      switch (connection.contactMethod) {
        case 'call':
          window.location.href = `tel:${connection.sellerPhone}`;
          break;
        case 'whatsapp':
          window.open(`https://wa.me/${connection.sellerPhone.replace('+', '')}`, '_blank');
          break;
        default:
          onFollowUp(connection.id);
      }
    } else {
      onFollowUp(connection.id);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {connection.sellerPhoto ? (
              <img src={connection.sellerPhoto} alt={connection.sellerName} className="h-full w-full object-cover" />
            ) : (
              <FiUser className="text-gray-500 text-xl" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{connection.sellerName}</h3>
              <span className="text-sm">{contactIcons[connection.contactMethod]}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contacted via {contactMethods[connection.contactMethod]}
            </p>
            {connection.listingType && (
              <p className="text-sm text-gray-600 mt-1">
                Interested in {connection.listingType}
                {connection.listingPrice && ` - KES ${connection.listingPrice.toLocaleString()}`}
              </p>
            )}
            {connection.notes && (
              <p className="text-sm text-gray-500 mt-1">"{connection.notes}"</p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[connection.status]}`}>
                {connection.status}
              </span>
              <span className="text-xs text-gray-500">
                Last contact: {new Date(connection.lastContact).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleContact}
          className="ml-3 flex-shrink-0"
        >
          {connection.contactMethod === 'call' ? 'Call Again' : 
           connection.contactMethod === 'whatsapp' ? 'Chat Again' : 'Follow Up'}
        </Button>
      </div>
    </div>
  );
};

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditClick }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="relative">
        {user.profilePhoto ? (
          <img 
            src={user.profilePhoto} 
            alt={user.username}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-[#A52A2A]/10 flex items-center justify-center text-3xl font-bold text-[#A52A2A]">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        {user.verified && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 text-white">
            <MdOutlineVerifiedUser size={16} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            {user.rating && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <FiStar className="mr-1 text-amber-400" />
                  {user.rating.toFixed(1)} Seller Rating
                </span>
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            className="mt-3 sm:mt-0"
            icon={<FiEdit2 size={14} />}
            onClick={onEditClick}
          >
            Edit Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          {user.phone && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</h4>
              <p className="text-sm text-gray-900 mt-1">{user.phone}</p>
            </div>
          )}
          {user.location && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</h4>
              <p className="text-sm text-gray-900 mt-1">{user.location}</p>
            </div>
          )}
          {user.sellerSince && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seller Since</h4>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(user.sellerSince).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          )}
          {user.totalListings !== undefined && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</h4>
              <p className="text-sm text-gray-900 mt-1">{user.totalListings}</p>
            </div>
          )}
        </div>
        
        {user.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">About</h4>
            <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SettingsForm: React.FC<SettingsFormProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(user.profilePhoto || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updates = { ...formData };
      
      if (profilePhoto) {
        // In a real app, you would upload the photo to your server here
        updates.profilePhoto = `https://example.com/profile-photos/${user._id}-${Date.now()}.jpg`;
      }
      
      await onUpdate(updates);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600">Update your profile information</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={user.username}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+254..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select your location</option>
              {kenyanCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <div className="flex items-center space-x-4">
              {previewPhoto ? (
                <img 
                  src={previewPhoto} 
                  alt="Profile" 
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#A52A2A]/10 flex items-center justify-center text-xl font-bold text-[#A52A2A]">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profilePhoto"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="profilePhoto"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A52A2A]"
                >
                  <FiUpload className="mr-2" />
                  {previewPhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Tell others about yourself..."
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const AccountPage: React.FC = () => {

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<User>({
    _id: "",
    username: "",
    email: "",
    createdAt: "",
    role: "buyer",
    verified: false,
    phone: null,
    location: null,
    sellerSince: null,
    rating: null,
    totalListings: 0,
    profilePhoto: null,
    bio: null
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState({
    profile: false,
    listings: false,
    connections: false,
    messages: false,
    notifications: false
  });
  

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(prev => ({ ...prev, profile: true }));
        const userData = await accountService.getProfile();
        setUser(userData);
        
        // Fetch additional data based on user role
        if (userData.role === 'seller') {
          fetchListings();
        }
        fetchConnections();
        fetchMessages();
        fetchNotifications();
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      const updatedUser = await accountService.updateProfile(updates);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(prev => ({ ...prev, listings: true }));
      const listingsData = await accountService.getListings();
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(prev => ({ ...prev, listings: false }));
    }
  };

  const fetchConnections = async () => {
    try {
      setLoading(prev => ({ ...prev, connections: true }));
      // Mock connections data - in a real app, this would come from your API
      const mockConnections: Connection[] = [
        {
          id: '1',
          sellerId: 'seller1',
          sellerName: 'John Kamau',
          sellerPhone: '+254712345678',
          listingId: 'listing1',
          listingType: 'Dairy Cow',
          listingPrice: 45000,
          contactMethod: 'whatsapp',
          status: 'responded',
          notes: 'Interested in healthy dairy cow with good milk production',
          createdAt: '2023-10-15T10:30:00Z',
          lastContact: '2023-10-20T14:25:00Z'
        },
        {
          id: '2',
          sellerId: 'seller2',
          sellerName: 'Mary Wanjiku',
          sellerPhone: '+254723456789',
          listingId: 'listing2',
          listingType: 'Goats',
          listingPrice: 8000,
          contactMethod: 'call',
          status: 'pending',
          notes: 'Looking for 5 healthy goats',
          createdAt: '2023-10-18T16:45:00Z',
          lastContact: '2023-10-18T16:45:00Z'
        },
        {
          id: '3',
          sellerId: 'seller3',
          sellerName: 'James Ochieng',
          listingId: 'listing3',
          listingType: 'Chicken',
          contactMethod: 'message',
          status: 'completed',
          notes: 'Interested in 20 kienyeji chickens',
          createdAt: '2023-10-05T09:15:00Z',
          lastContact: '2023-10-12T11:30:00Z'
        }
      ];
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(prev => ({ ...prev, connections: false }));
    }
  };

  const fetchMessages = async () => {

    try {
      setLoading(prev => ({ ...prev, messages: true }));
      const messagesData = await accountService.getMessages();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      const notificationsData = await accountService.getNotifications();
      setNotifications(notificationsData);
    
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  const handleFollowUp = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      toast.info(`Following up with ${connection.sellerName}`);
      // In a real app, this would open a chat/message interface
    }
  };

  // Call these functions when their respective tabs are activated
  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'connections') {
      fetchConnections();
    } else if (activeTab === 'messages') {
      fetchMessages();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Listings</h2>
                <p className="text-gray-600">Manage your livestock and equipment listings</p>
              </div>
              <div className="flex space-x-3">
                <Button icon={<GiSheep />} variant="outline">
                  Livestock
                </Button>
                <Button icon={<FaTractor />} variant="outline">
                  Equipment
                </Button>
                <Button icon={<FiPlus />} className="hidden sm:flex">
                  New Listing
                </Button>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Active Listings" 
                value={listings.filter(l => l.status === 'available').length} 
                icon={<GiCow />}
                trend="+2 this month"
                trendPositive={true}
              />
              <StatCard 
                title="Total Views" 
                value={listings.reduce((sum, l) => sum + l.views, 0)} 
                icon={<FaRegChartBar />}
                trend="↑ 12% from last month"
                trendPositive={true}
              />
              <StatCard 
                title="Pending Approval" 
                value={listings.filter(l => l.status === 'pending').length} 
                icon={<FiCheck />}
                trend="1 needs attention"
                trendPositive={false}
                className="bg-amber-50 border-amber-200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        );
      case 'connections':
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Connections</h2>
                <p className="text-gray-600">People you've contacted about livestock</p>
              </div>
              <div className="flex space-x-3">
                <Button icon={<FiUsers />} variant="outline">
                  All Sellers
                </Button>
                <Button icon={<FiHeart />} variant="outline">
                  Favorites
                </Button>
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Total Connections" 
                value={connections.length} 
                icon={<FiUsers />}
                trend="+5 this week"
                trendPositive={true}
              />
              <StatCard 
                title="Responded" 
                value={connections.filter(c => c.status === 'responded' || c.status === 'completed').length} 
                icon={<FiMessageSquare />}
                trend="65% response rate"
                trendPositive={true}
              />
              <StatCard 
                title="Need Follow-up" 
                value={connections.filter(c => c.status === 'pending').length} 
                icon={<FiBell />}
                trend="3 waiting for response"
                trendPositive={false}
                className="bg-amber-50 border-amber-200"
              />
            </div>
            
            <div className="space-y-4">
              {connections.map(connection => (
                <ConnectionCard 
                  key={connection.id} 
                  connection={connection} 
                  onFollowUp={handleFollowUp}
                />
              ))}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                <p className="text-gray-600">Communicate with sellers</p>
              </div>
              <Button>New Message</Button>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              {messages.map(message => (
                <div key={message.id} className="border-b hover:bg-gray-50 px-4 py-3 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {message.avatar ? (
                        <img src={message.avatar} alt={message.sender} className="h-full w-full object-cover" />
                      ) : (
                        <FiUser className="text-gray-500 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900 truncate">{message.sender}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {message.time || new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.preview || message.subject}</p>
                    </div>
                    {!message.read && (
                      <span className="h-3 w-3 rounded-full bg-[#A52A2A] flex-shrink-0"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-600">Your recent account activity</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-[#A52A2A]"
                onClick={async () => {
                  try {
                    await accountService.markNotificationsAsRead();
                    setNotifications(prev => 
                      prev.map(n => ({ ...n, read: true }))
                    );
                    toast.success('Notifications marked as read');
                  } catch (error) {
                    toast.error('Failed to mark notifications as read');
                  }
                }}
              >
                Mark all as read
              </Button>
            </div>
            
            <div className="space-y-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    notification.read 
                      ? 'bg-white border-gray-200' 
                      : 'bg-[#A52A2A]/5 border-[#A52A2A]/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-4 ${
                      notification.read 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-[#A52A2A]/10 text-[#A52A2A]'
                    }`}>
                      {notification.icon || <FiBell />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {notification.time || new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return <SettingsForm user={user} onUpdate={handleUpdateProfile} />;
      default:
        return (
          <>
            <ProfileCard 
              user={user} 
              onEditClick={() => setActiveTab('settings')} 
            />
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Active Listings" 
                value={listings.filter(l => l.status === 'available').length} 
                icon={<GiCow />}
                trend="+2 this month"
                trendPositive={true}
              />
              <StatCard 
                title="Connections" 
                value={connections.length} 
                icon={<FiUsers />}
                trend="+5 this week"
                trendPositive={true}
              />
              <StatCard 
                title="Response Rate" 
                value={`${connections.length > 0 ? Math.round((connections.filter(c => c.status === 'responded' || c.status === 'completed').length / connections.length) * 100) : 0}%`} 
                icon={<FiMessageSquare />}
                trend="↑ 12% from last month"
                trendPositive={true}
              />
              <StatCard 
                title="Avg. Rating" 
                value={user.rating ? user.rating.toFixed(1) : 'N/A'} 
                icon={<FiStar />}
                trend={user.rating ? "↑ 0.2 this year" : undefined}
                trendPositive={user.rating ? true : undefined}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600">Your latest connections and interactions</p>
                </div>
                <Button variant="ghost" className="text-[#A52A2A]">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {connections.slice(0, 2).map(connection => (
                  <div key={connection.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          connection.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : connection.status === 'responded'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-amber-100 text-amber-600'
                        }`}>
                          <FiUsers />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Connected with {connection.sellerName}</h3>
                          <p className="text-sm text-gray-500">
                            {connection.listingType} • {new Date(connection.lastContact).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 capitalize">{connection.status}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          connection.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : connection.status === 'responded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {connection.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {messages.slice(0, 1).map(message => (
                  <div key={message.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <FiMessageSquare />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">New message from {message.sender}</h3>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{message.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {message.time || new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                        {!message.read && (
                          <span className="inline-block h-2 w-2 rounded-full bg-[#A52A2A] mt-1"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {user.role === 'seller' && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${
                      user.verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {user.verified ? <MdOutlineVerifiedUser size={24} /> : <MdHealthAndSafety size={24} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {user.verified ? 'Verified Seller' : 'Seller Verification'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {user.verified 
                          ? 'Your verified status helps build trust with potential buyers' 
                          : 'Complete verification to access all seller features'}
                      </p>
                      {!user.verified && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button icon={<FiUpload />}>
                            Upload Documents
                          </Button>
                          <Button variant="ghost" className="text-[#A52A2A]">
                            Learn More
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {user.verified && (
                    <div className="mt-4 md:mt-0">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        <FiCheck className="mr-1" /> Verified
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A52A2A] to-amber-600 py-8 px-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={user.username}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#A52A2A] shadow-md">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-amber-100">{user.email}</p>
                <div className="flex items-center mt-1 space-x-2">
                  {user.rating && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center">
                      <FiStar className="mr-1 text-amber-300" size={12} />
                      {user.rating.toFixed(1)} Seller Rating
                    </span>
                  )}
                  {user.verified && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center">
                      <MdOutlineVerifiedUser className="mr-1 text-green-300" size={12} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                icon={<FiBell />}
                onClick={() => {
                  setActiveTab('notifications');
                  setShowMobileMenu(false);
                }}
              />
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                icon={<FiHelpCircle />}
              />
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                icon={<FiSettings />}
                onClick={() => setActiveTab('settings')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden bg-white shadow-sm sticky top-0 z-10">
        <button 
          className="flex items-center justify-between w-full p-4 text-gray-700"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="font-medium">
            {activeTab === 'overview' ? 'Profile' : 
             activeTab === 'listings' ? 'Listings' : 
             activeTab === 'connections' ? 'Connections' : 
             activeTab === 'messages' ? 'Messages' : 
             activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
          <FiChevronRight className={`transition-transform ${showMobileMenu ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Desktop */}
          <div className="md:col-span-1 hidden md:block">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <nav>
                <ul className="space-y-1">
                  <NavItem 
                    icon={<FiUser />} 
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                  >
                    Profile Overview
                  </NavItem>
                  <NavItem 
                    icon={<FiUsers />} 
                    active={activeTab === 'connections'}
                    onClick={() => setActiveTab('connections')}
                    badge={connections.filter(c => c.status === 'pending').length}
                  >
                    My Connections
                  </NavItem>
                  {user.role === 'seller' && (
                    <>
                      <NavItem 
                        icon={<FiShoppingCart />} 
                        active={activeTab === 'listings'}
                        onClick={() => setActiveTab('listings')}
                      >
                        My Listings
                      </NavItem>
                    </>
                  )}
                  <NavItem 
                    icon={<FiMessageSquare />} 
                    active={activeTab === 'messages'}
                    onClick={() => setActiveTab('messages')}
                    badge={messages.filter(m => !m.read).length}
                  >
                    Messages
                  </NavItem>
                  <NavItem 
                    icon={<FiBell />} 
                    active={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                    badge={notifications.filter(n => !n.read).length}
                  >
                    Notifications
                  </NavItem>
                  <NavItem 
                    icon={<FaRegChartBar />} 
                    active={activeTab === 'analytics'}
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </NavItem>
                  <NavItem 
                    icon={<FiSettings />} 
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                  >
                    Account Settings
                  </NavItem>
                </ul>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar Navigation */}
          {showMobileMenu && (
            <div className="fixed inset-0 bg-black/50 z-20 md:hidden">
              <div className="bg-white h-full w-4/5 max-w-sm p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button 
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FiX />
                  </button>
                </div>
                <nav>
                  <ul className="space-y-1">
                    <NavItem 
                      icon={<FiUser />} 
                      active={activeTab === 'overview'}
                      onClick={() => {
                        setActiveTab('overview');
                        setShowMobileMenu(false);
                      }}
                    >
                      Profile Overview
                    </NavItem>
                    <NavItem 
                      icon={<FiUsers />} 
                      active={activeTab === 'connections'}
                      onClick={() => {
                        setActiveTab('connections');
                        setShowMobileMenu(false);
                      }}
                      badge={connections.filter(c => c.status === 'pending').length}
                    >
                      My Connections
                    </NavItem>
                    {user.role === 'seller' && (
                      <>
                        <NavItem 
                          icon={<FiShoppingCart />} 
                          active={activeTab === 'listings'}
                          onClick={() => {
                            setActiveTab('listings');
                            setShowMobileMenu(false);
                          }}
                        >
                          My Listings
                        </NavItem>
                      </>
                    )}
                    <NavItem 
                      icon={<FiMessageSquare />} 
                      active={activeTab === 'messages'}
                      onClick={() => {
                        setActiveTab('messages');
                        setShowMobileMenu(false);
                      }}
                      badge={messages.filter(m => !m.read).length}
                    >
                      Messages
                    </NavItem>
                    <NavItem 
                      icon={<FiBell />} 
                      active={activeTab === 'notifications'}
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowMobileMenu(false);
                      }}
                      badge={notifications.filter(n => !n.read).length}
                    >
                      Notifications
                    </NavItem>
                    <NavItem 
                      icon={<FaRegChartBar />} 
                      active={activeTab === 'analytics'}
                      onClick={() => {
                        setActiveTab('analytics');
                        setShowMobileMenu(false);
                      }}
                    >
                      Analytics
                    </NavItem>
                    <NavItem 
                      icon={<FiSettings />} 
                      active={activeTab === 'settings'}
                      onClick={() => {
                        setActiveTab('settings');
                        setShowMobileMenu(false);
                      }}
                    >
                      Account Settings
                    </NavItem>
                  </ul>
                </nav>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;