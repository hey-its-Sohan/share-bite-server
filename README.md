

# ShareBite (Server)

Live API URL: https://sharebite-server-five.vercel.app/

---

## 🧠 Project Purpose

This is the backend server for ShareBite — a food-sharing platform built using Node.js and Express, with MongoDB as the database and Firebase Admin SDK for authentication. It handles food sharing, requesting, and secure user-specific data access.

---

## 🚀 Key Features

- 🔐 Firebase token-based route protection
- 📥 Add / Update / Delete food data
- 📊 Filter and query for featured foods, available foods
- 📤 Request food and track request history
- 🧾 Separate endpoints for donor and requester
- 📄 MongoDB Atlas storage
- ⚠ Error handling with proper status codes

---

## 📦 Major NPM Packages Used

- **Express** – Web framework
- **MongoDB** – Database driver
- **Cors** – Handle cross-origin requests
- **dotenv** – Environment variable management
- **Firebase Admin SDK** – Verify user tokens
- **Nodemon** – Dev-only auto-reload

---

## 🧪 API Endpoints (Summary)

| Method | Endpoint                   | Description                     |
|--------|----------------------------|---------------------------------|
| GET    | `/all-foods`               | Get available foods             |
| GET    | `/my-foods`                | Get foods added by current user|
| GET    | `/my-requests`             | Get foods requested by user    |
| POST   | `/add-food`                | Add a new food item             |
| PATCH  | `/update-food/:id`         | Update food item by ID          |


---

