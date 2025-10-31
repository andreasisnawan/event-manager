# Event Manager

A comprehensive event management system built with Django REST Framework and React, featuring role-based access control, event registration, and session management.

## Project Overview

Event Manager is a full-stack web application that allows organizers to create and manage events, tracks, and sessions, while attendees can browse, explore, and register for events. The system supports multiple user roles with different permissions and capabilities.

### Features

- **User Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Admin, Organizer, Attendee)
  - Secure user registration and login

- **Event Management**

  - Create, update, and manage events
  - Event status tracking (draft, published, cancelled)
  - Venue management with city filtering
  - Capacity tracking and registration limits

- **Session & Track Management**

  - Organize events into tracks
  - Schedule sessions with speakers
  - Room and time slot management

- **Registration System**

  - Attendee event registration
  - Registration status tracking (confirmed, cancelled)
  - View and manage personal registrations
  - Cancel registrations

- **Explore & Discover**
  - Browse published events
  - Filter by city and date range
  - Search events by title and description
  - Real-time capacity availability

### Tech Stack

**Backend:**

- Django 5.x
- Django REST Framework
- PostgreSQL
- JWT Authentication

**Frontend:**

- React 19
- Ant Design (UI Components)
- Vite (Build Tool)
- React Router
- Axios
- Day.js

**DevOps:**

- Docker & Docker Compose
- PostgreSQL 16

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Git

### Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/andreasisnawan/event-manager
   cd event-manager
   ```

2. **Set up environment variables**

   Backend (.env in `backend/` directory):

   ```bash
   # Create backend/.env file
   cp backend/.env.example backend/.env
   # Edit the file with your configurations
   ```

   Frontend (.env in `frontend/` directory):

   ```bash
   # The .env file already exists with default configurations
   # Modify if needed for your environment
   ```

3. **Build and start services**

   ```bash
   docker-compose up --build
   ```

   Or run in detached mode:

   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations**

   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create a superuser**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

### Manual Setup (Without Docker)

#### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**

   - Create a PostgreSQL database
   - Update database credentials in `.env` file

5. **Run migrations**

   ```bash
   python manage.py migrate
   ```

6. **Create superuser**

   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173

## Mock Data Generation

The project includes Django management commands to generate mock data for testing and development.

### Generate Mock Users

Generate mock users with different roles (admin, organizer, attendee):

```bash
# Using Docker
docker-compose exec backend python manage.py generate_mock_users

# Without Docker
python manage.py generate_mock_users
```

**Options:**

- `--reset`: Delete all existing users before generating new ones
- `--clear`: Delete all existing users without generating new ones

**Examples:**

```bash
# Generate mock users (keeps existing users)
docker-compose exec backend python manage.py generate_mock_users

# Reset: Delete all users and generate fresh mock data
docker-compose exec backend python manage.py generate_mock_users --reset

# Clear: Delete all users without generating new ones
docker-compose exec backend python manage.py generate_mock_users --clear
```

### Generate Mock Events

Generate mock events with venues, tracks, sessions, and speakers:

```bash
# Using Docker
docker-compose exec backend python manage.py generate_mock_events

# Without Docker
python manage.py generate_mock_events
```

**Options:**

- `--reset`: Delete all existing event-related data before generating new ones
- `--clear`: Delete all existing event-related data without generating new ones

**Examples:**

```bash
# Generate mock events (keeps existing data)
docker-compose exec backend python manage.py generate_mock_events

# Reset: Delete all event data and generate fresh mock data
docker-compose exec backend python manage.py generate_mock_events --reset

# Clear: Delete all event data without generating new ones
docker-compose exec backend python manage.py generate_mock_events --clear
```

**Note:** Mock events command will generate:

- Venues in various cities
- Events with different statuses (published, draft, cancelled)
- Tracks for each event
- Sessions with speakers
- Realistic event data with proper relationships

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### Authentication Endpoints

| Endpoint         | Method | Description                        | Auth Required |
| ---------------- | ------ | ---------------------------------- | ------------- |
| `/auth/register` | POST   | Register a new user                | No            |
| `/auth/login`    | POST   | Login and receive JWT token        | No            |
| `/auth/logout`   | POST   | Logout (client-side token removal) | Yes           |

**Register Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "attendee"
}
```

**Login Request Body:**

```json
{
  "username": "username",
  "password": "password123"
}
```

### Events Endpoints

| Endpoint       | Method    | Description       | Auth Required | Roles            |
| -------------- | --------- | ----------------- | ------------- | ---------------- |
| `/events`      | GET       | List all events   | No            | All              |
| `/events`      | POST      | Create new event  | Yes           | Organizer, Admin |
| `/events/{id}` | GET       | Get event details | No            | All              |
| `/events/{id}` | PUT/PATCH | Update event      | Yes           | Organizer, Admin |
| `/events/{id}` | DELETE    | Delete event      | Yes           | Organizer, Admin |

**Query Parameters for List:**

- `status`: Filter by status (published, draft, cancelled)
- `city`: Filter by venue city
- `search`: Search by title or description

### Venues Endpoints

| Endpoint               | Method    | Description        | Auth Required | Roles            |
| ---------------------- | --------- | ------------------ | ------------- | ---------------- |
| `/venues`              | GET       | List all venues    | No            | All              |
| `/venues`              | POST      | Create new venue   | Yes           | Organizer, Admin |
| `/venues/{id}`         | GET       | Get venue details  | No            | All              |
| `/venues/{id}`         | PUT/PATCH | Update venue       | Yes           | Organizer, Admin |
| `/venues/{id}`         | DELETE    | Delete venue       | Yes           | Organizer, Admin |
| `/venues/city-choices` | GET       | Get list of cities | No            | All              |

