# 🛠️ Development Setup Guide

Complete guide for setting up NexaGestion development environment on Windows.

## Prerequisites

- **Node.js**: v18+ (download from [nodejs.org](https://nodejs.org/))
- **PostgreSQL**: v14+ (download from [postgresql.org](https://www.postgresql.org/download/windows/))
- **Git**: Latest version (download from [git-scm.com](https://git-scm.com/))
- **VS Code**: Recommended editor (download from [code.visualstudio.com](https://code.visualstudio.com/))

## Step 1: Clone Repository

```bash
git clone https://github.com/arbarak/gest-marine.git
cd gest-marine
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Setup PostgreSQL Database

### Option A: Local PostgreSQL Installation

1. Start PostgreSQL service (Windows):
   - Open Services (services.msc)
   - Find "PostgreSQL" service
   - Ensure it's running

2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE nexagestion_dev;
   \q
   ```

### Option B: Docker PostgreSQL

```bash
docker run --name nexagestion-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

## Step 4: Configure Environment Variables

1. Copy template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexagestion_dev"
   NODE_ENV="development"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   PORT=3000
   AUTH_SECRET="your-secret-key-here-min-32-chars"
   SESSION_COOKIE_NAME="nexagestion_session"
   ```

3. Generate AUTH_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 5: Setup Database Schema

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

## Step 6: Start Development Server

```bash
npm run dev
```

Access application at: `http://localhost:3000`

## Step 7: Verify Setup

- [ ] Application loads at http://localhost:3000
- [ ] Can access login page
- [ ] Database connection works
- [ ] No console errors

## Common Issues & Solutions

### Issue: "Cannot find module 'prisma'"
**Solution:**
```bash
npm install
npx prisma generate
```

### Issue: "Database connection refused"
**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env.local
- Ensure database exists: `psql -U postgres -l`

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

### Issue: "AUTH_SECRET is too short"
**Solution:**
Generate new secret (min 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: Prisma migration conflicts
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npx biome lint

# Format code
npx biome format

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Database Management

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

## VS Code Extensions (Recommended)

- Prisma
- Tailwind CSS IntelliSense
- shadcn/ui Snippets
- ESLint (or Biome)
- Thunder Client (API testing)

## Next Steps

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand system design
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for code guidelines
3. Review [TASKS.md](TASKS.md) for development roadmap
4. Start with a task from [TASKS.md](TASKS.md)

## Getting Help

- Check [GLOSSARY.md](GLOSSARY.md) for term definitions
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check existing issues on GitHub
- Ask in team discussions

