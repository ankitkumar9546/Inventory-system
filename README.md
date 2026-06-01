# 📦 Oversee Flow — Inventory & Order Management System

**Oversee Flow** is a lightweight, responsive web application designed to help businesses manage their products, customers, and orders. The project is designed with a React single-page app frontend, a fast FastAPI backend, and a PostgreSQL database. It is fully containerized and configured for quick local setups or direct online hosting.

---

## 🛠️ The Tech Stack

* **Frontend**: React 18, React Router v6, Axios, custom modern styling, and `react-hot-toast` for fluid user feedback.
* **Backend**: Python 3.11, FastAPI (structured with APIRouter and clean endpoints), SQLAlchemy (with database row-level locking for inventory sanity), and Pydantic v2 for solid validation.
* **Database**: PostgreSQL 15.
* **Orchestration & Tooling**: Docker, Docker Compose, Nginx (frontend static hosting & reverse proxy), and Git.

---

## ✨ Features That Make It Solid

1. **Intelligent Stock Protection**: Places row-level database locks (`with_for_update`) during checkout to prevent concurrency/race issues. If two people buy the same product at the exact same millisecond, the database handles it safely.
2. **Double-buy Aggregation**: If an order contains the same product on multiple lines, the backend aggregates the quantities first before comparing against stock levels.
3. **Safe Order Cancellations**: When you delete/cancel an order, all matching items are returned back to stock.
4. **Unique SKU & Email Protection**: Automatic case-insensitive checks and database constraint fallback catches duplicate SKUs and customer emails cleanly.
5. **Real-time Dashboard**: Quick metrics on total inventory count, active customer list, orders, and a low-stock alert system.

---

## ⚡ Quick Start with Docker Compose

If you have Docker installed, you can spin up the database, API, and frontend in one go:

1. **Set up your environment**:
   ```bash
   cp .env.example .env
   ```
   *(Open `.env` and set a secure `POSTGRES_PASSWORD`).*

2. **Launch the services**:
   ```bash
   docker compose up --build
   ```

3. **Enjoy the app locally**:
   * **React Frontend**: [http://localhost:3000](http://localhost:3000)
   * **FastAPI Web Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 💻 Manual Setup (Local Development)

If you prefer to run services natively for active debugging or hot-reloading:

### 🐍 Backend API Setup
*Note: If you are using Python 3.14 on Windows, Pydantic-core wheel compilation might fail due to PyO3 maximum version limits. We highly recommend using Python 3.12 (inside `backend/.venv312` which is pre-configured).*

1. **Navigate and activate virtual environment**:
   ```bash
   cd backend
   # Windows:
   .\.venv312\Scripts\activate
   # Linux/macOS:
   source .venv312/bin/activate
   ```
2. **Run tests**:
   ```bash
   pytest
   ```
3. **Start backend**:
   ```bash
   uvicorn app.main:app --reload
   ```

### ⚛️ Frontend React Setup
1. **Navigate and launch**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 🔗 Live Production URLs

The system is fully deployed online and protected with strict production-grade CORS configurations.

| Deliverable | Link |
| :--- | :--- |
| **GitHub Repository** | [https://github.com/ankitkumar9546/Inventory-system](https://github.com/ankitkumar9546/Inventory-system) |
| **Live Frontend URL** | [https://inventory-system-eight-delta.vercel.app](https://inventory-system-eight-delta.vercel.app) |
| **Live Backend API URL** | [https://inventory-system-production-1447.up.railway.app](https://inventory-system-production-1447.up.railway.app) |
| **Docker Hub Backend Image** | [https://hub.docker.com/r/mortis954/inventory-backend](https://hub.docker.com/r/mortis954/inventory-backend) |

---

## 📂 Project Anatomy

```text
inventory-system/
  backend/               # FastAPI application, Pydantic schemas, and tests
    app/
      models/            # SQLAlchemy database models
      routers/           # Products, Customers, and Orders endpoints
      schemas/           # Pydantic data schemas & text sanitization
      database.py        # Connection setup (SQLite/PostgreSQL switcher)
      main.py            # CORS middleware and core routes
    tests/               # Pytest suite
    Dockerfile
  frontend/              # React single-page app
    src/
      api/               # Axios central request handler
      pages/             # Customers, Dashboard, Orders, Products pages
      App.js             # Route structure and main layout
    vercel.json          # SPA router fallback configurations
    Dockerfile
  docker-compose.yml     # Orchestration recipe
```
