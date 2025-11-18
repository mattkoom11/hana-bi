'use client';

import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const findItemIndex = (items: CartItem[], id: string, size: string) =>
  items.findIndex((item) => item.id === id && item.size === size);

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (newItem, quantity = 1) =>
    set((state) => {
      const items = [...state.items];
      const index = findItemIndex(items, newItem.id, newItem.size);

      if (index > -1) {
        items[index] = {
          ...items[index],
          quantity: items[index].quantity + quantity,
        };
        return { items };
      }

      return {
        items: [...items, { ...newItem, quantity }],
      };
    }),
  removeItem: (id, size) =>
    set((state) => ({
      items: state.items.filter(
        (cartItem) => !(cartItem.id === id && cartItem.size === size)
      ),
    })),
  updateQuantity: (id, size, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (cartItem) => !(cartItem.id === id && cartItem.size === size)
          ),
        };
      }

      return {
        items: state.items.map((cartItem) =>
          cartItem.id === id && cartItem.size === size
            ? { ...cartItem, quantity }
            : cartItem
        ),
      };
    }),
  clearCart: () => set({ items: [] }),
}));

export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

