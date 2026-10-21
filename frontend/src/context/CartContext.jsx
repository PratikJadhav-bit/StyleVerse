import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id && i.size === action.payload.size);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id && i.size === action.payload.size
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => !(i.id === action.payload.id && i.size === action.payload.size)) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id && i.size === action.payload.size
            ? { ...i, qty: action.payload.qty }
            : i
        ).filter(i => i.qty > 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_COUPON':
      return { ...state, coupon: action.payload };
    default:
      return state;
  }
};

const initialState = {
  items: JSON.parse(localStorage.getItem('sv_cart') || '[]'),
  coupon: null,
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('sv_cart', JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const discount = state.coupon ? Math.round(total * 0.1) : 0;
  const finalTotal = total - discount;

  const addItem = (product, size = 'M') => dispatch({ type: 'ADD_ITEM', payload: { ...product, size } });
  const removeItem = (id, size) => dispatch({ type: 'REMOVE_ITEM', payload: { id, size } });
  const updateQty = (id, size, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, size, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const applyCoupon = (code) => {
    const valid = ['STYLE10', 'VERSE10', 'LUXURY10', 'VIP10'];
    if (valid.includes(code.toUpperCase())) {
      dispatch({ type: 'SET_COUPON', payload: code.toUpperCase() });
      return true;
    }
    return false;
  };

  return (
    <CartContext.Provider value={{
      items: state.items, coupon: state.coupon,
      total, discount, finalTotal, itemCount,
      addItem, removeItem, updateQty, clearCart, applyCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
