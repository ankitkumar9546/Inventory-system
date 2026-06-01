# Oversee Flow - Inventory & Order Management System

Production-ready full-stack inventory and order management system built with React, FastAPI, PostgreSQL, Docker, and Docker Compose.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| Frontend | React 18, React Router, Axios, React Hot Toast |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |
| Deployment Targets | Render or Railway for API, Vercel or Netlify for frontend |

## Features

- Product CRUD with unique SKU validation, pricing, stock quantity, and optional description.
- Customer creation/listing/deletion with unique validated email addresses.
- Order creation, listing, detail view, and cancellation.
- Backend-calculated order totals.
- Inventory deduction on order creation and inventory restoration on cancellation.
- Insufficient-stock protection, including duplicate product lines in the same order.
- Dashboard with total products, customers, orders, and low-stock products.
- Responsive React UI with form validation and clear success/error messages.
- Fully containerized backend, frontend, and PostgreSQL services.

## Quick Start With Docker Compose

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` and set a secure `POSTGRES_PASSWORD`.

3. Start the full stack:

```bash
docker compose up --build
```

4. Open the services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## API Endpoints

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel/delete order and restore stock |

### Dashboard And Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Summary metrics and low-stock products |
| GET | `/health` | Health check |

## Local Development

Backend:

```bash
cd backend
pip install -r requirements-dev.txt
pytest
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm start
```

## Environment Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `POSTGRES_USER` | Docker Compose database | PostgreSQL username |
| `POSTGRES_PASSWORD` | Docker Compose database | PostgreSQL password; required |
| `POSTGRES_DB` | Docker Compose database | PostgreSQL database name |
| `DATABASE_URL` | Backend hosting | External PostgreSQL connection string |
| `CORS_ORIGINS` | Backend | Comma-separated allowed frontend origins |
| `REACT_APP_API_URL` | Frontend | Public backend API URL |

## Deployment

### Backend On Render

The repository includes `render.yaml` for a Render Blueprint deployment. After pushing to GitHub:

1. Create a new Blueprint from the repository.
2. Set `CORS_ORIGINS` to the deployed frontend URL.
3. Confirm the generated PostgreSQL connection is mapped to `DATABASE_URL`.
4. Deploy and verify `/health` and `/docs`.

Manual Render web service settings:

- Root directory: `backend`
- Environment: Docker
- Health check path: `/health`
- Required environment variables: `DATABASE_URL`, `CORS_ORIGINS`

### Frontend On Vercel

1. Import the GitHub repository in Vercel.
2. Set the root directory to `frontend`.
3. Set `REACT_APP_API_URL` to the deployed backend API URL.
4. Deploy.

The `frontend/vercel.json` file keeps React Router routes working on refresh.

### Frontend On Netlify

1. Import the GitHub repository in Netlify.
2. Set the base directory to `frontend`.
3. Build command: `npm run build`
4. Publish directory: `build`
5. Set `REACT_APP_API_URL` to the deployed backend API URL.

The `frontend/netlify.toml` file includes the SPA redirect rule.

### Docker Hub Backend Image

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

## Submission Links

Replace these placeholders after deploying with your own accounts:

| Deliverable | Link |
| --- | --- |
| GitHub repository | https://github.com/ankitkumar9546/Inventory-system |
| Docker Hub backend image | https://hub.docker.com/r/ankitkumar9546/inventory-backend |
| Live frontend URL | https://inventory-system-eight-delta.vercel.app |
| Live backend API URL | https://inventory-system-production.up.railway.app |

## Project Structure

```text
inventory-system/
  backend/
    app/
      main.py
      database.py
      models/
      routers/
      schemas/
    tests/
    Dockerfile
    requirements.txt
    requirements-dev.txt
  frontend/
    public/
    src/
      api/
      pages/
      App.js
      App.css
    Dockerfile
    nginx.conf
    netlify.toml
    vercel.json
  docker-compose.yml
  render.yaml
  .env.example
```
