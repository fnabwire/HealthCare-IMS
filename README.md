# HealthTrack Information System

HealthTrack is a comprehensive health information system designed for healthcare professionals to manage clients, health programs, and track client enrollments in these programs.

## Features

- **User Authentication**: Secure login and registration system
- **Client Management**: Register and track clients with detailed information
- **Program Administration**: Create and manage health programs 
- **Enrollment Tracking**: Enroll clients in programs and track their participation
- **Client Profiles**: View comprehensive client information including program enrollments
- **Dashboard**: Overview of system statistics and recent activities
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Form Handling**: React Hook Form with Zod validation
- **API Communication**: TanStack Query

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/healthtrack.git
   cd healthtrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the root directory:
   ```
   # Database configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/healthtrack
   
   # Session secret (generate a random string)
   SESSION_SECRET=your_session_secret_here
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

### Default Admin User

After setup, the system will automatically create an admin user:
- Username: `admin`
- Password: `password`

You should change this password after first login for security reasons.

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and API client
  - `/src/pages`: Page components for different routes

- `/server`: Backend Express application
  - `/auth.ts`: Authentication setup with Passport.js
  - `/db.ts`: Database connection
  - `/routes.ts`: API route definitions
  - `/storage.ts`: Data access layer

- `/shared`: Code shared between frontend and backend
  - `/schema.ts`: Database schema definitions with Drizzle

## API Endpoints

The API follows RESTful conventions and includes endpoints for:

- **Auth**: `/api/login`, `/api/register`, `/api/logout`, `/api/user`
- **Programs**: `/api/programs`, `/api/programs/:id`, `/api/programs/stats`
- **Clients**: `/api/clients`, `/api/clients/:id`, `/api/clients/:id/details`
- **Enrollments**: `/api/enrollments`, `/api/clients/:clientId/enrollments`
- **Visits**: `/api/visits`, `/api/clients/:clientId/visits`
- **Notes**: `/api/notes`, `/api/clients/:clientId/notes`
- **Stats**: `/api/stats`

## Development

### Database Migrations

The project uses Drizzle ORM's push system for database schema changes:

```bash
npm run db:push
```

### Adding New Features

1. Define the data model in `shared/schema.ts`
2. Update the storage interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create UI components in `client/src/components`
5. Add pages in `client/src/pages` and register them in `App.tsx`

## License

[MIT License](LICENSE)

## Contact

For more information, please contact your project administrator.