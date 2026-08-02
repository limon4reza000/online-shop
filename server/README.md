# নিত্যঘর API

Express + TypeScript + Prisma (MySQL) backend for the নিত্যঘর storefront and admin panel.

## Setup

```bash
cd server
npm install
cp .env.example .env    # then fill in DATABASE_URL at minimum
npx prisma generate
npx prisma migrate dev --name init
npm run seed             # creates an admin user + sample catalog
npm run dev               # starts on http://localhost:4000
```

Default seeded admin login: `admin@nityaghor.com` / `Admin123!`

## What's fully implemented

- JWT auth (access + refresh cookie), bcrypt password hashing, role-based route guards (`CUSTOMER` / `ADMIN` / `MANAGER` / `SUPPORT`)
- Email/OTP verification and password reset flows (emails logged to console until SMTP is configured)
- Products, categories, brands, orders, coupons, reviews, addresses, wishlist, banners, notifications — full CRUD with pagination/filtering
- Order placement decrements stock in a DB transaction; status updates push a real-time Socket.io event + persisted notification to the customer
- Multer file uploads to `/uploads`, mirrored to Cloudinary automatically once credentials are set
- Centralized error handling, Zod request validation, Helmet + rate limiting on auth routes

## What's stubbed pending real credentials

These are wired end-to-end but intentionally inert without secrets in `.env` — see `.env.example`:

- **Google / Facebook OAuth** — routes respond `501 Not Configured` until `GOOGLE_CLIENT_ID`/`FACEBOOK_APP_ID` etc. are set (`src/config/passport.ts`)
- **Cloudinary** — falls back to serving the local `/uploads` file until `CLOUDINARY_*` vars are set (`src/config/cloudinary.ts`)
- **SMTP email** — OTP/reset emails are logged to the server console instead of sent until `SMTP_*` vars are set (`src/config/mailer.ts`)
- **SSLCommerz payments** — `POST /api/payments/initiate` returns a 400 explaining it's unconfigured until `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWORD` are set; once set it opens a real sandbox (or live) hosted-checkout session (`src/modules/payments`)

## Connecting the frontend

The React app's `src/lib/api.ts` axios instance already points at `VITE_API_URL` (defaults to `http://localhost:4000/api`). Swap `src/lib/mockApi.ts` calls for real `api.get(...)` calls in `src/hooks/*` once this server is running against a real database — the request/response shapes match.
