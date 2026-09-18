# Player Routes API

The backend API for [Player Routes](https://playerroutes.com), a football playbook builder designed for coaches to create, organize, and manage football plays.

This API handles authentication, user and player management, playbooks, formations, roster data, and subscription management.

## Tech Stack

* **Node.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL / Neon**
* **JWT authentication**
* **Zod validation**
* **Stripe**
* **Vercel**

## Features

### Authentication & Authorization

* Coach and player authentication
* JWT-based authentication
* Password hashing
* Team/player access management
* Protected API endpoints

### User & Roster Management

* Coach account management
* Team information
* Player roster management
* Player position assignments
* Profile updates

### Playbook Management

* Create and manage football plays
* Offensive formations
* Play data and player positioning
* Play types including Pass, Run, and Special
* Favorites

### Subscription Management

* Stripe subscription integration
* Coach and Team subscription plans
* Subscription status management
* Stripe Customer Portal integration
* Stripe webhook handling

### API Security

* Server-side request validation with Zod
* Input constraints and sanitization
* Authentication checks on protected endpoints
* CORS configuration
* Environment-based secrets and configuration

## Architecture

The API is organized into separate layers for routing, validation, business logic, database access, and shared utilities.

```text
api/
├── API route handlers
│
schema/
├── Zod validation schemas
│
services/
├── Business logic and database operations
│
lib/
├── Shared utilities and configuration
│
prisma/
├── Database schema and Prisma configuration
```

This separation keeps API endpoints focused on handling HTTP requests while business logic and validation remain reusable and maintainable.

## Deployment

The API is deployed on Vercel and uses Neon PostgreSQL for persistent data storage.

**Production application:**
https://playerroutes.com

## Related Repository

The Player Routes frontend is maintained separately:

**Player Routes Frontend**
https://github.com/n-scovell/Playbook

## Project

Player Routes is a personal product project built to explore the development of a production-oriented SaaS application from the frontend through the backend, database, authentication, and subscription infrastructure.
