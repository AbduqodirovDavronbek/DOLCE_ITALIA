from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from app.db import engine
from app.models import Base, Product

load_dotenv()
Session = sessionmaker(bind=engine, future=True, autoflush=False, expire_on_commit=False)


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_products():
    session = Session()
    existing_products = {product.id: product for product in session.scalars(select(Product)).all()}
    products = [
        Product(
            id="d1",
            title="Strawberry Gelato",
            price=40000,
            old_price=60000,
            category="discount",
            in_stock=50,
            description="Creamy and refreshing Italian-style gelato made with ripe, sweet strawberries.",
            image_url="/static/images/strawberry_gelato.jpg",
        ),
        Product(
            id="d2",
            title="Chocolate Dream",
            price=35000,
            old_price=50000,
            category="discount",
            in_stock=45,
            description="A rich and indulgent premium chocolate treat crafted for true chocolate lovers.",
            image_url="/static/images/chocolate_dream.jpg",
        ),
        Product(
            id="d3",
            title="Vanilla Classic",
            price=30000,
            old_price=45000,
            category="discount",
            in_stock=60,
            description="Smooth, classic vanilla frozen dessert infused with authentic vanilla bean notes.",
            image_url="/static/images/classic_vanilla.jpg",
        ),
        Product(
            id="d4",
            title="Amarena",
            price=35000,
            old_price=60000,
            category="discount",
            in_stock=30,
            description="Discover the rich, authentic taste of Amarena, a prized Italian sour cherry.",
            image_url="/static/images/amarena.jpg",
        ),
        Product(
            id="i1",
            title="Italian Pistachio",
            price=50000,
            category="icecream",
            in_stock=40,
            description="Authentic Mediterranean-style ice cream featuring finely ground roasted pistachios.",
            image_url="/static/images/pistachio.jpg",
        ),
        Product(
            id="i2",
            title="Caramel Swirl",
            price=55000,
            category="icecream",
            in_stock=35,
            description="Velvety vanilla base mixed with dense ribbons of sweet, buttery golden caramel.",
            image_url="/static/images/caramel_swirl.jpg",
        ),
        Product(
            id="i3",
            title="Berry Mix",
            price=52000,
            category="icecream",
            in_stock=50,
            description="A vibrant and tangy blend of raspberries, blueberries, and blackberries.",
            image_url="/static/images/berry_mix.jpg",
        ),
        Product(
            id="c1",
            title="Cappuccino",
            price=30000,
            category="coffee",
            in_stock=30,
            description="A perfectly balanced espresso drink topped with velvety milk foam.",
            image_url="/static/images/cappuccino.jpg",
        ),
        Product(
            id="c2",
            title="Latte",
            price=35000,
            category="coffee",
            in_stock=40,
            description="Smooth espresso combined with steamed milk and a light foam layer.",
            image_url="/static/images/latte.jpg",
        ),
        Product(
            id="c3",
            title="Espresso",
            price=25000,
            category="coffee",
            in_stock=50,
            description="A bold shot of premium dark roast coffee beans with rich crema.",
            image_url="/static/images/espresso.jpg",
        ),
        Product(
            id="b1",
            title="Iced Tea",
            price=28000,
            category="beverage",
            in_stock=100,
            description="Chilled black tea brewed to perfection with a hint of citrus.",
            image_url="/static/images/iced_tea.jpg",
        ),
        Product(
            id="b2",
            title="Milkshake",
            price=42000,
            category="beverage",
            in_stock=45,
            description="Thick, whipped ice cream beverage topped with sweet milk foam.",
            image_url="/static/images/milkshake.jpg",
        ),
        Product(
            id="b3",
            title="Lemonade",
            price=26000,
            category="beverage",
            in_stock=80,
            description="Crisp, tart, and refreshing fresh-squeezed lemonade.",
            image_url="/static/images/lemonade.jpg",
        ),
        Product(
            id="de1",
            title="Tiramisu",
            price=45000,
            category="dessert",
            in_stock=25,
            description="Italian dessert made of coffee-soaked ladyfingers and creamy mascarpone.",
            image_url="/static/images/tiramisu.jpg",
        ),
        Product(
            id="de2",
            title="Cheesecake",
            price=48000,
            category="dessert",
            in_stock=20,
            description="Rich New York-style cheesecake with a buttery graham cracker crust.",
            image_url="/static/images/cheesecake.jpg",
        ),
        Product(
            id="de3",
            title="Brownie",
            price=39000,
            category="dessert",
            in_stock=35,
            description="Fudgy chocolate brownie bar packed with cocoa intensity.",
            image_url="/static/images/brownie.jpg",
        ),
    ]
    for product in products:
        existing = existing_products.get(product.id)
        if existing:
            for field, value in product.__dict__.items():
                if field != "_sa_instance_state":
                    setattr(existing, field, value)
        else:
            session.add(product)
    session.commit()


if __name__ == "__main__":
    init_db()
    seed_products()
