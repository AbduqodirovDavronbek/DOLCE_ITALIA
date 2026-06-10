import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/dolce_italia_logo.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path, targetId = null) => {
    navigate(path);
    setIsOpen(false);

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  };

  return (
    <header className={`header ${isOpen ? "header--open" : ""}`}>
      <div className="container header__container">
        <a
          href="/"
          className="header__logo"
          onClick={(event) => {
            event.preventDefault();
            handleNavigate("/", "home");
          }}
        >
          <img src={logo} alt="dolce italia logo" />
        </a>

        <div className="header__right">
          <nav className="header__nav">
            <ul className="header__list">
              <li className="header__item">
                <a
                  href="/"
                  className="header__nav-link"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("/");
                  }}
                >
                  Home
                </a>
              </li>
              <li className="header__item">
                <a
                  href="/#delivery"
                  className="header__nav-link"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("/", "delivery");
                  }}
                >
                  Delivery
                </a>
              </li>
              <li className="header__item">
                <a
                  href="/#products"
                  className="header__nav-link"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("/", "products");
                  }}
                >
                  Products
                </a>
              </li>
              <li className="header__item">
                <a
                  href="/#contact"
                  className="header__nav-link"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("/", "contact");
                  }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <div className="header__actions">
            <button
              className="button"
              onClick={() => handleNavigate("/", "products")}
              type="button"
            >
              Start Shopping
            </button>
          </div>
        </div>

        <button
          className="header__hamburger"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="16" viewBox="0 0 20 16">
              <path
                d="M0 1h20M0 8h20M0 15h20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
