export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role?: 'seller' | 'buyer';  // Make optional if not always present
  verified?: boolean;         // Make optional if not always present
  createdAt?: string;
  location?: string;
  phone?: string;
  bio?: string;
  rating?: number;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  role?: 'seller' | 'buyer';
  location?: string;
  phone?: string;
  bio?: string;
}

// src/api/types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Add any additional user fields you need
}

