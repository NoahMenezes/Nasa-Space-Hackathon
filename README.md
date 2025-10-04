# NASA Space Apps Hackathon Project 🚀

A full-stack web application for the NASA Space Apps Hackathon, featuring a React frontend with Three.js visualizations, a comprehensive experiment search engine, and bookmarking functionality for NASA bioscience experiments.

## 🌟 Features

### 🔍 **Experiment Search Engine**
- **Advanced Search** - Search NASA bioscience experiments by name, scientist, or keywords
- **Real-time Results** - Instant search results with highlighted matches
- **Detailed Information** - View experiment titles, authors, and publication links
- **Smart Suggestions** - Example search terms to help users get started

### 🤖 **AI-Powered Analysis** ✨ NEW
- **Automatic Analysis** - Click any experiment to instantly trigger comprehensive AI analysis
- **9 Structured Sections** - Executive Summary, Experiment Details, Key Findings, Biological Impacts, Knowledge Graph, Applications, Research Connections, Visual Insights, and Future Research
- **Rich Formatting** - Tables, charts, code blocks, blockquotes, and hierarchical lists
- **Smart Icons** - Contextual icons automatically added to headers for quick navigation
- **Visual Data Presentation** - Timeline visualizations, network diagrams, and data cards
- **No Button Required** - Analysis starts automatically when you open an experiment

### 📚 **Bookmarks System**
- **Save Experiments** - Bookmark interesting experiments from search results
- **Persistent Storage** - Bookmarks saved locally in browser storage
- **Easy Management** - Remove individual bookmarks or clear all at once
- **Quick Access** - Navigate to experiment details or external publications
- **Visual Feedback** - Clear indicators for bookmarked vs. unbookmarked items

### 🎨 **User Interface**
- **Neon Dark Theme** - Consistent space-themed design across all pages
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations** - Engaging micro-interactions and transitions
- **Three.js Visualizations** - Immersive 3D space backgrounds
- **Accessible Navigation** - Clear navbar with active page indicators

### 🔐 **User System**
- **Authentication Pages** - Login and signup interfaces (UI ready)
- **Protected Routes** - Secure access to user-specific features
- **Profile Management** - User account management capabilities

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React version with modern hooks
- **React Router DOM** - Client-side routing and navigation
- **Three.js** - 3D graphics and space visualizations
- **React Three Fiber** - React integration for Three.js
- **CSS3** - Advanced styling with animations and responsive design

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database for experiment data
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Development Tools
- **ES Modules** - Modern JavaScript module system
- **npm Scripts** - Automated build and development workflows
- **Concurrently** - Run multiple npm scripts simultaneously

## 🚀 Quick Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** package manager

### 1. Install PostgreSQL
Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)

### 2. Create Database
```sql
CREATE DATABASE nasa_hackathon;


CREATE USER nasa_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE nasa_hackathon TO nasa_user;
```

### 3. Clone and Setup Project
```bash
# Clone the repository
git clone <repository-url>
cd Nasa-Space-Hackathon

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run migrate

# Load experiment data (if available)
npm run migrate-experiments
```

### 4. Start Development Servers
```bash
# In the root directory - starts both frontend and backend
npm run dev

# OR start them separately:
# Terminal 1 - Frontend (React)
npm start

# Terminal 2 - Backend (Express)
cd backend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📚 Available Scripts

### Main Project Scripts
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm test` - Run frontend tests
- `npm run dev` - Start both frontend and backend concurrently
- `npm run setup` - Install all dependencies (frontend + backend)

### Backend-Specific Scripts
- `npm run server` - Start backend in production mode
- `npm run dev-server` - Start backend in development mode
- `npm run migrate` - Run database migrations
- `npm run install-backend` - Install backend dependencies only

## 🔌 API Endpoints

### Experiments Search
- `POST /api/experiments/search` - Search experiments by query
- `GET /api/experiments/:id` - Get specific experiment details

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `POST /api/users/favorites` - Add experiment to favorites
- `GET /api/users/favorites` - Get user's favorite experiments

### Health Check
- `GET /api/health` - Backend health status
- `GET /api/info` - API information and available endpoints

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication and profile data
- **experiments** - NASA bioscience experiment information
- **favorites** - User bookmarked experiments
- **sessions** - User session management

## 📱 Application Pages

### 🏠 **Home Page** (`/`)
- Welcome screen with project introduction
- Navigation to main features
- Space-themed animations and background

### 🔍 **Search Engine** (`/search`)
- Experiment search interface
- Real-time search results
- Bookmark experiments directly from results
- Filter and sorting options

### 📚 **Bookmarks** (`/bookmarks`)
- View all bookmarked experiments
- Remove individual bookmarks
- Clear all bookmarks with confirmation
- Quick access to experiment details

### 🔬 **Experiment Details** (`/experiment/:id`)
- Automatic AI analysis on page load
- 9 comprehensive analysis sections
- Interactive section navigation
- Enhanced markdown rendering with tables, code blocks, and visual elements
- Smart contextual icons for all headers
- Responsive design for all devices
- Bookmark integration

### 👥 **Team** (`/team`)
- Meet the development team
- Project contributors and roles

### 🔐 **Authentication** (`/login`, `/signup`)
- User login interface
- New user registration
- Password recovery (future enhancement)

