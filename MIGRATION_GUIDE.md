# Migration Guide: Express.js to NestJS

This document outlines the changes made during the migration from Express.js to NestJS.

## Key Changes

### 1. Technology Stack
- **Framework**: Express.js → NestJS
- **Language**: JavaScript → TypeScript
- **ORM**: Sequelize → Prisma
- **Authentication**: Manual JWT → Passport.js with NestJS guards

### 2. Project Structure

**Before (Express.js):**
```
src/
├── auth/
│   ├── auth.controller.js
│   └── auth.routes.js
├── middleware/
│   └── auth.middleware.js
├── utils/
│   ├── jwt.utils.js
│   └── password.utils.js
models/
└── index.js
```

**After (NestJS):**
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   ├── strategies/
│   └── dto/
├── common/
│   ├── decorators/
│   ├── filters/
│   └── utils/
prisma/
└── schema.prisma
```

### 3. Environment Variables

**Before:**
```env
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
DB_HOST=...
JWT_SECRET=...
```

**After:**
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
JWT_SECRET=...
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

### 4. Database Setup

**Before:**
- Sequelize models in `models/` directory
- Migrations managed by Sequelize CLI

**After:**
- Prisma schema in `prisma/schema.prisma`
- Migrations managed by Prisma Migrate

**Migration Steps:**
1. Update `.env` with `DATABASE_URL`
2. Run `npm run prisma:generate` to generate Prisma client
3. If you have existing data, Prisma will work with your existing database structure
4. For new deployments, run `npm run prisma:migrate` to create tables

### 5. API Endpoints

All API endpoints remain the same for backward compatibility:
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/shops/*` - Shop management
- `/items/*` - Item management
- `/inventories/*` - Inventory operations
- `/notifications/*` - Notifications

### 6. Authentication

**Before:**
- Custom middleware checking JWT tokens
- Manual token verification

**After:**
- Passport.js JWT strategy
- NestJS guards for route protection
- `@CurrentUser()` decorator for accessing authenticated user

### 7. Error Handling

**Before:**
- Manual try-catch blocks
- Manual error responses

**After:**
- Global exception filter
- Automatic error formatting
- Consistent error responses

### 8. Validation

**Before:**
- Manual validation in controllers

**After:**
- DTOs with class-validator decorators
- Automatic validation via ValidationPipe

### 9. Documentation

**Before:**
- Swagger autogen from route files

**After:**
- NestJS Swagger with decorators
- Automatic API documentation generation
- Accessible at `/doc` endpoint

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

4. **Start the server:**
   ```bash
   npm run start:dev
   ```

## Testing

All endpoints should work exactly as before. The API maintains full backward compatibility.

## Notes

- The old Express.js files are still in the repository but are no longer used
- Database migrations from Sequelize are preserved for reference
- All business logic has been preserved exactly as it was
- CORS configuration matches the original setup