### Tracks Endpoints

| Endpoint                         | Method    | Description       | Auth Required | Roles            |
| -------------------------------- | --------- | ----------------- | ------------- | ---------------- |
| `/events/{event_id}/tracks`      | GET       | List event tracks | No            | All              |
| `/events/{event_id}/tracks`      | POST      | Create track      | Yes           | Organizer, Admin |
| `/events/{event_id}/tracks/{id}` | GET       | Get track details | No            | All              |
| `/events/{event_id}/tracks/{id}` | PUT/PATCH | Update track      | Yes           | Organizer, Admin |
| `/events/{event_id}/tracks/{id}` | DELETE    | Delete track      | Yes           | Organizer, Admin |

### Sessions Endpoints

| Endpoint                           | Method    | Description         | Auth Required | Roles            |
| ---------------------------------- | --------- | ------------------- | ------------- | ---------------- |
| `/events/{event_id}/sessions`      | GET       | List event sessions | No            | All              |
| `/events/{event_id}/sessions`      | POST      | Create session      | Yes           | Organizer, Admin |
| `/events/{event_id}/sessions/{id}` | GET       | Get session details | No            | All              |
| `/events/{event_id}/sessions/{id}` | PUT/PATCH | Update session      | Yes           | Organizer, Admin |
| `/events/{event_id}/sessions/{id}` | DELETE    | Delete session      | Yes           | Organizer, Admin |

### Registrations Endpoints

| Endpoint                                | Method | Description                 | Auth Required | Roles            |
| --------------------------------------- | ------ | --------------------------- | ------------- | ---------------- |
| `/events/{event_id}/registrations`      | GET    | List event registrations    | Yes           | Organizer, Admin |
| `/events/{event_id}/registrations`      | POST   | Register for event          | Yes           | Attendee         |
| `/events/{event_id}/registrations/{id}` | GET    | Get registration details    | Yes           | All              |
| `/my-registrations`                     | GET    | List my registrations       | Yes           | Attendee         |
| `/my-registrations/{id}`                | GET    | Get my registration details | Yes           | Attendee         |
| `/my-registrations/{id}`                | DELETE | Cancel registration         | Yes           | Attendee         |

### Speakers Endpoints

| Endpoint         | Method    | Description         | Auth Required | Roles            |
| ---------------- | --------- | ------------------- | ------------- | ---------------- |
| `/speakers`      | GET       | List all speakers   | No            | All              |
| `/speakers`      | POST      | Create speaker      | Yes           | Organizer, Admin |
| `/speakers/{id}` | GET       | Get speaker details | No            | All              |
| `/speakers/{id}` | PUT/PATCH | Update speaker      | Yes           | Organizer, Admin |
| `/speakers/{id}` | DELETE    | Delete speaker      | Yes           | Organizer, Admin |

## Testing Instructions

### Backend Tests

Run all backend tests:

```bash
# Using Docker
docker-compose exec backend python manage.py test

# Without Docker
python manage.py test
```

Run specific app tests:

```bash
# Test authentication
docker-compose exec backend python manage.py test authentication

# Test events
docker-compose exec backend python manage.py test events
```

Run with verbose output:

```bash
docker-compose exec backend python manage.py test --verbosity=2
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing

1. **Access Django Admin**

   - URL: http://localhost:8000/admin
   - Login with superuser credentials
   - Verify CRUD operations for all models

2. **Test API Endpoints**

   - Use tools like Postman or curl
   - Test authentication flow
   - Test CRUD operations for each resource
   - Verify role-based permissions

3. **Test Frontend Application**
   - Register new users with different roles
   - Login and verify authentication
   - Test event browsing and filtering
   - Test event registration and cancellation
   - Verify role-based UI elements

## Project Structure

```
event-manager/
├── backend/
│   ├── authentication/          # User authentication and authorization
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── generate_mock_users.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── events/                  # Event management
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── generate_mock_events.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   ├── core/                    # Django settings and configuration
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React context providers
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── explore/
│   │   │   ├── registrations/
│   │   │   ├── sessions/
│   │   │   └── tracks/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Layout components
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## User Roles & Permissions

### Admin

- Full access to all features
- Can manage users, events, and all related resources
- Access to Django admin panel

### Organizer

- Create, update, and delete events
- Manage venues, tracks, sessions, and speakers
- View registrations for their events

### Attendee

- Browse and explore published events
- Register for events
- View and manage own registrations
- Cancel registrations

## Development

### Running Migrations

```bash
# Using Docker
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Without Docker
python manage.py makemigrations
python manage.py migrate
```

## Troubleshooting

### Frontend Build Issues

If you encounter platform-specific binary errors (esbuild):

```bash
# Remove local node_modules
rm -rf frontend/node_modules

# Rebuild Docker image
docker-compose build --no-cache frontend

# Start services
docker-compose up
```

### Database Connection Issues

1. Ensure PostgreSQL service is running:

   ```bash
   docker-compose ps
   ```

2. Check database credentials in `backend/.env`

3. Restart database service:
   ```bash
   docker-compose restart db
   ```

### Port Already in Use

If ports 5173 or 8000 are already in use:

```bash
# Find process using the port
lsof -i :5173
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
