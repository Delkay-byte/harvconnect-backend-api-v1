# 🚜 HarvConnect API

A secure, scalable, and production-ready RESTful API powering the HarvConnect agricultural marketplace. The platform connects Farmers, Buyers, and Transporters through a robust order management system featuring JWT authentication, role-based authorization, secure email verification, automated transporter assignment, and a strict order state machine.

## 🎯 MVP Focus Regions

- **Greater Accra**: Accra Central, Tema, Madina, Achimota
- **Ashanti**: Kumasi Central, Adum, Kejetia Market

These regions represent the highest demand areas for vegetable buyers and have the most comprehensive market data.

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
- Realistic Ghanaian vegetable pricing (Tomatoes, Peppers, Garden Eggs, Okra, etc.)

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
- Mock Mobile Money Payments
- Review System
- Seed Data Integrity

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
git clone https://github.com/Delkay-byte/harvconnect-backend-api-v1.git

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

## Seed Demo Data

Populate the database with realistic Ghanaian data for Greater Accra and Ashanti regions:

```bash
npm run seed
```

This will create:

- **5 Farmers** (3 in Greater Accra, 2 in Ashanti)
- **3 Buyers** (Greater Accra)
- **2 Transporters** (1 in each region)
- **15 Products** (Tomatoes, Peppers, Okra, Garden Eggs, Cabbage, Lettuce, Cucumber, Onions)
- **Sample Reviews** (4-5 star ratings)
- **Sample Orders** (delivered status)

**Demo Password**: `Hackathon2026!`

All seeded accounts are verified and ready to use immediately.

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

Run Demo Features Tests (Payment & Reviews)

```bash
npm test -- src/__tests__/demo.test.js
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
- Mock Mobile Money Payment (2-3s artificial delay)
- Review Creation & Authorization
- Duplicate Review Prevention
- Average Rating Calculation
- Seed Data Integrity

---

# Demo Accounts

## Seeded Demo Accounts

After running `npm run seed`, the following accounts are available with password `Hackathon2026!`:

### Farmers (Greater Accra)

- kwame.mensah@harvconnect.com (Accra Central)
- ama.serwaa@harvconnect.com (Tema)
- kofi.asante@harvconnect.com (Madina)

### Farmers (Ashanti)

- yaa.afriyie@harvconnect.com (Kumasi Central)
- emmanuel.osei@harvconnect.com (Adum, Kumasi)

### Buyers (Greater Accra)

- abena.ofori@harvconnect.com (Accra Central)
- samuel.addo@harvconnect.com (Tema)
- grace.agyeman@harvconnect.com (Madina)

### Transporters

- isaac.boateng@harvconnect.com (Greater Accra)
- dorcas.mensah@harvconnect.com (Ashanti)

All accounts are pre-verified with complete profiles and sample data.

## Demo Mode

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

## Mock Mobile Money Payment

The API includes a production-ready mock Mobile Money (MoMo) payment module for demonstration purposes.

### Endpoint

```
POST /api/v1/payments/momo
```

### Request Body

```json
{
  "phoneNumber": "+233240000000",
  "amount": 150.0,
  "network": "MTN",
  "reference": "ORD-1234"
}
```

### Response

```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "transactionId": "MOMO-1234567890-ABC123",
    "network": "MTN",
    "amount": 150.0,
    "currency": "GHS",
    "status": "COMPLETED",
    "timestamp": "2026-07-05T10:30:00.000Z",
    "reference": "ORD-1234",
    "phoneNumber": "+233240000000"
  }
}
```

**Features**:

- Artificial delay of 2-3 seconds to simulate real payment processing
- Supports MTN, Vodafone, and AirtelTigo networks
- Input validation for phone numbers and amounts
- Authenticated endpoint (requires JWT token)
- Unique transaction IDs for each payment

## Review System

Buyers can rate and review farmers after transactions.

### Create/Update Review

```
POST /api/v1/reviews
```

**Requires**: BUYER role

```json
{
  "farmerId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 5,
  "comment": "Excellent quality produce, very fresh!"
}
```

### Get Farmer Reviews

```
GET /api/v1/reviews/farmer/{farmerId}?page=1&limit=10
```

**Public endpoint** - returns paginated reviews with buyer information.

### Get Farmer Average Rating

```
GET /api/v1/reviews/farmer/{farmerId}/rating
```

**Public endpoint** - returns average rating and total review count.

### Get My Reviews

```
GET /api/v1/reviews/my-reviews
```

**Requires**: BUYER role - returns all reviews submitted by the authenticated buyer.

**Features**:

- Rating validation (1-5 stars)
- One review per buyer-farmer pair (subsequent submissions update existing review)
- Pagination support for farmer reviews
- Average rating calculation
- Role-based access control

---

# Future Roadmap

- Real Mobile Money Gateway Integration (replace mock)
- Real-Time Driver Tracking
- Push Notifications
- SMS Authentication
- Refresh Tokens
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