## 🎯 Key Features Explained

### Experiment Search
The search engine connects to a NASA bioscience experiments database, allowing users to:
- Search by experiment name, scientist name, or research keywords
- View detailed experiment information including authors and publication links
- Get instant visual feedback with highlighted search matches
- Access example searches to discover interesting experiments

### Bookmarking System
Built with localStorage for immediate persistence:
- Click bookmark button on any experiment in search results
- View all bookmarks in dedicated bookmarks page
- Remove individual bookmarks or clear all with confirmation dialog
- Bookmarks persist across browser sessions
- Visual indicators show bookmarked status

### AI Analysis Engine
Comprehensive experiment analysis powered by advanced AI:
- **Automatic Trigger**: Analysis starts immediately when opening an experiment
- **Structured Sections**: 9 distinct analysis categories with rich content
- **Enhanced Markdown**: Full support for tables, code blocks, lists, blockquotes, and more
- **Visual Elements**: Timeline visualizations, network diagrams, progress bars, data cards
- **Smart Icons**: Contextually relevant icons (🔬🧬🚀📊 etc.) added to all headers
- **Responsive**: Optimized for desktop, tablet, and mobile viewing
- **Professional UI**: Clean, model-agnostic branding without vendor references
- **Section Navigation**: Quick jump to any analysis section
- **Data Visualization Recommendations**: Specific chart and graph suggestions for findings

### Responsive Design
The application adapts to all screen sizes:
- Desktop: Multi-column layouts with full feature access
- Tablet: Optimized touch interfaces and adjusted spacing
- Mobile: Single-column layouts with collapsible navigation

## 🔧 Development Guidelines

### Adding New Features
1. Create feature branch from main
2. Implement frontend components in `/src/components/`
3. Add corresponding backend routes in `/backend/routes/`
4. Update database schema if needed
5. Test across all device sizes
6. Ensure consistent neon dark theme styling

### Code Organization
- **Components**: React components with corresponding CSS files
- **Utils**: Utility functions (e.g., bookmarks management)
- **Styles**: Global styles and theme variables
- **Routes**: Express.js API route handlers

## 🎨 Design System

### Color Palette
- **Primary Cyan**: `#67e8f9` - Main accent color
- **Blue**: `#3b82f6` - Secondary accent
- **Purple**: `#a855f7` - Tertiary accent
- **Background**: Dark space theme with translucent overlays
- **Text**: Various shades of cyan and white for readability

### Typography
- **Headers**: Bold, gradient text with glow effects
- **Body**: Clean, readable fonts with good contrast
- **Interactive Elements**: Consistent button and link styling

## 🚀 Deployment

### Development Environment
```bash
npm run dev  # Starts both frontend (3000) and backend (5000)
```

### Production Build
```bash
# Build frontend
npm run build

# Start production backend
cd backend
npm start
```

### Environment Variables
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=nasa_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## 🏆 NASA Space Apps Challenge

This project addresses NASA's need for accessible scientific data by:
- **Making Research Discoverable**: Easy search through NASA bioscience experiments
- **Enabling Knowledge Sharing**: Bookmark and organize experiments of interest
- **Improving User Experience**: Modern, responsive web interface with AI-powered insights
- **Supporting Scientists**: Quick access to experimental data and publications
- **AI-Powered Analysis**: Comprehensive, structured analysis of experiments with visual data presentation
- **Accelerating Research**: Instant insights and connections between experiments

### Target Users
- **Researchers**: Find relevant experiments and publications
- **Students**: Explore NASA's bioscience research
- **Educators**: Discover experiments for teaching materials
- **Public**: Learn about space-based biological research

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm run setup`
4. Create feature branch: `git checkout -b feature/your-feature`
5. Make changes and test thoroughly
6. Commit with descriptive messages
7. Push to your fork and create pull request

### Development Workflow
- Follow existing code style and patterns
- Test on multiple screen sizes
- Ensure accessibility compliance
- Update documentation for new features
- Add appropriate error handling

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists and user has permissions

**Frontend Not Loading**
```bash
Error: Cannot resolve dependency
```
- Run `npm install` in root directory
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

**Backend API Errors**
- Check backend server is running on port 5000
- Verify CORS configuration allows frontend origin
- Check API endpoints in browser network tab

**Search Not Working**
- Ensure experiment data is loaded in database
- Check backend logs for database query errors
- Verify API routes are properly configured

### Getting Help
- Check existing GitHub issues
- Create new issue with detailed description
- Include error messages and system information
- Provide steps to reproduce the problem

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **NASA** - For providing access to bioscience experiment data
- **React Team** - For the excellent frontend framework
- **Three.js Community** - For amazing 3D visualization capabilities
- **PostgreSQL** - For robust database functionality
- **AI Technology** - For enabling comprehensive experiment analysis
- **Open Source Community** - For the tools and libraries that make this possible

## 📖 Additional Documentation

- **AI_ANALYSIS_IMPROVEMENTS.md** - Detailed technical documentation of AI features
- **USER_GUIDE_AI_ANALYSIS.md** - Comprehensive user guide for AI analysis features
- **TESTING_CHECKLIST_AI_FEATURES.md** - Complete testing checklist for QA

---

Built with ❤️ for the NASA Space Apps Hackathon 🚀
