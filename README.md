# ScoutBook - Sports Talent Discovery Platform

A full-stack web application built with React, Node.js, Express, and PostgreSQL for connecting athletes with scouts in Nepal.

## Features

- **User Authentication**: Secure signup/login for players and scouts
- **Role-based Access**: Different interfaces for players and scouts
- **Responsive Design**: Works on desktop and mobile devices
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Reliable data storage

## Tech Stack

### Frontend
- React 19.2.0
- React Router DOM
- Axios for API calls
- CSS3 with custom styling

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE scoutbook;
```

2. Update the database configuration in `server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoutbook
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure the `.env` file:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoutbook
DB_USER=postgres
DB_PASSWORD=your_password_here
```

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/logout` - User logout (requires auth)

### Health Check
- `GET /api/health` - Server health check

## Project Structure

```
scoutbook/
├── public/                 # Static files
├── src/
│   ├── components/        # React components
│   │   ├── Landing.js
│   │   ├── Login.js
│   │   └── SignIn.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── styles/           # CSS files
│   │   ├── global.css
│   │   ├── landing.css
│   │   ├── login.css
│   │   └── signin.css
│   ├── App.js
│   └── index.js
├── server/
│   ├── config/           # Database configuration
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # Database scripts
│   └── server.js        # Main server file
└── package.json
```

## Usage

1. **Sign Up**: Create an account as either a Player or Scout
2. **Login**: Sign in with your credentials
3. **Dashboard**: Access role-specific features (to be implemented)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- SQL injection prevention with parameterized queries

## Development

### Running in Development Mode

1. Start the backend server:
```bash
cd server && npm run dev
```

2. Start the frontend (in a new terminal):
```bash
npm start
```

### Database Management

The application automatically creates the required tables on startup. You can also run the SQL script manually:

```bash
psql -U postgres -d scoutbook -f server/scripts/init-db.sql
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.