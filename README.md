# 🚜 HarvConnect API

A secure, scalable, and production-ready RESTful API powering the HarvConnect agricultural marketplace. The platform connects Farmers, Buyers, and Transporters through a robust order management system featuring JWT authentication, role-based authorization, secure email verification, automated transporter assignment, and a strict order state machine.

---

## 🌟 Features

### Authentication & Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Email Verification
- Password Reset via Email
- Account Deactivation
- Protected Routes
- Rate Limiting
- Secure Password Hashing (bcrypt)
- Token Expiration
- One-Time Email Verification Tokens
- One-Time Password Reset Tokens
- Demo Mode for Hackathons

---

### Marketplace

- Farmer Product Management
- Buyer Order Placement
- Inventory Validation
- Stock Availability Checks
- Product Categories
- Product Availability Management

---

### Transport & Logistics

- Transporter Profiles
- Availability Management
- Automatic Driver Assignment
- Distance-Based Driver Selection
- PostGIS Spatial Support
- GPS Coordinates
- Dispatch Workflow

---

### Order Management

- Strict Order State Machine
- Order Status Validation
- Business Rule Enforcement
- Illegal Transition Protection

Supported Order Flow

```
PENDING
    ↓
ACCEPTED
    ↓
READY_FOR_TRANSPORT
    ↓
PENDING_DISPATCH
    ↓
IN_TRANSIT
    ↓
DELIVERED
```

Terminal States

- DELIVERED
- CANCELLED
- REJECTED

---

### Data Integrity

- Deep Request Validation
- Boundary Validation
- Duplicate Email Protection
- Duplicate Phone Protection
- Quantity Validation
- Price Validation
- Stock Validation
- Ownership Validation

---

### API Documentation

- Swagger / OpenAPI
- Interactive API Explorer
- JWT Authorization Support

---

### Testing

Comprehensive automated testing covering:

- Authentication Flow
- Marketplace Flow
- Security Validation
- Transport Dispatch Engine
- State Machine Validation
- Authorization
- Integration Testing
- Stress Testing
- Rate Limiting

---

## 🛠 Technology Stack

| Category         | Technology        |
| ---------------- | ----------------- |
| Runtime          | Node.js           |
| Framework        | Express.js        |
| Database         | PostgreSQL        |
| ORM              | Prisma            |
| Spatial Database | PostGIS           |
| Authentication   | JWT               |
| Password Hashing | bcrypt            |
| Validation       | express-validator |
| Documentation    | Swagger / OpenAPI |
| Email            | Resend            |
| Testing          | Jest              |
| API Testing      | Supertest         |

---

# Project Structure

```
src/
├── config/
├── constants/
├── controllers/
├── middleware/
├── prisma/
├── routes/
├── services/
├── utils/
├── validators/
└── __tests__/
```

---

# Getting Started

## Prerequisites

- Node.js 18+
- PostgreSQL
- PostGIS Extension
- npm

---

## Clone Repository

```bash
git clone https://github.com/yourusername/harvconnect-backend.git

cd harvconnect-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```
DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=7d

RESEND_API_KEY=

RESEND_FROM_EMAIL=

FRONTEND_URL=http://localhost:3000

HACKATHON_DEMO_MODE=false

PORT=5000
```

For hackathon demonstrations:

```
HACKATHON_DEMO_MODE=true
```

This automatically verifies newly registered users and bypasses email delivery.

---

## Database

Generate Prisma Client

```bash
npx prisma generate
```

Run migrations

```bash
npx prisma migrate dev
```

Open Prisma Studio

```bash
npx prisma studio
```

---

## Start Development Server

```bash
npm run dev
```

---

## API Documentation

After starting the server:

```
http://localhost:5000/api-docs
```

---

## Running Tests

Run all tests

```bash
npm test
```

Run Authentication Flow

```bash
node test-auth-flow.js
```

Run Marketplace Flow

```bash
node test-marketplace-flow.js
```

Run Security Suite

```bash
npm test -- src/__tests__/security.test.js
```

Run Transport Tests

```bash
npm test -- src/__tests__/transport.test.js
```

Run Stress Test

```bash
node stress-test.js
```

---

# Security Features

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Input Validation
- Ownership Validation
- State Machine Validation
- One-Time Verification Tokens
- One-Time Password Reset Tokens
- Rate Limiting
- Protected Routes
- Duplicate User Protection

---

# Test Coverage

Current automated test coverage includes:

- User Registration
- Email Verification
- Login
- Forgot Password
- Password Reset
- Authenticated User Retrieval
- Account Deactivation
- Product Lifecycle
- Order Placement
- Inventory Validation
- Automatic Dispatch
- Nearest Driver Selection
- Authorization
- Order State Machine
- Token Reuse Prevention
- Rate Limiting
- Security Validation

---

# Demo Accounts

When `HACKATHON_DEMO_MODE=true`, email verification is automatically bypassed to enable rapid demonstrations without SMTP dependencies.

---

# API Response Format

Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "An error occurred.",
  "data": null
}
```

---

# Future Roadmap

- Mobile Money Integration
- Real-Time Driver Tracking
- Push Notifications
- SMS Authentication
- Refresh Tokens
- Payment Integration
- Admin Dashboard
- Analytics Dashboard
- Product Image Upload
- Cloud Storage
- Redis Caching
- Background Job Queues
- Docker Deployment
- CI/CD Pipeline
- Kubernetes Deployment

---

# License

MIT License

---

# Author

**Saviour Amegayie**

HarvConnect Backend API

Built for secure, scalable agricultural commerce.
