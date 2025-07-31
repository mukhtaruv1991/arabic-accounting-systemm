# Arabic Accounting System - Replit.md

## Overview

This is a modern Arabic accounting system built as a full-stack web application. The system provides comprehensive financial management capabilities including chart of accounts management, journal entries, financial reporting, and user management. The application features an AI-powered interface for processing natural language commands in Arabic and includes Telegram bot integration for remote operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic design system
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Language Support**: Right-to-left (RTL) layout optimized for Arabic

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Session-based authentication
- **AI Integration**: Gemini AI for natural language processing
- **External Integration**: Telegram Bot API for messaging

### Build & Development
- **Build Tool**: Vite for frontend bundling
- **TypeScript**: Strict mode enabled across all modules
- **Development**: Hot reload with Vite dev server
- **Production**: esbuild for backend bundling

## Key Components

### Database Schema (PostgreSQL)
- **Users**: Authentication and profile management
- **Organizations**: Multi-tenant support for companies
- **Memberships**: User-organization relationships with roles
- **Accounts**: Chart of accounts with hierarchical structure
- **Journal Entries**: Double-entry bookkeeping transactions
- **Contacts**: Customer and supplier management
- **Invoices**: Billing and invoicing system
- **Notifications**: System notifications
- **Chat Messages**: Internal communication

### Authentication & Authorization
- Username/password authentication
- Role-based access control (owner, admin, accountant, employee, viewer)
- Multi-organization support with organization switching
- Session persistence in localStorage

### AI Services
- Arabic natural language command processing
- Transaction pattern recognition
- Automated journal entry creation
- Confidence scoring for AI recommendations

### Telegram Integration
- Bot service for remote accounting operations
- User account linking via Telegram ID
- Natural language transaction processing
- Real-time notifications and updates

## Data Flow

### Client-Server Communication
1. React frontend makes API calls to Express backend
2. TanStack Query manages caching and synchronization
3. Backend validates requests and processes business logic
4. Drizzle ORM handles database operations with Neon PostgreSQL

### AI Processing Flow
1. User inputs Arabic command (web or Telegram)
2. AI service analyzes command for accounting operations
3. System extracts transaction details and confidence score
4. If confidence is high, automated journal entries are created
5. User receives feedback in Arabic

### Multi-tenancy
1. Users can belong to multiple organizations
2. Data is isolated by organization ID
3. Role-based permissions control access levels
4. Organization switching updates context throughout app

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with migrations

### AI Services
- **Google Gemini API**: Natural language processing for Arabic commands
- **Pattern Matching**: Fallback for basic transaction recognition

### Communication
- **Telegram Bot API**: External messaging and remote operations
- **Email**: User notifications and system alerts (planned)

### UI/UX Libraries
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

## Deployment Strategy

### Development
- Local development with Vite dev server
- Hot reload for both frontend and backend
- TypeScript compilation checking
- Environment variables for API keys and database URLs

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild creates single Node.js bundle
- Database: Drizzle migrations ensure schema consistency
- Environment: Production environment variables required

### Environment Requirements
- Node.js runtime environment
- PostgreSQL database (via Neon)
- Environment variables:
  - `DATABASE_URL`: postgresql://neondb_owner:npg_nGuzMX1gPL6w@ep-sparkling-frog-a5fmiu9e.us-east-2.aws.neon.tech/neondb?sslmode=require
  - `TELEGRAM_BOT_TOKEN`: 8095604439:AAHD9GlgGgCpVVCMLp-thNsfbn8I0gqk_Do
  - `WEBHOOK_URL`: https://your-app-name.replit.app/api/telegram/webhook (set after deployment)
  - `GEMINI_API_KEY` or `GOOGLE_API_KEY`: AI service authentication (optional)

### Scaling Considerations
- Stateless backend design enables horizontal scaling
- Database connection pooling via Neon
- Multi-tenant architecture supports organizational growth
- AI service rate limiting and error handling
- Session storage can be moved to database for distributed deployment

## Deployment Status

### Ready for Production Deployment
- ✅ **Application**: Fully functional Arabic accounting system
- ✅ **Database**: Neon PostgreSQL connected and operational
- ✅ **Telegram Bot**: Integrated with token 8095604439:AAHD9GlgGgCpVVCMLp-thNsfbn8I0gqk_Do
- ✅ **Bot Username**: @Accounting_Mukhtarruv_bot
- ✅ **Authentication**: Multi-user system with roles
- ✅ **Multi-tenancy**: Organization switching implemented
- ✅ **Arabic Interface**: RTL layout and Arabic language support
- ✅ **Core Features**: Accounts, Journal entries, Reports, User management

### Deployment Instructions
1. Click "Deploy" button in Replit interface
2. Configure environment variables in deployment settings
3. Update webhook URL in Telegram bot settings after deployment
4. System will be available at: https://your-app-name.replit.app

### Post-Deployment Setup
1. Access Telegram settings in the application
2. Set webhook URL to: https://your-deployed-app.replit.app/api/telegram/webhook
3. Test bot functionality using the testing interface
4. Bot is ready to accept Arabic commands for accounting operations