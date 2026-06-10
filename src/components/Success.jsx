import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const items = orderData?.items ?? [];

  useEffect(() => {
    if (!orderData) navigate("/");
  }, [orderData, navigate]);

  if (!orderData) return null;

  const handleContinueShopping = () => {
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById("products");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section className="success">
      <div className="container success__container">
        <div className="success__content">
          <div className="success__icon">✓</div>
          <h1 className="success__title">Order Placed Successfully!</h1>
          <p className="success__message">
            Thank you for your order. We've received your delivery request and
            will process it shortly.
          </p>

          <div className="success__details">
            <div className="success__detail-group">
              <h3 className="success__detail-label">Order Details</h3>
              <div className="success__detail-item">
                <span className="success__detail-key">Customer Name:</span>
                <span className="success__detail-value">
                  {orderData.first_name}
                </span>
              </div>
              <div className="success__detail-item">
                <span className="success__detail-key">Phone Number:</span>
                <span className="success__detail-value">{orderData.phone}</span>
              </div>
              <div className="success__detail-item">
                <span className="success__detail-key">Delivery Address:</span>
                <span className="success__detail-value">
                  {orderData.shipping_address}
                </span>
              </div>
            </div>

            <div className="success__detail-group">
              <h3 className="success__detail-label">Order Items</h3>
              <ul className="success__items-list">
                {items.map((item, index) => (
                  <li key={index} className="success__items-item">
                    <span className="success__item-name">{item.title}</span>
                    <span className="success__item-quantity">
                      Qty: {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="success__detail-group">
              <h3 className="success__detail-label">Order Total</h3>
              <div className="success__total">
                {orderData.total_amount_uzs
                  ? `${Number(orderData.total_amount_uzs).toLocaleString()} UZS`
                  : "Processing..."}
              </div>
            </div>

            <div className="success__detail-group">
              <h3 className="success__detail-label">Payment Method</h3>
              <span className="success__payment-method">
                {orderData.payment_method === "cash"
                  ? "Cash on Delivery"
                  : orderData.payment_method === "click"
                    ? "Click"
                    : orderData.payment_method}
              </span>
            </div>
          </div>

          <div className="success__info-box">
            <h3 className="success__info-title">What's Next?</h3>
            <ul className="success__info-list">
              <li>Our team will review your order and confirm delivery</li>
              <li>You'll receive updates on your phone number</li>
              <li>Estimated delivery time: 1-2 business hours</li>
            </ul>
          </div>

          <button
            className="button success__button"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  );
};

export default Success;
