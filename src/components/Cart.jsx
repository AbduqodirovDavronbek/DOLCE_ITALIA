import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Cart = ({ onNotification }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getShippingCost,
    getTotalWithShipping,
  } = useContext(CartContext);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      onNotification?.("Your cart is empty!", "warning");
      return;
    }
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");

    setTimeout(() => {
      const element = document.getElementById("products");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart">
        <div className="container cart__container">
          <h1 className="cart__title">Shopping Cart</h1>
          <div className="cart__empty">
            <p className="cart__empty-message">Your cart is empty</p>
            <button className="button" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart">
      <div className="container cart__container">
        <h1 className="cart__title">Shopping Cart</h1>

        <div className="cart__content">
          <div className="cart__items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart__item">
                <div className="cart__item-info">
                  <h3 className="cart__item-title">{item.title}</h3>
                  <p className="cart__item-price">
                    {typeof item.price === "number"
                      ? `${item.price.toLocaleString()} UZS`
                      : item.price}
                  </p>
                </div>

                <div className="cart__item-controls">
                  <button
                    className="cart__quantity-btn"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    -
                  </button>
                  <span className="cart__quantity">{item.quantity}</span>
                  <button
                    className="cart__quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="cart__item-total">
                  {(
                    (typeof item.price === "number"
                      ? item.price
                      : parseFloat(item.price.replace(/[^0-9.\-]/g, "")) || 0) *
                    item.quantity
                  ).toLocaleString()}{" "}
                  UZS
                </p>

                <button
                  className="cart__remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <aside className="cart__summary">
            <div className="cart__summary-box">
              <h2 className="cart__summary-title">Order Summary</h2>

              <div className="cart__summary-row">
                <span>Subtotal:</span>
                <span>{getTotalPrice().toLocaleString()} UZS</span>
              </div>

              <div className="cart__summary-row">
                <span>Shipping:</span>
                <span>{getShippingCost().toLocaleString()} UZS</span>
              </div>

              <div className="cart__summary-divider"></div>

              <div className="cart__summary-row cart__summary-total">
                <span>Total:</span>
                <span>{getTotalWithShipping().toLocaleString()} UZS</span>
              </div>

              <button className="button button--full" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button
                className="cart__continue-btn"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Cart;
