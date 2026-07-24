# RentNest 🏠

> Find & List Rental Properties with Ease

A backend REST API for a rental property marketplace. Landlords list properties and manage bookings. Tenants browse, request rentals, and make payments. Admins moderate the entire platform.

---

## Live API

```
https://fourth-assignment.onrender.com
```

## API Documentation (Postman)

```
https://documenter.getpostman.com/view/YOUR_COLLECTION_ID
```

## Admin Credentials

```
Email:    admin@rentnest.com
Password: admin123
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| PostgreSQL + Prisma | Database + ORM |
| NeonDB | Hosted PostgreSQL |
| JWT | Authentication |
| bcrypt | Password hashing |
| Stripe | Payment processing |
| Render | Backend deployment |

---

## Features

- **Public** — Browse and filter rental properties by location, price, type, and bedrooms
- **Tenant** — Register, submit rental requests, pay via Stripe, leave reviews, manage profile
- **Landlord** — Create/edit/delete listings, approve/reject requests, mark rentals complete
- **Admin** — Manage users (ban/unban), view all listings and rental requests, manage categories

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Required |
| email | String | Unique |
| password | String | Hashed |
| role | Enum | TENANT / LANDLORD / ADMIN |
| phone | String? | Optional |
| address | String? | Optional |
| isBanned | Boolean | Default false |

### Category
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Unique |

### Property
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | String | |
| description | String | |
| location | String | |
| pricePerMonth | Float | |
| bedrooms | Int | |
| bathrooms | Int | |
| amenities | String[] | |
| images | String[] | |
| status | Enum | AVAILABLE / RENTED / UNAVAILABLE |
| categoryId | UUID | FK → Category |
| landlordId | UUID | FK → User |

### RentalRequest
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| tenantId | UUID | FK → User |
| propertyId | UUID | FK → Property |
| status | Enum | PENDING / APPROVED / REJECTED / ACTIVE / COMPLETED |
| moveInDate | DateTime | |
| message | String? | Optional |

### Payment
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| rentalRequestId | UUID | FK → RentalRequest (unique) |
| amount | Float | |
| provider | Enum | STRIPE |
| stripeSessionId | String? | |
| transactionId | String? | |
| status | Enum | PENDING / COMPLETED / FAILED |
| paidAt | DateTime? | |

### Review
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| tenantId | UUID | FK → User |
| propertyId | UUID | FK → Property |
| rating | Int | 1–5 |
| comment | String | |

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |
| PATCH | /api/auth/profile | Authenticated |

### Properties (Public)
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/properties | Public |
| GET | /api/properties/:id | Public |
| GET | /api/categories | Public |

### Landlord
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/landlord/properties | Landlord |
| POST | /api/landlord/properties | Landlord |
| PUT | /api/landlord/properties/:id | Landlord |
| DELETE | /api/landlord/properties/:id | Landlord |
| GET | /api/landlord/requests | Landlord |
| PATCH | /api/landlord/requests/:id | Landlord |
| PATCH | /api/landlord/requests/:id/complete | Landlord |

### Rentals (Tenant)
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/rentals | Tenant |
| GET | /api/rentals | Tenant |
| GET | /api/rentals/:id | Authenticated |

### Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/payments/create | Tenant |
| POST | /api/payments/webhook | Stripe (raw) |
| GET | /api/payments | Tenant |
| GET | /api/payments/:id | Tenant |

### Reviews
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/reviews | Tenant |
| GET | /api/reviews/property/:propertyId | Public |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/users | Admin |
| PATCH | /api/admin/users/:id | Admin |
| GET | /api/admin/properties | Admin |
| GET | /api/admin/rentals | Admin |

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/rentnest-backend.git
cd rentnest-backend

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# 4. Push schema to database
npx prisma db push

# 5. Seed admin and categories
npm run db:seed

# 6. Start development server
npm run dev
```

---

## Rental Flow

```
Tenant submits request (PENDING)
  → Landlord approves (APPROVED)
  → Tenant pays via Stripe (ACTIVE)
  → Landlord marks complete (COMPLETED)
  → Tenant leaves review
```

---

## Query Parameters — GET /api/properties

| Param | Example | Description |
|---|---|---|
| location | ?location=Dhaka | Filter by location |
| minPrice | ?minPrice=5000 | Minimum monthly rent |
| maxPrice | ?maxPrice=20000 | Maximum monthly rent |
| categoryId | ?categoryId=uuid | Filter by category |
| bedrooms | ?bedrooms=2 | Filter by bedroom count |
