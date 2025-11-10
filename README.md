# FitSwap

A social fitness platform that connects workout partners and enables skill exchange in the fitness community.

## Author

**Philip Chandy**  
CS 5610 - Web Development  
Northeastern University

## Class Link

[CS 5610 - Web Development Course](https://johnguerra.co/classes/webDevelopment_online_fall_2025)

## Project Objective

FitSwap is designed to solve the problem of finding compatible workout partners and learning new fitness skills. The platform allows users to:

- **Discover workout partners** based on skills, location, and fitness goals
- **Exchange fitness knowledge** through a skill-matching system
- **Track workout progress** with integrated logging and visualization
- **Schedule training sessions** with other users
- **Set and monitor fitness goals** with visual progress tracking

The app promotes a community-driven approach to fitness where users can both teach and learn from each other, creating a supportive ecosystem for fitness enthusiasts of all levels.

## Features

### Core Functionality
- **User Authentication**: Secure login/register system with profile management
- **Skill Matching**: Users can list skills they can teach and skills they want to learn
- **Partner Discovery**: Find workout partners based on complementary skills and location
- **Session Scheduling**: Book training sessions with other users
- **Workout Logging**: Track exercises, duration, and calories burned
- **Progress Visualization**: Charts showing workout history and calorie trends
- **Goal Management**: Set, track, and update fitness goals

### Technical Features
- **Responsive Design**: Mobile-friendly interface using Bootstrap
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Data Visualization**: Interactive charts using Recharts library
- **RESTful API**: Clean backend architecture with Express.js
- **MongoDB Integration**: Efficient data storage and retrieval
- **Component-based CSS**: Modular styling architecture

## Screenshot

![FitSwap Dashboard](./screenshots/dash.png)
![FitSwap Workouts](./screenshots/workouts.png)
![FitSwap Partners](./screenshots/find%20partners.png)
![FitSwap Matching](./screenshots/matches.png)
![FitSwap Sessions](./screenshots/sessions.png)

## Technology Stack

### Frontend
- **React** - Component-based UI library
- **React Router** - Client-side routing
- **Bootstrap 5** - CSS framework for responsive design
- **Recharts** - Data visualization library
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **MongoDB Native Driver** - Database connection and operations

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Git** - Version control

## Instructions to Build

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/philchandy/FitSwap.git
cd FitSwap
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create a .env file in the root directory with the following variables:
# MONGODB_URI=your_mongodb_connection_string
# PORT=3000

# Start the backend server
npm start
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

### 4. Database Setup
The application will automatically create the necessary collections when you start using it. The main collections are:
- `users` - User profiles and authentication data
- `workouts` - Individual workout logs
- `sessions` - Scheduled training sessions between users

### 5. Build for Production

#### Frontend Build
```bash
cd frontend
npm run build
```

#### Backend Build
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitswap
PORT=3000
NODE_ENV=production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile/:id` - Update user profile

### Workouts
- `GET /api/workouts/user/:userId` - Get user's workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Discovery & Matching
- `GET /api/discover/discover/:userId` - Find potential workout partners
- `GET /api/discover/matches/:userId` - Get user's matches

### Sessions
- `GET /api/sessions/user/:userId` - Get user's sessions
- `POST /api/sessions` - Schedule new session
- `PATCH /api/sessions/:id/status` - Update session status
- `DELETE /api/sessions/:id` - Cancel session

## Deployment

The application is configured for deployment on platforms like Render, Heroku, or similar:

1. **Database**: Uses MongoDB Atlas for cloud database hosting
2. **Frontend**: Static build files served by the backend in production
3. **Backend**: Express server handles API routes and serves frontend
4. **Environment**: Production environment variables configured on hosting platform

## Development Workflow

### Code Quality
```bash
# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### File Structure
```
FitSwap/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── styles/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── routes/
├── backend.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## GenAI Used
Used GenAI (Claude Sonnet 4) to create database schemas for 3 collections; users, sessions, and workouts and creating a schema that connects the 3 collections correctly.

Prompt Used:
"Imagine you are designing a schema for a Mongo database for a fitness tracking application. You need to have a collection of users- which has a general user data along with bio and goals. However, users also has to point to a collection of workouts where workout data can be stored (user id, type, duration, calories burned, etc.). Another collection, sessions, will also contain data for appointments that users set up with each other, so this must contain user_id, trainer_id, location, dateTtime, etc. Please guide me through selecting the correct fields to set up this schema correctly"

Used GenAI (Claude Sonnet 4) to create a README file for the project.

Prompt Used:
"Please create a clear and descriptive readme file including at least: * Author * Class Link * Project Objective * Screenshot * Instructions to build, and put notes as to where I should input specific assets not available to you." 

---

**Course**: CS 5610 Web Development  
**Semester**: Fall 2025
**Institution**: Northeastern University
