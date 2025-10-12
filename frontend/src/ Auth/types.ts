// src/Auth/types.ts
export interface AuthFormData {
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export type AuthMode = 'signin' | 'register' | null;