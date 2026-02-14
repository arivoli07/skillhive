# Skillhive

Skillhive is a simplified freelancer–client marketplace built with React, Spring Boot, JWT authentication, and MySQL.

## Frontend-Only Demo Mode (Portfolio)

The frontend now runs with a built-in mock API and localStorage data, so visitors can use all pages without deploying backend or database.

- No backend is required for demo deployment.
- Data is stored in browser localStorage.
- Routes like client/freelancer dashboards are publicly accessible for demo viewing.
- Optional demo login:
  - Client: `client@demo.com` / `demo123`
  - Freelancer: `freelancer@demo.com` / `demo123`

## Structure

- `backend`: Spring Boot REST API
- `frontend`: React + Tailwind UI

## Backend Setup (Spring Boot + MySQL)

1. Create a MySQL database named `freelaconnect`.
2. Update database credentials and JWT secret in `backend/src/main/resources/application.yml`.
3. From `backend`, run:

```bash
mvn spring-boot:run
```

API runs on `http://localhost:8080`.

## Frontend Setup (React + Tailwind)

1. From `frontend`, install dependencies:

```bash
npm install
```

2. Optional: update API base URL using `.env`:

```bash
cp .env.example .env
```

3. Run the dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Core Features

- Client and Freelancer roles
- JWT authentication
- Client dashboard: browse, filter, hire, review
- Freelancer dashboard: profile, services, projects, reviews
- Ratings and review system
- Category browsing + search

## API Overview

### Auth
- `POST /api/auth/register/client`
- `POST /api/auth/register/freelancer`
- `POST /api/auth/login`

### Client
- `GET /api/clients/freelancers`
- `POST /api/clients/hire`
- `POST /api/clients/reviews`
- `GET /api/clients/me/projects`

### Freelancer
- `GET /api/freelancers`
- `GET /api/freelancers/{id}`
- `GET /api/freelancers/me`
- `PUT /api/freelancers/me`
- `POST /api/freelancers/me/services`
- `GET /api/freelancers/me/services`
- `GET /api/freelancers/me/projects`
- `PATCH /api/freelancers/me/projects/{projectId}`
- `GET /api/freelancers/me/reviews`

### Categories
- `GET /api/categories`

## Notes

- Update `app.jwt.secret` before production use.
- The API is stateless with JWT; keep the token in localStorage on the client.
- Categories are auto-seeded on first boot.
