import iceCream from "../assets/images/ice-cream-bg.png";

const Hero = () => (
  <section className="hero" id="home">
    <div className="container hero__container">
      <div className="hero__left">
        <h1 className="hero__heading">Feel inside cold with our delicious ice-cream</h1>
        <p className="hero__desc">
          Cool down with every bite! Our premium ice cream is crafted to give you the perfect icy refreshment on a warm day.
          Smooth, decadent, and delightfully chilled—exactly what you are craving.
        </p>
      </div>
      <div className="hero__right">
        <img src={iceCream} alt="Ice cream" className="hero__img" />
      </div>
    </div>
  </section>
);

export default Hero;
