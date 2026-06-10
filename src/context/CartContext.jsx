import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();
const STORAGE_KEY = "dolce_italia_cart";

const parsePrice = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizePrice = (value) => {
  const price = parsePrice(value);
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("$") || lower.includes("usd")) return price * 10000;
  }
  return price > 0 && price < 1000 ? price * 10000 : price;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(
          parsed.map((item) => ({
            ...item,
            price: normalizePrice(item.price),
          })),
        );
      } catch (error) {
        console.error(error);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, loaded]);

  const addToCart = (product) => {
    const price = normalizePrice(product.price);
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item,
        );
      }
      return [
        ...prevItems,
        { ...product, price, quantity: product.quantity || 1 },
      ];
    });
  };

  const removeFromCart = (productId) =>
    setCartItems((prev) => prev.filter((item) => item.id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + parsePrice(item.price) * item.quantity,
      0,
    );
  const SHIPPING_COST = 25000;
  const getShippingCost = () => SHIPPING_COST;
  const getTotalWithShipping = () => getTotalPrice() + SHIPPING_COST;
  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getShippingCost,
        getTotalWithShipping,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
