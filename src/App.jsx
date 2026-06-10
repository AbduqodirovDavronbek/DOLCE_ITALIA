import { useContext, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Opportunity from "./components/Opportunity";
import Products from "./components/Products";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import CheckoutForm from "./components/CheckoutForm";
import Success from "./components/Success";
import Notification from "./components/Notification";
import { CartProvider, CartContext } from "./context/CartContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);
  const cartCount = getTotalItems();

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <Opportunity />
        <Products />
        <Contact />
      </main>
      <button
        className="home__cart-float button"
        onClick={handleCartClick}
        aria-label="Open cart"
      >
        <span className="home__cart-icon" aria-hidden="true">
          🛒
        </span>
        {cartCount > 0 && <span className="home__cart-count">{cartCount}</span>}
      </button>
      <Footer />
    </>
  );
};

const ProtectedLayout = ({ children }) => (
  <>
    <Header />
    <main className="main">{children}</main>
    <Footer />
  </>
);

function App() {
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
  });

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification({ message: "", type: "info" });
  };

  return (
    <CartProvider>
      <BrowserRouter>
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/cart"
            element={
              <ProtectedLayout>
                <Cart onNotification={showNotification} />
              </ProtectedLayout>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedLayout>
                <CheckoutForm onNotification={showNotification} />
              </ProtectedLayout>
            }
          />

          <Route
            path="/success"
            element={
              <ProtectedLayout>
                <Success />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
