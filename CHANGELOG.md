# Changelog

All notable changes to this project are documented in this file.

The format is based on **Keep a Changelog**, and this project follows **Semantic Versioning (SemVer)**.

---

## [1.0.0] - 2026-07-05

### Added

- JWT Authentication
- Email verification workflow
- Password reset workflow
- Role-Based Access Control (RBAC)
- Farmer profile management
- Buyer profile management
- Transport profile management
- Product management APIs
- Marketplace ordering workflow
- Automated transporter assignment
- PostGIS-powered location support
- Strict order state machine
- Authentication token management
- Swagger/OpenAPI documentation
- Comprehensive validation middleware
- Security middleware
- Rate limiting
- Centralized error handling
- Business event logging
- Integration test suite
- Marketplace end-to-end tests
- Authentication end-to-end tests
- Transport dispatch tests
- Security and validation test suite
- Demo mode for live presentations

### Security

- Password hashing using bcrypt
- JWT authentication
- Email verification tokens
- Password reset tokens
- Token expiration handling
- Token reuse prevention
- Duplicate email protection
- Duplicate phone number protection
- Authorization enforcement
- Ownership validation
- Input validation
- Order state transition validation
- API rate limiting

### Infrastructure

- PostgreSQL database
- Prisma ORM
- Express.js REST API
- Resend email integration
- Environment-based configuration
- Structured project architecture
- Modular service layer
- Repository prepared for production deployment
