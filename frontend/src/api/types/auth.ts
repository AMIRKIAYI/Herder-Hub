export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string; // Optional since we validate before sending
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: 'seller' | 'buyer';
  verified: boolean;
  location?: string | null;
  phone?: string | null;
  bio?: string | null;
  rating?: number | null; // Optional, can be null if not rated
  sellerSince?: string | null; // Optional, can be null if not a seller
  totalListings?: number; // Optional, can be zero if no listings
  profilePhoto?: string | null; // Optional, can be null if no photo
  preferredContact?: 'email' | 'phone' | null; // Optional, can be null if not set
  listingsCount?: number; // Optional, can be zero if no listings
  // Add other user fields as needed
}

export interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}