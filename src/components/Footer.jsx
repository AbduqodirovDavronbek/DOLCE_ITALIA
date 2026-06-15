import { useNavigate } from "react-router-dom";
import footerLogo from "../assets/images/dolce-italia-logo-text.svg";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigate = (path, targetId = null) => {
    navigate(path);

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer__container">
        <a
          href="/#home"
          className="footer__logo"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("/", "home");
          }}
        >
          <img src={footerLogo} alt="dolce italia logo" />
        </a>

        <div className="footer__right">
          <nav className="footer__nav">
            <ul className="footer__list">
              <li className="footer__item">
                <a
                  href="/#home"
                  className="footer__nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate("/", "home");
                  }}
                >
                  Home
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="/#delivery"
                  className="footer__nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate("/", "delivery");
                  }}
                >
                  Delivery
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="/#products"
                  className="footer__nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate("/", "products");
                  }}
                >
                  Products
                </a>
              </li>
              <li className="footer__item">
                <a
                  href="/#contact"
                  className="footer__nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate("/", "contact");
                  }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <div className="footer__right--icons-box">
            <a
              href="https://www.facebook.com/DolceItalia/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__icon footer__icon--facebook"
            >
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0Z" />
              </svg>
            </a>

            <a
              href="https://www.instagram.com/dolceitaliauzb/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__icon footer__icon--instagram"
            >
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001Z" />
              </svg>
            </a>

            <a
              href="https://t.me/dolceitaliauzb"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__icon footer__icon--telegram"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.847 3.507a1.2 1.2 0 0 0-1.389-.327L3.66 10.425a1.2 1.2 0 0 0 .17 2.27l4.104 1.343 1.61 4.819a1.2 1.2 0 0 0 2.167.223l1.757-2.9 3.061 1.987a1.2 1.2 0 0 0 1.978-1.18L22.76 5.01a1.2 1.2 0 0 0-.913-1.503z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
