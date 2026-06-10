import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "dolce_db")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

if not DB_USER or not DB_NAME:
    raise RuntimeError("Missing database credentials. Set DB_USER and DB_NAME in environment.")

columns_to_add = [
    ("payment_method", 'VARCHAR(50) DEFAULT "cash" NOT NULL'),
    ("points_earned", "INT DEFAULT 0 NOT NULL"),
    ("points_redeemed", "INT DEFAULT 0 NOT NULL"),
    ("location_url", "TEXT NOT NULL"),
    ("shipping_cost", "FLOAT DEFAULT 5.0"),
    ("tax_amount", "FLOAT"),
]

with pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    port=DB_PORT,
) as conn:
    with conn.cursor() as cursor:
        for column_name, column_definition in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {column_name} {column_definition}")
                print(f"Added column: {column_name}")
            except pymysql.err.OperationalError as exc:
                if "already exists" in str(exc):
                    print(f"Column {column_name} already exists")
                else:
                    print(f"Error adding {column_name}: {exc}")
    conn.commit()

print("All columns processed successfully")
