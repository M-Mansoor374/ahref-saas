# MERN Stack SaaS Application - Project Structure

## Overview
This document outlines the folder structure for a SaaS application built with MERN stack (MongoDB, Express, React, Node.js) supporting three roles: Super Admin, Reseller Admin, and User.

---

## Root Folder Structure

```
ad/
├── backend/                    # Node.js/Express Backend
├── frontend/                   # React Frontend
├── shared/                     # Shared utilities/types between backend and frontend
├── docs/                       # Documentation files
├── .gitignore
├── README.md
└── docker-compose.yml          # For local development (optional)
```

---

## Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.js         # MongoDB connection configuration
│   │   ├── env.js              # Environment variables validation
│   │   ├── cors.js             # CORS configuration
│   │   └── constants.js        # Application constants
│   │
│   ├── models/                 # MongoDB Mongoose models
│   │   ├── User.js             # User model (Super Admin, Reseller Admin, User)
│   │   ├── Reseller.js         # Reseller model
│   │   ├── Subscription.js     # Subscription/user limits model
│   │   ├── IPWhitelist.js      # Static IP whitelist model
│   │   ├── Branding.js         # Branding configuration model
│   │   └── ActivityLog.js      # Activity/logging model
│   │
│   ├── routes/                 # Express route handlers
│   │   ├── auth/               # Authentication routes (structure only, no code)
│   │   ├── admin/              # Super Admin routes
│   │   ├── reseller/           # Reseller Admin routes
│   │   ├── user/               # User routes
│   │   ├── dashboard/          # Dashboard data routes (role-based)
│   │   ├── api/                # Ahrefs-like tool API routes
│   │   ├── settings/           # Settings routes (with restrictions)
│   │   ├── profile/            # Profile routes (with restrictions)
│   │   └── index.js            # Route aggregator
│   │
│   ├── controllers/            # Business logic controllers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── resellerController.js
│   │   ├── userController.js
│   │   ├── dashboardController.js
│   │   ├── apiController.js    # Ahrefs-like tool controller
│   │   ├── subscriptionController.js
│   │   ├── ipController.js     # Static IP management
│   │   └── brandingController.js
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   ├── authorization.js    # Role-based access control
│   │   ├── ipWhitelist.js      # Static IP validation middleware
│   │   ├── cookieHandler.js    # Server-side cookie management
│   │   ├── restrictions.js     # Page access restrictions (settings/profile)
│   │   ├── usageLimits.js      # User limit checking (used/remaining)
│   │   ├── subscriptionCheck.js # Subscription expiry/start date validation
│   │   ├── branding.js         # Branding middleware (inject "Service by XYZ")
│   │   └── errorHandler.js     # Error handling middleware
│   │
│   ├── services/               # Service layer (business logic)
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── subscriptionService.js
│   │   ├── ipService.js        # Static IP management logic
│   │   ├── brandingService.js
│   │   ├── usageTrackingService.js # Track used/remaining limits
│   │   └── domainService.js    # Domain handling for Ahrefs-like tool
│   │
│   ├── utils/                  # Utility functions
│   │   ├── validators.js       # Input validation utilities
│   │   ├── helpers.js          # General helper functions
│   │   ├── dateUtils.js        # Date handling (start/expiry dates)
│   │   └── logger.js           # Logging utility
│   │
│   ├── types/                  # TypeScript types (if using TS) or JSDoc types
│   │   └── index.js
│   │
│   └── server.js               # Express app entry point
│
├── tests/                      # Backend tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

---

