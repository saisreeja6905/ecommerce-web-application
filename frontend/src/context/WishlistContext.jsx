import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const res = await wishlistService.getWishlist();
          if (res.success && res.wishlist) {
            setWishlist(res.wishlist);
          }
        } catch (err) {
          console.warn('[Wishlist] Error fetching wishlist:', err.message);
        } finally {
          setLoading(false);
        }
      } else {
        const local = localStorage.getItem('guest_wishlist');
        if (local) {
          try {
            setWishlist(JSON.parse(local));
          } catch {
            setWishlist({ products: [] });
          }
        } else {
          setWishlist({ products: [] });
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return (wishlist.products || []).some((item) => {
      const id = item._id || item;
      return id.toString() === productId.toString();
    });
  };

  const toggleWishlist = async (product) => {
    const productId = product._id;
    const exists = isInWishlist(productId);

    if (isAuthenticated) {
      try {
        if (exists) {
          const res = await wishlistService.removeFromWishlist(productId);
          if (res.success) setWishlist(res.wishlist);
        } else {
          const res = await wishlistService.addToWishlist(productId);
          if (res.success) setWishlist(res.wishlist);
        }
      } catch (err) {
        console.warn('[Wishlist] Error toggling item:', err.message);
      }
    } else {
      let updatedProducts;
      if (exists) {
        updatedProducts = (wishlist.products || []).filter(
          (p) => (p._id || p).toString() !== productId.toString()
        );
      } else {
        updatedProducts = [...(wishlist.products || []), product];
      }
      const newWishlist = { products: updatedProducts };
      setWishlist(newWishlist);
      localStorage.setItem('guest_wishlist', JSON.stringify(newWishlist));
    }
  };

  const wishlistCount = (wishlist.products || []).length;

  const value = {
    wishlist,
    loading,
    wishlistCount,
    isInWishlist,
    toggleWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
