import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// Enhanced interfaces to match CartPage requirements
interface Seller {
  id: string;
  name: string;
  rating: number;
  contact: string;
  animalsSold: number;
  responseTime: string;
}

interface CartItem {
  id: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
  price: number;
  location: string;
  image?: string;
  seller: Seller;
  savedForLater: boolean;
  offerAmount: number | null;
  notes: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'savedForLater' | 'offerAmount' | 'notes'>) => void;
  removeFromCart: (id: string) => void;
  toggleSaveForLater: (id: string) => void;
  updateOffer: (id: string, amount: number | null) => void;
  updateNotes: (id: string, notes: string) => void;
  sendOfferToSeller: (id: string) => Promise<void>;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Get user-specific cart key for localStorage
const getCartKey = (userId: string | null) => {
  return userId ? `cartItems_${userId}` : 'cartItems_guest';
};

// Load cart from localStorage for specific user
const loadCartFromStorage = (userId: string | null): CartItem[] => {
  try {
    const cartKey = getCartKey(userId);
    const storedCart = localStorage.getItem(cartKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage for specific user
const saveCartToStorage = (userId: string | null, cartItems: CartItem[]) => {
  try {
    const cartKey = getCartKey(userId);
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth(); // Get current user from AuthContext

  // Load cart from localStorage on component mount or when user changes
  useEffect(() => {
    const savedCart = loadCartFromStorage(user?.id || null);
    setCartItems(savedCart);
  }, [user?.id]);

  // Save cart to localStorage whenever cart items change
  useEffect(() => {
    saveCartToStorage(user?.id || null, cartItems);
  }, [cartItems, user?.id]);

  const addToCart = (item: Omit<CartItem, 'savedForLater' | 'offerAmount' | 'notes'>) => {
    setCartItems(prev => {
      // Check if item already exists in cart
      if (prev.some(cartItem => cartItem.id === item.id)) {
        toast.info('This item is already in your cart');
        return prev;
      }
      
      const newItem: CartItem = { 
        ...item, 
        savedForLater: false, 
        offerAmount: null, 
        notes: '' 
      };
      
      const newCartItems = [...prev, newItem];
      toast.success('Item added to cart');
      return newCartItems;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const toggleSaveForLater = (id: string) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, savedForLater: !item.savedForLater } : item
    ));
  };

  const updateOffer = (id: string, amount: number | null) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, offerAmount: amount } : item
    ));
  };

  const updateNotes = (id: string, notes: string) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };

  const sendOfferToSeller = async (id: string): Promise<void> => {
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      if (!item.offerAmount) {
        throw new Error('No offer amount specified');
      }

      // Simulate API call to send offer to seller
      // In a real implementation, this would be an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Here you would typically make an API call to notify the seller
      console.log(`Offer sent for item ${id}: ${item.offerAmount}`);
      
      // You might want to update the item status here
      // For example: mark that an offer has been sent
    } catch (error) {
      console.error('Failed to send offer:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  const cartItemCount = cartItems.length;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart,
      toggleSaveForLater,
      updateOffer,
      updateNotes,
      sendOfferToSeller,
      cartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

