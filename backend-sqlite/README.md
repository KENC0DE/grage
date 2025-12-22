# Garage Service Backend API (SQLite)

A lightweight, scalable backend system for connecting customers with nearby garages for on-site car repair services. This version uses SQLite for quick testing and development.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Category Management**: Create and manage service categories and subcategories
- **Service Requests**: Customers can request services with location, time, and detailed information
- **Location-based Services**: Find nearby garages using geospatial queries
- **Status Tracking**: Real-time tracking of service request status
- **Review System**: Customers can rate and review completed services
- **SQLite Database**: Zero-configuration database for quick testing
- **Scalable Architecture**: Easy to switch to PostgreSQL or MySQL when ready

## 📋 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment (optional):
```bash
cp .env.example .env
# Edit .env if needed
```

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The server will start on `http://localhost:5000`

### Database

SQLite database file (`database.sqlite`) will be created automatically on first run.

To reset the database:
```bash
# Set DB_RESET=true in .env, then restart server
# OR manually delete database.sqlite file
```

## 🔐 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (SQLite)
DB_PATH=./database.sqlite
DB_RESET=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (customer or garage owner)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updateprofile` - Update profile (Protected)
- `PUT /api/auth/updatepassword` - Change password (Protected)
- `POST /api/auth/logout` - Logout (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Subcategories
- `GET /api/subcategories` - Get all subcategories
- `GET /api/categories/:categoryId/subcategories` - Get subcategories by category
- `GET /api/subcategories/:id` - Get single subcategory
- `POST /api/subcategories` - Create subcategory (Admin only)
- `PUT /api/subcategories/:id` - Update subcategory (Admin only)
- `DELETE /api/subcategories/:id` - Delete subcategory (Admin only)

### Service Requests
- `GET /api/service-requests` - Get all requests (filtered by role)
- `GET /api/service-requests/:id` - Get single request
- `POST /api/service-requests` - Create request (Customer only)
- `PUT /api/service-requests/:id/status` - Update status
- `PUT /api/service-requests/:id/assign` - Assign to garage (Admin only)
- `GET /api/service-requests/:id/nearby-garages` - Find nearby garages
- `POST /api/service-requests/:id/review` - Add review (Customer only)
- `DELETE /api/service-requests/:id` - Cancel request (Customer only)

## 📖 Usage Examples

### 1. Register Garage Owner

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Johnson",
    "email": "mike@garage.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "admin",
    "garageName": "Mike'\''s Auto Repair",
    "garageAddress": "123 Main St, NYC",
    "garageLocation": {
      "coordinates": [-73.935242, 40.730610]
    },
    "serviceRadius": 15
  }'
```

### 2. Register Customer

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Create Category (Admin)

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Engine Repair",
    "description": "All engine-related services"
  }'
```

### 5. Create Service Request (Customer)

```bash
curl -X POST http://localhost:5000/api/service-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "categoryId": 1,
    "subcategoryId": 1,
    "address": {
      "street": "456 Oak St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002",
      "fullAddress": "456 Oak St, NYC, NY 10002"
    },
    "location": {
      "coordinates": [-73.945242, 40.735610]
    },
    "preferredDate": "2024-02-01",
    "preferredTime": "10:00 AM",
    "description": "Car won'\''t start, need help",
    "priority": "high"
  }'
