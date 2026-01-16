# Inventory Backend API

Backend application for inventory management, migrated from Express.js to NestJS with TypeScript and Prisma ORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

3. Set up Prisma:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, access Swagger documentation at:
- http://localhost:3000/doc

## Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── auth/                      # Authentication module
├── users/                     # User management
├── shops/                     # Shop management
├── items/                     # Item management
├── inventory/                 # Inventory operations
├── notifications/             # Notification management
├── prisma/                    # Prisma service
├── common/                    # Shared utilities
└── config/                    # Configuration
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user (protected)
- `PUT /auth/password` - Change password (protected)
- `POST /auth/connect-shop` - Connect user to shop (protected)

### Users
- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `POST /users` - Create user (protected)
- `PUT /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### Shops
- `GET /shops` - Get all shops (optional auth)
- `GET /shops/:id` - Get shop by ID (optional auth)
- `POST /shops` - Create shop (protected)
- `PUT /shops/:id` - Update shop (protected)
- `DELETE /shops/:id` - Delete shop (protected)

### Items
- `GET /items` - Get all items with pagination (protected)
- `GET /items/:id` - Get item by ID (protected)
- `POST /items` - Create item (protected)
- `PUT /items/:id` - Update item (protected)
- `DELETE /items/:id` - Delete item (protected)

### Inventory
- `GET /inventories/shops/:shopId` - Get inventory by shop (protected)
- `POST /inventories` - Create inventory record (protected)
- `POST /inventories/sell` - Create sell record (protected)
- `POST /inventories/refill` - Create refill record (protected)

### Notifications
- `GET /notifications` - Get all notifications (protected)
- `POST /notifications` - Create notification (protected)
- `GET /notifications/shops/:shopId` - Get shop notifications (protected)

## Migration Notes

This application has been migrated from Express.js to NestJS:
- Sequelize ORM → Prisma ORM
- JavaScript → TypeScript
- Express routes → NestJS controllers/services
- Express middleware → NestJS guards/interceptors

All API endpoints maintain backward compatibility with the original Express.js implementation.
