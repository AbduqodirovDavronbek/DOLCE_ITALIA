Deployed domain: https://dolce-italia.vercel.app/

Telegram group: t.me/dolce_italia_orders
 
 
 
 ```frontend
npm install
npm run dev

http://localhost:5173
```

```backend
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python init_db.py

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

http://localhost:8000/docs
```
