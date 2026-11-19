import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever authentication state changes
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const res = await cartService.getCart();
          if (res.success && res.cart) {
            setCart(res.cart);
          }
        } catch (err) {
          console.warn('[Cart] Error loading cart:', err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Load guest cart from localStorage
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch {
            setCart({ items: [], totalPrice: 0 });
          }
        } else {
          setCart({ items: [], totalPrice: 0 });
        }
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart(product._id, quantity);
        if (res.success && res.cart) {
          setCart(res.cart);
          return { success: true };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Could not add product to cart',
        };
      }
    } else {
      // Guest cart handling
      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex(
        (i) => (i.product?._id || i.product) === product._id
      );

      if (existingIdx > -1) {
        currentItems[existingIdx].quantity += quantity;
      } else {
        currentItems.push({
          _id: `guest_${Date.now()}`,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images,
            brand: product.brand,
            stockCount: product.stockCount,
          },
          quantity,
          price: product.price,
        });
      }

      const total = currentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const newCart = { items: currentItems, totalPrice: Math.round(total * 100) / 100 };
      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      return { success: true };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const res = await cartService.updateItemQuantity(itemId, quantity);
        if (res.success && res.cart) {
          setCart(res.cart);
          return { success: true };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Could not update item quantity',
        };
      }
    } else {
      const currentItems = cart.items.map((item) => {
        if (item._id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      const total = currentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const newCart = { items: currentItems, totalPrice: Math.round(total * 100) / 100 };
      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      return { success: true };
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.removeItem(itemId);
        if (res.success && res.cart) {
          setCart(res.cart);
          return { success: true };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Could not remove item',
        };
      }
    } else {
      const currentItems = cart.items.filter((item) => item._id !== itemId);
      const total = currentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const newCart = { items: currentItems, totalPrice: Math.round(total * 100) / 100 };
      setCart(newCart);
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn('[Cart] Error clearing server cart:', err.message);
      }
    }
    const emptyCart = { items: [], totalPrice: 0 };
    setCart(emptyCart);
    localStorage.removeItem('guest_cart');
  };

  const totalItemsCount = (cart.items || []).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const value = {
    cart,
    loading,
    totalItemsCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
