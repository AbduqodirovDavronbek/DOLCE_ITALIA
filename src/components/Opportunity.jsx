import iconShipping from "../assets/images/shipping-icon.svg";
import iconPackaging from "../assets/images/packaging-icon.svg";
import iconDelivery from "../assets/images/fast-delivery-icon.svg";

const Opportunity = () => {
  return (
    <section className="opportunity" id="delivery">
      <div className="container opportunity__container">
        <div className="opportunity__header">
          <p className="opportunity__eyebrow">Why choose Dolce Italia</p>
          <h2 className="opportunity__title">
            Every order is designed to delight
          </h2>
          <p className="opportunity__subtitle">
            From premium ingredients to precise handling and fast arrival, our
            service brings authentic Italian flavor straight to your door.
          </p>
        </div>

        <ul className="opportunity__list">
          <li className="opportunity__item">
            <div className="opportunity__icon">
              <img src={iconShipping} alt="Premium ingredients icon" />
            </div>
            <h3 className="opportunity__heading">Italian Quality</h3>
            <p className="opportunity__desc">
              Crafted with imported ingredients and fresh dairy for rich,
              authentic flavor in every scoop.
            </p>
          </li>

          <li className="opportunity__item">
            <div className="opportunity__icon">
              <img src={iconPackaging} alt="Packaging icon" />
            </div>
            <h3 className="opportunity__heading">Premium Packaging</h3>
            <p className="opportunity__desc">
              Safely sealed in elegant, insulated packaging so your order
              arrives fresh and visually beautiful.
            </p>
          </li>

          <li className="opportunity__item">
            <div className="opportunity__icon">
              <img src={iconDelivery} alt="Delivery icon" />
            </div>
            <h3 className="opportunity__heading">Fast Delivery</h3>
            <p className="opportunity__desc">
              Reliable same-day delivery across the city. We ensure your order
              arrives quickly and in perfect condition, ready to enjoy.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Opportunity;
