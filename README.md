# E-Commerce Project

An Express.js and SQLite powered e-commerce backend built with a modular architecture to support horizontal scaling and clean separation of concerns.

## Architecture Overview

This project implements the **Controller-Service-Repository** pattern. This ensures that our code is highly modular, easy to test, and ready to be broken out into microservices as traffic demands increase.

### 1. Controllers (`/src/controllers`)
**Role:** The entry point for HTTP requests.
Controllers are extremely lightweight. Their only job is to:
- Receive the incoming Request (`req.body`, `req.params`, etc.)
- Pass the data to the appropriate Service
- Return the HTTP Response (`200 OK`, `400 Bad Request`, etc.) with the payload returned by the Service.
- *They contain absolutely no business logic or database queries.*

### 2. Services (`/src/services`)
**Role:** The "brain" of the operation.
Services contain all of the core business logic and rules.
- They validate complex workflows (e.g., "Is this cart valid?", "Does this user exist?").
- They orchestrate interactions between multiple models or external APIs.
- *They do not know anything about HTTP (req/res) or SQL.*

### 3. Repositories (`/src/repositories`)
**Role:** The data access layer.
Repositories handle all communication with the database (SQLite).
- They execute SQL queries (`INSERT`, `SELECT`, etc.).
- They abstract the database implementation away from the Service layer. If we ever swap SQLite for PostgreSQL or MongoDB, we only need to update the Repository layer.

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Create a `.env` file in the root directory (do not commit this file!) and add your configuration:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_key_here
   ```
4. **Start the server:**
   ```bash
   node server.js
   ```

## Security & Best Practices

- **Secrets Management:** We use `dotenv` to load sensitive variables like `JWT_SECRET` from a `.env` file.
- **Version Control:** The `.env` file and SQLite database (`*.db`) are excluded via `.gitignore` to prevent leaking credentials or committing local test data.
