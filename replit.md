# Florida Highway Patrol - Troop Management System

## Overview

The Florida Highway Patrol Troop Management System is a full-stack web application designed for managing law enforcement personnel, incident reports, and departmental operations. Built with a modern tech stack, it provides role-based dashboards for both troopers and supervisors, enabling efficient workflow management for profile approvals, incident report reviews, and disciplinary actions.

The application follows a client-server architecture with a React-based frontend and Express.js backend, using PostgreSQL for data persistence and JWT-based authentication for security.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library following the "New York" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Design follows Material Design principles adapted for law enforcement context with professional authority and clear visual hierarchy

**State Management**
- TanStack Query (React Query) for server state management, caching, and synchronization
- React Hook Form with Zod for form state and validation
- Local storage for JWT token and user session persistence

**Design System**
- Custom color system with HSL-based tokens for theme consistency
- Typography: Inter font family for UI, JetBrains Mono for monospace elements
- Spacing system based on Tailwind's default scale (2, 4, 6, 8 units)
- Comprehensive component library including forms, dialogs, cards, badges, and data displays

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- RESTful API design with JSON request/response format
- Middleware-based request pipeline for logging, authentication, and error handling

**Authentication & Authorization**
- JWT (JSON Web Tokens) for stateless authentication
- bcrypt.js for password hashing with salt rounds
- Role-based access control (RBAC) with "trooper" and "supervisor" roles
- Auth middleware validates tokens and attaches user context to requests
- Supervisor-specific routes protected by additional role-checking middleware

**API Structure**
- `/api/auth/*` - Authentication endpoints (register, login)
- `/api/reports/*` - Trooper incident report management
- `/api/supervisor/*` - Supervisor-only endpoints for approvals, reviews, and strike management
- Consistent error handling with HTTP status codes and JSON error messages

**Data Access Layer**
- Storage abstraction interface (`IStorage`) for database operations
- Repository pattern implementation in `DatabaseStorage` class
- Separation of concerns between routing, business logic, and data access

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Neon serverless PostgreSQL for cloud deployment
- WebSocket-based connection pooling via `@neondatabase/serverless`

**ORM & Schema Management**
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with TypeScript definitions in `shared/schema.ts`
- Zod schemas generated from Drizzle for runtime validation
- Database migrations managed via drizzle-kit

**Data Model**
- **Users Table**: Stores troopers and supervisors with fields for authentication, profile data, approval status, and role
- **Reports Table**: Incident reports with relationships to submitting user and reviewing supervisor
- **Strikes Table**: Disciplinary actions with relationships to affected trooper and issuing supervisor
- Foreign key constraints with cascade deletes for data integrity
- Indexed columns on `userId` and `status` fields for query optimization

**Shared Types**
- Common TypeScript types shared between frontend and backend via `@shared` alias
- Drizzle schema serves as single source of truth for data structures
- Insert and select schemas auto-generated with Zod for validation

### External Dependencies

**Database Service**
- Neon Serverless PostgreSQL via `DATABASE_URL` environment variable
- WebSocket connections for serverless environments
- Connection pooling handled by `@neondatabase/serverless`

**Development Tools (Replit-specific)**
- `@replit/vite-plugin-runtime-error-modal` for development error overlays
- `@replit/vite-plugin-cartographer` for code navigation (dev only)
- `@replit/vite-plugin-dev-banner` for development environment indicators

**Key NPM Packages**
- `@tanstack/react-query` v5 for server state management
- `react-hook-form` + `@hookform/resolvers` for form handling
- `zod` for schema validation
- `date-fns` for date formatting and manipulation
- `bcryptjs` for password hashing
- `jsonwebtoken` for JWT generation and verification
- `drizzle-orm` + `drizzle-kit` for database operations
- Complete Radix UI component suite for accessible UI primitives

**Build & Development**
- TypeScript with strict mode enabled
- ESM (ES Modules) throughout the codebase
- esbuild for production server bundling
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)