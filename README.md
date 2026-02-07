# Coffee Shop Web App (Final Project)

## Project Overview
This is a full-stack Coffee Shop web application.
Users can register/login, browse the menu, create orders, and manage their profile and orders in an Account page.

Backend:
- Node.js + Express REST API
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Protected routes via middleware

Frontend:
- HTML + CSS + Vanilla JavaScript (Fetch API)
- Login/Register dropdown panel
- Menu section (collapsible)
- Account page: view/update profile, view/update/delete orders

---

## Setup & Installation (Local)

### 1) Install dependencies
1. Open terminal in the project folder
2. Run:
npm install

### 2) Create .env file
Create a file named `.env` in the root folder and add:

PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY

### 3) Run the server
Run:
npm run dev

### 4) Open in browser
Open:
http://localhost:5000

---

## Authentication (How it works)
- After successful register/login, the server returns a JWT token.
- The frontend saves it in localStorage.
- Private requests include:
Authorization: Bearer <token>

---

## API Documentation

Access types:
- Public = no token required
- Private = JWT token required (Authorization header)

### Auth Routes (Public)
- POST /api/auth/register
  - Description: Register a new user (password is hashed)
  - Body (JSON):
    - username (string)
    - email (string)
    - password (string)

- POST /api/auth/login
  - Description: Login user and return JWT token
  - Body (JSON):
    - email (string)
    - password (string)

### User Routes (Private)
- GET /api/users/profile
  - Description: Get logged-in user profile

- PUT /api/users/profile
  - Description: Update user profile (username and/or password)
  - Body (JSON, optional fields):
    - username (string)
    - password (string)

### Second Resource Routes: Orders (Private CRUD)
Note: In the requirements document the second resource is shown as /api/resource.
In this project, the second resource is Orders and it is implemented as /api/orders.

- POST /api/orders
  - Description: Create new order
  - Body (JSON):
    - items: array of objects
      - productId (string)
      - qty (number)

- GET /api/orders
  - Description: Get all orders of logged-in user

- GET /api/orders/:id
  - Description: Get a specific order by id (only owner can access)

- PUT /api/orders/:id
  - Description: Update order status
  - Body (JSON):
    - status (string) one of: new, preparing, ready, delivered

- DELETE /api/orders/:id
  - Description: Delete order (only owner can delete)

### Menu Routes (Products)
- GET /api/orders/menu
  - Access: Public
  - Description: Get menu products (coffee/desserts)

- POST /api/orders/menu
  - Access: Private
  - Description: Add a new product to the menu
  - Body (JSON):
    - name (string)
    - price (number)
    - category (string, optional)
    - description (string, optional)

---

## Project Structure
controllers/
models/
routes/
middleware/
public/
config/
app.js
server.js
.env

