Cliniclyf/
│── node_modules/
│── src/
│   ├── config/            # Configuration files
│   │   ├── db.js          # Sequelize DB connection setup
│   │   ├── auth.js        # JWT Authentication settings
│   │   ├── roles.js       # Roles mapping for RBAC
│   ├── lib/               # Helper functions and utilities
│   │   ├── responseLib.js # Custom response handling
│   ├── middleware/        # Middlewares for authentication, validation, etc.
│   │   ├── authMiddleware.js  # JWT verification & user role checking
│   ├── models/            # Sequelize models
│   │   ├── user.js        # User model
│   │   ├── role.js        # Role model (for RBAC)
│   ├── services/          # Microservices like user-service, product-service, etc.
│   │   ├── user-service/  # Handles user operations (authentication, profile)
│   │   │   ├── controllers/
│   │   │   │   ├── authController.js    # Handles user registration, login
│   │   │   ├── routes/
│   │   │   │   ├── authRoutes.js  # Auth-related routes
│   ├── server.js           # Main entry point for Express server
│── .env                    # Environment variables
│── package.json
│── README.md

#Core Folders & Files
config/: Stores all configuration files (e.g., DB connection, JWT settings).
lib/: Helper functions (like custom response handlers).
middleware/: Middleware for validation, JWT authentication, etc.
models/: Sequelize models for interacting with PostgreSQL.
services/: Microservices (e.g., user-service, product-service).
server.js: Initializes the Express server and connects middleware

# packages
npm install express pg sequelize dotenv cors helmet morgan jsonwebtoken bcryptjs joi express-validator


Package	Purpose
express	Web framework for building APIs
pg	PostgreSQL client
sequelize	ORM for PostgreSQL
dotenv	Load environment variables from .env
cors	Enables Cross-Origin Resource Sharing
helmet	Adds security headers to API responses
morgan	Logs HTTP requests
jsonwebtoken	JWT authentication for securing API routes
bcryptjs	Hashes passwords for security
joi	Validates request payloads
express-validator	Additional validation for API requests
