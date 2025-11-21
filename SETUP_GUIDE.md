# NexaGestion - Project Setup Guide

## ✅ Project Initialization Complete

All 10 steps of the NexaGestion project have been successfully initialized!

## 📋 What Has Been Built

### Step 1: Next.js 15 Project ✅
- TypeScript configuration
- App Router setup
- Tailwind CSS configuration
- PostCSS configuration
- Next.js configuration

### Step 2: Biome Configuration ✅
- Linting rules
- Formatting rules
- Code organization

### Step 3: shadcn/ui Components ✅
- Button component
- Card component
- Input component
- Label component
- Utility functions

### Step 4: PostgreSQL & Prisma ✅
- Prisma client setup
- Database configuration

### Step 5: Database Schema ✅
Complete Prisma schema with:
- Group & Company management
- User & Authentication
- Referentials (Clients, Suppliers, Products, Services, Categories, Brands, Tax Rates)
- Maritime module (Boats, Interventions)
- Employee management
- Sales & Purchases
- Inventory & Stock
- Payments & Treasury
- Audit logging

### Step 6: Authentication ✅
- Login/Logout functionality
- Session management
- JWT token creation and verification
- Password hashing with bcrypt
- Authentication middleware

### Step 7: Base Layout ✅
- Sidebar navigation
- Header with user info
- Dashboard layout
- Dashboard page

### Step 8: API Routes Structure ✅
- Error handling utilities
- API middleware
- Sample company API route

### Step 9: RBAC System ✅
- 5 roles: ADMIN, MANAGER, STOCK, ACCOUNTANT, VIEWER
- Permission matrix
- Permission checking utilities

### Step 10: Referential Management ✅
- Clients API (GET, POST)
- Suppliers API (GET, POST)
- Products API (GET, POST)
- Categories API (GET, POST)
- Brands API (GET, POST)
- Tax Rates API (GET, POST)

## 🚀 Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexagestion_dev"
AUTH_SECRET="generate-a-random-32-char-string"
```

### 3. Setup PostgreSQL Database
```bash
# Using Docker (recommended)
docker run --name nexagestion-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nexagestion_dev \
  -p 5432:5432 \
  -d postgres:15

# Or use local PostgreSQL installation
```

### 4. Run Prisma Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed Initial Data (Optional)
Create a seed script to add initial users and data.

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
NexaGestion/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── companies/route.ts
│   │   └── referentials/
│   │       ├── clients/route.ts
│   │       ├── suppliers/route.ts
│   │       ├── products/route.ts
│   │       ├── categories/route.ts
│   │       ├── brands/route.ts
│   │       └── tax-rates/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── sidebar.tsx
│   └── header.tsx
├── lib/
│   ├── auth.ts
│   ├── api-error.ts
│   ├── api-middleware.ts
│   ├── rbac.ts
│   ├── permissions.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── biome.json
└── .env.example
```

## 🔐 Default Test Credentials

After seeding, use:
- Email: `admin@example.com`
- Password: `password123`

## 📚 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run type-check   # Check TypeScript types
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company

### Referentials
- `GET /api/referentials/clients?groupId=...` - List clients
- `POST /api/referentials/clients` - Create client
- `GET /api/referentials/suppliers?groupId=...` - List suppliers
- `POST /api/referentials/suppliers` - Create supplier
- `GET /api/referentials/products?groupId=...` - List products
- `POST /api/referentials/products` - Create product
- `GET /api/referentials/categories?groupId=...` - List categories
- `POST /api/referentials/categories` - Create category
- `GET /api/referentials/brands?groupId=...` - List brands
- `POST /api/referentials/brands` - Create brand
- `GET /api/referentials/tax-rates?groupId=...` - List tax rates
- `POST /api/referentials/tax-rates` - Create tax rate

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Linting:** Biome
- **Testing:** Vitest

## 📝 Notes

- All API routes require authentication
- RBAC is enforced on all endpoints
- Database schema supports multi-company operations
- All referentials are group-level (shared across companies)
- Company-specific data is isolated

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify database exists

### Prisma Migration Error
- Delete `prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

### Port Already in Use
- Change PORT in .env.local
- Or kill process using port 3000

## 📞 Support

Refer to the documentation files:
- `DEVELOPMENT_SETUP.md` - Detailed setup guide
- `ARCHITECTURE.md` - System architecture
- `API_SPEC.md` - API specifications
- `DATABASE.md` - Database schema details
- `ERROR_HANDLING.md` - Error handling patterns
- `TESTING.md` - Testing guidelines
- `CONTRIBUTING.md` - Contribution guidelines

---

**Status:** ✅ All 10 steps complete  
**Ready for:** Database setup and testing

