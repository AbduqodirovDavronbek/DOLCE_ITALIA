const Contact = () => {
  return (
    <section className="contact" id="contact">
      <div className="container contact__container">
        <div className="contact__info">
          <h2 className="contact__heading">
            Contact us and visit our gelateria
          </h2>

          <ul className="contact__contacts">
            <li>
              <a href="tel:+998712567881">+998 71 256-78-81</a>
            </li>
            <li>
              <a href="mailto:admin@dolceitalia.uz">admin@dolceitalia.uz</a>
            </li>
            <li>Mon–Sun: 10:00 – 22:30</li>
          </ul>
        </div>

        <div className="contact__box">
          <iframe
            title="Dolce Italia Map"
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d95921.85933029921!2d69.21403090751238!3d41.29672090354629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sDOLCE%20ITALIA!5e0!3m2!1sen!2s!4v1769678001179!5m2!1sen!2s"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Contact;
