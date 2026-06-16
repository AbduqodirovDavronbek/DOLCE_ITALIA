import { useContext, useEffect, useState } from "react";
import productImg from "../assets/images/circle1.png";
import { CartContext } from "../context/CartContext";

const BASE_API_URL = import.meta.env.VITE_API_URL || "https://dolce-italia-backend.onrender.com"; 

const getProductImageUrl = (imageUrl) => {
  if (!imageUrl) return productImg;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return `${BASE_API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`; 
};

const Products = () => {
  const [category, setCategory] = useState('discount');
  const [products, setProducts] = useState({
    discount: [],
    icecream: [],
    coffee: [],
    beverage: [],
    dessert: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {

        const response = await fetch(`${BASE_API_URL}/api/products`); 
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const grouped = {
          discount: [],
          icecream: [],
          coffee: [],
          beverage: [],
          dessert: [],
        };
        data.forEach((product) => {
          const categoryKey = product.category || 'icecream';
          if (grouped[categoryKey]) {
            grouped[categoryKey].push(product);
          } else {
            grouped[categoryKey] = [product];
          }
        });
        setProducts(grouped);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoadError('Unable to load products right now. Please make sure the backend is running and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { key: "discount", label: "Discount" },
    { key: "icecream", label: "Ice-cream" },
    { key: "coffee", label: "Coffee" },
    { key: "beverage", label: "Beverage" },
    { key: "dessert", label: "Dessert" },
  ];

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section className="products" id="products">
      <div className="container products__container">
        <h2 className="products__title">Products</h2>

        <ul className="products__nav">
          {categories.map((item) => (
            <li
              key={item.key}
              onClick={() => setCategory(item.key)}
              className={category === item.key ? "active" : ""}
            >
              {item.label}
            </li>
          ))}
        </ul>

        {loadError ? (
          <div className="products__error">{loadError}</div>
        ) : loading ? (
          <div className="products__loading">Loading products...</div>
        ) : products[category].length === 0 ? (
          <div className="products__empty">
            No products available in this category.
          </div>
        ) : (
          <ul className="products__list">
            {products[category].map((item) => (
              <li className="products__item" key={item.id}>
                <div className="products__left">
                  <h2 className="products__heading">{item.title}</h2>
                  <p className="products__desc">
                    {item.description ||
                      "Freshly made with authentic Italian ingredients and love."}
                  </p>

                  <div className="products__price-box">
                    {item.old_price && (
                      <span className="old-price">
                        {Number(item.old_price).toLocaleString()} UZS
                      </span>
                    )}
                    <span className="new-price">
                      {Number(item.price).toLocaleString()} UZS
                    </span>
                  </div>

                  {getCartItemQuantity(item.id) === 0 ? (
                    <button
                      className="button"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="products__quantity-controls">
                      <button
                        className="products__quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            getCartItemQuantity(item.id) - 1,
                          )
                        }
                      >
                        -
                      </button>
                      <span className="products__quantity">
                        {getCartItemQuantity(item.id)}
                      </span>
                      <button
                        className="products__quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            getCartItemQuantity(item.id) + 1,
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div className="products__img">
                  <img
                    className="products__image"
                    src={getProductImageUrl(item.image_url)}
                    alt={item.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Products;