```

## 🗂️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User full name
- `email` - Unique email
- `password` - Hashed password
- `phone` - Contact number
- `role` - customer | admin | super_admin
- `garageName` - Garage name (for admins)
- `garageAddress` - Garage address
- `garageLatitude` - Location latitude
- `garageLongitude` - Location longitude
- `businessLicense` - Business license number
- `serviceRadius` - Service area radius (km)
- `isActive` - Account status
- `isVerified` - Verification status

### Categories Table
- `id` - Primary key
- `name` - Category name (unique)
- `slug` - URL-friendly slug
- `description` - Category description
- `icon` - Icon URL
- `image` - Image URL
- `isActive` - Active status
- `sortOrder` - Display order
- `createdBy` - User ID who created it

### Subcategories Table
- `id` - Primary key
- `name` - Subcategory name
- `slug` - URL-friendly slug
- `description` - Description
- `categoryId` - Parent category
- `estimatedDuration` - Duration in minutes
- `priceMin` - Minimum price
- `priceMax` - Maximum price
- `isActive` - Active status
- `sortOrder` - Display order
- `createdBy` - User ID who created it

### Service Requests Table
- `id` - Primary key
- `requestNumber` - Unique request number (auto-generated)
- `customerId` - Customer user ID
- `customerName` - Customer name
- `customerPhone` - Customer phone
- `customerEmail` - Customer email
- `categoryId` - Service category
- `subcategoryId` - Service subcategory
- `addressStreet` - Street address
- `addressCity` - City
- `addressState` - State
- `addressZipCode` - ZIP code
- `addressFull` - Full address
- `locationLatitude` - Latitude
- `locationLongitude` - Longitude
- `addressPin` - Additional location notes
- `preferredDate` - Preferred service date
- `preferredTime` - Preferred service time
- `description` - Issue description
- `images` - JSON array of image URLs
- `status` - Request status
- `assignedToId` - Assigned garage ID
- `priority` - low | medium | high | urgent
- `estimatedCost` - Estimated cost
- `actualCost` - Actual cost
- `paymentStatus` - Payment status
- `notes` - JSON array of notes
- `statusHistory` - JSON array of status changes
- `completedAt` - Completion timestamp
- `cancelledAt` - Cancellation timestamp
- `cancellationReason` - Reason for cancellation
- `rating` - Rating (1-5)
- `review` - Review text
- `reviewedAt` - Review timestamp

## 📁 Project Structure

```
backend-sqlite/
├── src/
│   ├── config/
│   │   └── database.js          # Sequelize SQLite configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── apiController.js     # All API controllers
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── index.js             # Model associations
│   │   ├── User.js              # User model
│   │   ├── Category.js          # Category model
│   │   ├── Subcategory.js       # Subcategory model
│   │   └── ServiceRequest.js    # Service request model
│   ├── routes/
│   │   └── index.js             # All API routes
│   └── utils/
│       └── generateToken.js     # JWT token utilities
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── .gitignore
├── database.sqlite              # SQLite database file (auto-created)
├── package.json
├── README.md
└── server.js                    # Express server entry point
```

## 🔄 Switching to PostgreSQL/MySQL

When ready to scale, switching databases is simple:

1. Install database driver:
```bash
npm install pg pg-hstore  # For PostgreSQL
# OR
npm install mysql2        # For MySQL
```

2. Update `src/config/database.js`:
```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', // or 'mysql'
    logging: false
  }
);
```

3. Update `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garage_service
DB_USER=postgres
DB_PASSWORD=password
```

No code changes needed! Sequelize handles the rest.

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:5000

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"customer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Customer, Admin, Super Admin roles
- **Input Validation**: Sequelize validation and error handling
- **CORS Protection**: Configurable CORS policy
- **SQL Injection Prevention**: Sequelize ORM protection

## 🚀 Performance Tips

1. **Enable SQLite WAL mode** for better concurrency
2. **Add indexes** for frequently queried fields
3. **Use connection pooling** (already configured)
4. **Implement caching** with Redis for production
5. **Switch to PostgreSQL** for high-traffic applications

## 📝 Notes

- SQLite is perfect for development and testing
- For production with multiple concurrent users, consider PostgreSQL or MySQL
- Database file is in the root directory: `database.sqlite`
- To reset database, delete `database.sqlite` and restart server
- All models automatically sync on server start

## 🐛 Troubleshooting

### Database locked error
- SQLite doesn't handle high concurrency well
- Switch to PostgreSQL for production

### Foreign key constraint failed
- Ensure related records exist before creating associations
- Check that category exists before creating subcategory

### Token expired
- Login again to get a new token
- Increase `JWT_EXPIRE` in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ for connecting customers with reliable garage services**