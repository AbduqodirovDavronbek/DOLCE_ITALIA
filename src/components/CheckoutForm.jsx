import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import { CartContext } from "../context/CartContext";

const CheckoutForm = ({ onNotification }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getShippingCost, getTotalPrice } =
    useContext(CartContext);

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [locationLatitude, setLocationLatitude] = useState(null);
  const [locationLongitude, setLocationLongitude] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [usePoints, setUsePoints] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [errors, setErrors] = useState({});
  const [checkoutError, setCheckoutError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const initialCoordsRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("dolce_italia_checkout_form");
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        setPhone(formData.phone || "");
        setFirstName(formData.firstName || "");
        setShippingAddress(formData.shippingAddress || "");
        setLocationUrl(formData.locationUrl || "");
        setLocationLatitude(formData.locationLatitude ?? null);
        setLocationLongitude(formData.locationLongitude ?? null);
        initialCoordsRef.current = [
          formData.locationLatitude,
          formData.locationLongitude,
        ];
        setPaymentMethod(formData.paymentMethod || "cash");
        setUsePoints(formData.usePoints || false);
      } catch (error) {
        console.error(error);
      }
    }
    setIsFormLoaded(true);
  }, []);

  useEffect(() => {
    if (!isFormLoaded) return;
    localStorage.setItem(
      "dolce_italia_checkout_form",
      JSON.stringify({
        phone,
        firstName,
        shippingAddress,
        locationUrl,
        locationLatitude,
        locationLongitude,
        paymentMethod,
        usePoints,
      }),
    );
  }, [
    phone,
    firstName,
    shippingAddress,
    locationUrl,
    locationLatitude,
    locationLongitude,
    paymentMethod,
    usePoints,
    isFormLoaded,
  ]);

  const cartSubtotal = getTotalPrice();
  const shippingCost = getShippingCost();
  const pointsDiscount = useMemo(
    () => (usePoints ? Math.min(availablePoints * 10000, cartSubtotal) : 0),
    [availablePoints, cartSubtotal, usePoints],
  );
  const displayTotal = Math.max(
    0,
    cartSubtotal - pointsDiscount + shippingCost,
  );

  const parseErrorData = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (Array.isArray(data))
      return data.map((item) => JSON.stringify(item)).join("; ");
    return typeof data === "object" ? JSON.stringify(data) : String(data);
  };

  const validateFields = () => {
    const nextErrors = {};

    if (!phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!shippingAddress.trim())
      nextErrors.shippingAddress = "Shipping address is required.";
    if (
      !locationUrl ||
      locationLatitude === null ||
      locationLongitude === null
    ) {
      nextErrors.locationUrl = "Please select a location on the map.";
    }

    return nextErrors;
  };

  const fetchUserPoints = async (phoneNumber) => {
    try {
      const response = await axiosInstance.post(
        "/api/orders/users/lookup-points",
        {
          phone: phoneNumber,
        },
      );
      if (response.data && typeof response.data.loyalty_points === "number") {
        return response.data.loyalty_points;
      }
    } catch (error) {
      console.error(error);
    }
    return 0;
  };

  const handlePhoneBlur = async () => {
    if (!phone.trim() || !isVerified) {
      setAvailablePoints(0);
      return;
    }
    const points = await fetchUserPoints(phone.trim());
    setAvailablePoints(points);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const buildLocationUrl = (latitude, longitude) =>
    `https://yandex.com/maps/?ll=${longitude},${latitude}&whatshere[point]=${longitude},${latitude}&z=17`;

  const setLocation = (latitude, longitude) => {
    setLocationLatitude(latitude);
    setLocationLongitude(longitude);
    setLocationUrl(buildLocationUrl(latitude, longitude));
  };

  const initializeMap = () => {
    const center =
      initialCoordsRef.current?.[0] != null &&
      initialCoordsRef.current?.[1] != null
        ? initialCoordsRef.current
        : [41.3111, 69.2797];

    const map = new window.ymaps.Map("yandex-map-pick", {
      center,
      zoom: 13,
      controls: ["zoomControl"],
    });

    const placemark = new window.ymaps.Placemark(
      center,
      { balloonContent: "Delivery pin" },
      { preset: "islands#redDotIcon", draggable: true },
    );

    map.geoObjects.add(placemark);
    mapRef.current = map;
    placemarkRef.current = placemark;

    map.events.add("click", (event) => {
      const coords = event.get("coords");
      if (coords?.length === 2) {
        setLocation(coords[0], coords[1]);
        placemark.geometry.setCoordinates(coords);
      }
    });

    placemark.events.add("dragend", () => {
      const coords = placemark.geometry.getCoordinates();
      if (coords?.length === 2) {
        setLocation(coords[0], coords[1]);
      }
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isFormLoaded || mapRef.current)
      return;

    let handleScriptLoad;
    let targetScript;

    const loadMap = () => {
      if (window.ymaps && window.ymaps.ready) {
        window.ymaps.ready(initializeMap);
        return;
      }

      const existingScript = document.getElementById("yandex-maps-script");
      if (existingScript) {
        targetScript = existingScript;
        handleScriptLoad = () => window.ymaps.ready(initializeMap);
        existingScript.addEventListener("load", handleScriptLoad);
        return;
      }

      const script = document.createElement("script");
      script.id = "yandex-maps-script";
      script.src = "https://api-maps.yandex.ru/2.1/?lang=en_US";
      script.async = true;
      script.onload = () => window.ymaps.ready(initializeMap);
      document.body.appendChild(script);
    };

    loadMap();

    return () => {
      if (targetScript && handleScriptLoad) {
        targetScript.removeEventListener("load", handleScriptLoad);
      }
    };
  }, [isFormLoaded]);

  const handleLocationClick = () => {
    if (isDetectingLocation || Boolean(locationUrl)) return;

    if (!navigator.geolocation) {
      onNotification?.(
        "Geolocation is not supported by this browser.",
        "warning",
      );
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current)
          mapRef.current.setCenter([latitude, longitude], 17, {
            checkZoomRange: true,
          });
        if (placemarkRef.current)
          placemarkRef.current.geometry.setCoordinates([latitude, longitude]);
        setLocation(latitude, longitude);
        setIsDetectingLocation(false);
      },
      () => {
        onNotification?.(
          "Could not get location. Please allow location access.",
          "error",
        );
        setIsDetectingLocation(false);
      },
    );
  };

  const sendVerificationCode = async () => {
    if (!phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
      return;
    }

    setVerificationError("");
    setIsSendingOtp(true);

    try {
      await axiosInstance.post("/api/auth/send-otp", { phone: phone.trim() });
      setVerificationSent(true);
    } catch (error) {
      setVerificationError(
        "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationError("Please enter the verification code.");
      return;
    }

    setVerificationError("");
    setIsVerifyingOtp(true);

    try {
      const response = await axiosInstance.post("/api/auth/verify-otp", {
        phone: phone.trim(),
        otp_code: Number(verificationCode.trim()),
      });

      if (response.data?.success) {
        setIsVerified(true);
        setAvailablePoints(await fetchUserPoints(phone.trim()));
      } else {
        setVerificationError(response.data?.message || "Verification failed.");
      }
    } catch (error) {
      setVerificationError("Could not verify code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const buildOrderPayload = () => ({
    phone: phone.trim(),
    first_name: firstName.trim(),
    shipping_address: shippingAddress.trim(),
    location_url: locationUrl.trim(),
    location_latitude: locationLatitude,
    location_longitude: locationLongitude,
    payment_method: paymentMethod,
    use_loyalty_points: usePoints,
    items: cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
  });

  const resetForm = () => {
    setPhone("");
    setFirstName("");
    setShippingAddress("");
    setLocationUrl("");
    setLocationLatitude(null);
    setLocationLongitude(null);
    setPaymentMethod("cash");
    setUsePoints(false);
    setAvailablePoints(0);
    setCheckoutError("");
    setVerificationSent(false);
    setVerificationCode("");
    setVerificationError("");
    setIsVerified(false);
    setIsDetectingLocation(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cartItems.length === 0) {
      onNotification?.("Your cart is empty.", "warning");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");
    const nextErrors = validateFields();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0];
      const element = document.querySelector(
        `.checkout__input[name="${firstField}"]`,
      );
      if (element) element.focus();
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/api/orders/checkout",
        buildOrderPayload(),
      );
      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url;
        return;
      }

      const orderData = {
        ...buildOrderPayload(),
        items: cartItems,
        total_amount_uzs: displayTotal,
      };
      onNotification?.("Order placed successfully!", "success");
      clearCart();
      resetForm();
      localStorage.removeItem("dolce_italia_checkout_form");
      navigate("/success", { state: { orderData } });
    } catch (error) {
      const apiError =
        parseErrorData(error?.response?.data?.detail) ||
        parseErrorData(error?.response?.data?.message);
      const message =
        apiError ||
        (error.message === "Network Error"
          ? "Network error: cannot reach backend"
          : error.message) ||
        "Please try again.";
      const fullError = `Could not complete checkout: ${message}`;
      setCheckoutError(fullError);
      onNotification?.(fullError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="checkout">
      <div className="container checkout__container">
        <h1 className="checkout__title">Checkout</h1>
        <div className="checkout__cart-preview">
          <h2 className="checkout__preview-title">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="checkout__preview-list">
              {cartItems.map((item) => (
                <li key={item.id} className="checkout__preview-item">
                  <span className="checkout__preview-item-name">
                    {item.title}
                  </span>
                  <span className="checkout__preview-item-details">
                    {item.quantity} × {Number(item.price).toLocaleString()} UZS
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="checkout__content">
          <form
            id="checkout-form"
            className="checkout__form"
            onSubmit={handleSubmit}
          >
            <div className="checkout__section">
              <h2 className="checkout__section-title">Delivery Details</h2>

              <label className="checkout__label">
                Phone Number
                <div className="checkout__verification-panel">
                  <div className="checkout__verification-row">
                    <input
                      className="checkout__input"
                      name="phone"
                      type="text"
                      value={phone}
                      onChange={(event) => {
                        if (!verificationSent) setPhone(event.target.value);
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      onBlur={handlePhoneBlur}
                      placeholder="+998901234567"
                      required
                      disabled={verificationSent}
                    />
                    <button
                      type="button"
                      className="button checkout__verification-button"
                      onClick={sendVerificationCode}
                      disabled={isSendingOtp || verificationSent}
                    >
                      {isSendingOtp
                        ? "Sending..."
                        : verificationSent
                          ? "Sent"
                          : "Send Verification Code"}
                    </button>
                  </div>

                  <p className="checkout__verification-note">
                    {verificationSent
                      ? "Verification code sent. Enter it below to confirm your phone."
                      : "We will send a one-time code to your phone to secure the order."}
                  </p>

                  {verificationSent && !isVerified && (
                    <div className="checkout__verification-row checkout__verification-code-row">
                      <input
                        className="checkout__input checkout__verification-input"
                        name="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(event) => {
                          setVerificationCode(event.target.value);
                          setVerificationError("");
                        }}
                        placeholder="Enter code"
                      />
                      <button
                        type="button"
                        className="button checkout__verification-button"
                        onClick={verifyCode}
                        disabled={isVerifyingOtp}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                      </button>
                    </div>
                  )}

                  {verificationError && (
                    <p className="checkout__field-error">{verificationError}</p>
                  )}
                  {isVerified && (
                    <p className="checkout__verification-success">
                      Phone verified successfully. You can now place the order.
                    </p>
                  )}
                </div>
                {errors.phone && (
                  <p className="checkout__field-error">{errors.phone}</p>
                )}
              </label>

              <label className="checkout__label">
                First Name
                <input
                  className="checkout__input"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  placeholder="Ali"
                  required
                />
                {errors.firstName && (
                  <p className="checkout__field-error">{errors.firstName}</p>
                )}
              </label>

              <label className="checkout__label">
                Shipping Address
                <input
                  className="checkout__input"
                  name="shippingAddress"
                  type="text"
                  value={shippingAddress}
                  onChange={(event) => {
                    setShippingAddress(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      shippingAddress: undefined,
                    }));
                  }}
                  placeholder="Street, building, apartment"
                  required
                />
                {errors.shippingAddress && (
                  <p className="checkout__field-error">
                    {errors.shippingAddress}
                  </p>
                )}
              </label>

              <label className="checkout__label">
                Delivery Location
                <div
                  id="yandex-map-pick"
                  style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    marginTop: "12px",
                  }}
                />
                <button
                  type="button"
                  className="button"
                  onClick={handleLocationClick}
                  disabled={isDetectingLocation || Boolean(locationUrl)}
                  style={{ marginTop: "12px" }}
                >
                  {locationUrl
                    ? "Location selected"
                    : isDetectingLocation
                      ? "Detecting location…"
                      : "📍 Detect My Current Location"}
                </button>
                {errors.locationUrl && (
                  <p className="checkout__field-error">{errors.locationUrl}</p>
                )}
                <p
                  className="checkout__location-status"
                  style={{ marginTop: "8px" }}
                >
                  {locationLatitude !== null && locationLongitude !== null
                    ? `Selected coordinates: ${locationLatitude.toFixed(6)}, ${locationLongitude.toFixed(6)}`
                    : "Click on the map or use the button to choose your location."}
                </p>
              </label>
            </div>

            <div className="checkout__section">
              <h2 className="checkout__section-title">Payment</h2>
              <fieldset className="checkout__fieldset">
                <legend>Select payment method</legend>
                <label className="checkout__radio-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="checkout__radio-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="click"
                    checked={paymentMethod === "click"}
                    onChange={() => setPaymentMethod("click")}
                  />
                  <span>Click</span>
                </label>
              </fieldset>
              {availablePoints > 0 && isVerified && (
                <label className="checkout__checkbox-label">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(event) => setUsePoints(event.target.checked)}
                  />
                  Use loyalty points ({availablePoints} available)
                </label>
              )}
            </div>
          </form>

          <aside className="checkout__summary">
            <div className="checkout__summary-box">
              <div className="checkout__summary-section">
                <h3 className="checkout__summary-section-title">Totals</h3>
                <div className="checkout__summary-row">
                  <span>Subtotal:</span>
                  <span>{cartSubtotal.toLocaleString()} UZS</span>
                </div>
                {usePoints && pointsDiscount > 0 && (
                  <div className="checkout__summary-row checkout__summary-discount">
                    <span>Loyalty Points discount:</span>
                    <span>−{pointsDiscount.toLocaleString()} UZS</span>
                  </div>
                )}
                <div className="checkout__summary-row">
                  <span>Shipping:</span>
                  <span>{shippingCost.toLocaleString()} UZS</span>
                </div>
                <div className="checkout__summary-divider" />
                <div className="checkout__summary-row checkout__summary-total">
                  <span>Total:</span>
                  <span>{displayTotal.toLocaleString()} UZS</span>
                </div>
              </div>

              <div className="checkout__summary-section">
                <h3 className="checkout__summary-section-title">Payment</h3>
                <div className="checkout__summary-row">
                  <span>Method:</span>
                  <span className="checkout__summary-value">
                    {paymentMethod === "cash"
                      ? "Cash on Delivery"
                      : paymentMethod === "click"
                        ? "Click"
                        : paymentMethod}
                  </span>
                </div>
                {availablePoints > 0 && isVerified && (
                  <div className="checkout__summary-row">
                    <span>Loyalty Points available:</span>
                    <span className="checkout__summary-value">
                      {availablePoints}
                    </span>
                  </div>
                )}
              </div>

              <button
                className="button"
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !isVerified}
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </button>
              {!isVerified && (
                <p className="checkout__warning-text">
                  Please verify your phone to enable placing the order.
                </p>
              )}
              {checkoutError && (
                <p className="checkout__error">{checkoutError}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CheckoutForm;
