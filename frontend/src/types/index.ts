// src/types/index.ts
export type User = {
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
};

export type Listing = {
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
};

export type Order = {
  id: string;
  listing: string;
  seller: string;
  buyer: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  shipDate?: string;
  deliveryDate?: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  avatar?: string; // Optional avatar URL for sender/recipient
};

export type Notification = {
  id: string;
  type: 'order' | 'message' | 'system' | 'listing';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};