## Frontend Structure (`/frontend`)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/                 # Static assets
│       ├── images/
│       └── fonts/
│
├── src/
│   ├── components/             # Reusable React components
│   │   ├── common/             # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Card/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Layout.jsx
│   │   └── branding/           # Branding components
│   │       └── BrandingText.jsx # "Service by XYZ" component
│   │
│   ├── pages/                  # Page components (route-level)
│   │   ├── auth/               # Authentication pages
│   │   ├── admin/              # Super Admin pages
│   │   │   ├── Dashboard/
│   │   │   ├── Users/
│   │   │   ├── Resellers/
│   │   │   ├── Settings/
│   │   │   └── IPManagement/
│   │   ├── reseller/           # Reseller Admin pages
│   │   │   ├── Dashboard/
│   │   │   ├── Users/
│   │   │   ├── Settings/
│   │   │   └── Branding/
│   │   ├── user/               # User pages
│   │   │   ├── Dashboard/
│   │   │   └── Tool/           # Ahrefs-like tool interface
│   │   └── restricted/         # Restricted pages (settings/profile)
│   │       ├── Settings/
│   │       └── Profile/
│   │
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.jsx     # Authentication context
│   │   ├── UserContext.jsx     # User data context
│   │   └── BrandingContext.jsx # Branding context
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSubscription.js
│   │   ├── useUsageLimits.js
│   │   └── useRestrictions.js
│   │
│   ├── services/               # API service layer
│   │   ├── api.js              # Axios/Fetch configuration
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── adminService.js
│   │   ├── resellerService.js
│   │   ├── dashboardService.js
│   │   └── toolService.js      # Ahrefs-like tool API calls
│   │
│   ├── utils/                  # Frontend utilities
│   │   ├── constants.js        # Frontend constants
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── cookieUtils.js      # Client-side cookie helpers
│   │
│   ├── routes/                 # Route configuration
│   │   ├── PrivateRoute.jsx    # Protected route wrapper
│   │   ├── RestrictedRoute.jsx # Restricted route (no settings/profile for users)
│   │   ├── RoleRoute.jsx       # Role-based route wrapper
│   │   └── routes.js           # Route definitions
│   │
│   ├── store/                  # State management (Redux/Zustand if needed)
│   │   ├── slices/             # Redux slices (if using Redux)
│   │   └── store.js
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css
│   │   ├── variables.css       # CSS variables
│   │   └── themes/             # Theme files
│   │
│   ├── types/                  # TypeScript types or PropTypes
│   │   └── index.js
│   │
│   ├── App.jsx                 # Root App component
│   └── index.js                # React entry point
│
├── tests/                      # Frontend tests
│   ├── components/
│   ├── pages/
│   └── utils/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Shared Structure (`/shared`)

```
shared/
├── constants/                  # Shared constants
│   ├── roles.js                # Role definitions (Super Admin, Reseller Admin, User)
│   ├── permissions.js          # Permission definitions
│   └── statusCodes.js
│
├── types/                      # Shared TypeScript/JSDoc types
│   └── index.js
│
└── validators/                 # Shared validation schemas
    └── schemas.js
```

---

## Folder Explanations

### Backend Folders

- **`src/config/`** - All configuration files (database, environment, CORS, constants)
- **`src/models/`** - MongoDB Mongoose schemas and models for all entities
- **`src/routes/`** - Express route definitions organized by feature/role
- **`src/controllers/`** - Request handlers that process business logic
- **`src/middleware/`** - Express middleware for auth, authorization, IP whitelisting, restrictions, etc.
- **`src/services/`** - Reusable business logic services (separated from controllers)
- **`src/utils/`** - Helper functions, validators, and utility modules
- **`tests/`** - Backend unit, integration, and E2E tests

### Frontend Folders

- **`public/`** - Static files served directly (HTML, images, fonts)
- **`src/components/`** - Reusable React components (common UI, layout, branding)
- **`src/pages/`** - Full page components organized by role (admin, reseller, user)
- **`src/contexts/`** - React Context providers for global state (auth, user, branding)
- **`src/hooks/`** - Custom React hooks for reusable logic
- **`src/services/`** - API service layer that communicates with backend
- **`src/routes/`** - Route configuration with protection and role-based routing
- **`src/store/`** - State management (Redux/Zustand) if needed for complex state
- **`src/styles/`** - Global CSS and theme files
- **`tests/`** - Frontend component and integration tests

### Shared Folders

- **`shared/constants/`** - Constants shared between frontend and backend (roles, permissions)
- **`shared/types/`** - Type definitions shared across the stack
- **`shared/validators/`** - Validation schemas used on both client and server

---

## Key Architecture Decisions

1. **Separation of Concerns**: Backend and frontend are completely separate, allowing independent deployment
2. **Role-Based Organization**: Routes, controllers, and pages are organized by role for clarity
3. **Middleware Layer**: Key features (IP whitelisting, restrictions, usage limits) are implemented as reusable middleware
4. **Service Layer**: Business logic is separated from controllers into services for reusability
5. **Restricted Pages**: Settings and profile pages are in a separate folder to handle access restrictions
6. **Branding Support**: Dedicated folders for branding components and services
7. **Scalability**: Structure supports future features like static IP management, usage tracking, and subscription management

