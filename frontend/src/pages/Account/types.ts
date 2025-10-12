// types.ts
export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  role: 'seller' | 'buyer';
  verified: boolean;
  location?: string | null;
  phone?: string | null;
  bio?: string | null;
  sellerSince?: string | null;
  totalListings?: number;
  profilePhoto?: string | null;
  rating?: number | null;
}

export interface Listing {
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

export interface Connection {
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

export interface Message {
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

export interface Notification {
  id: string;
  type: 'connection' | 'message' | 'system' | 'listing';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon?: React.ReactNode;
  time?: string;
}

export interface NavItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
}

export interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export interface ListingCardProps {
  listing: Listing;
}

export interface ConnectionCardProps {
  connection: Connection;
  onFollowUp: (connectionId: string) => void;
}

export interface ProfileCardProps {
  user: User;
  onEditClick: () => void;
}

export interface SettingsFormProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
}