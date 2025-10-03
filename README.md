# NASA Space Apps Hackathon Project 🚀

A full-stack web application for the NASA Space Apps Hackathon, featuring a React frontend with Three.js visualizations and a Node.js backend integrated with AI/ML models for NASA data analysis.

## 🌟 Features

### Frontend
- **React 19** with modern hooks and routing
- **Three.js & React Three Fiber** for immersive 3D space visualizations
- **Responsive design** with space-themed UI
- **User authentication** with protected routes
- **Real-time ML predictions** and data visualization

### Backend
- **Express.js** REST API server with ES modules
- **PostgreSQL** database with advanced schema design
- **AI/ML Model Integration** - Direct connection to trained NASA data models
- **JWT-based authentication** with session management
- **File upload support** for image analysis and data processing
- **Security middleware** (helmet, CORS, rate limiting, input validation)
- **Analytics & tracking** for ML usage and performance

## 🛠️ Prerequisites

- **Node.js** (v16 or higher) - Required for ES modules
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Trained ML API** running on specified endpoint

## 🚀 Quick Setup

### 1. Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/)
- Install with default settings

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE nasa_hackathon;
CREATE USER nasa_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nasa_hackathon TO nasa_user;
\q
```

### 3. Clone and Setup Project

```bash
git clone https://github.com/your-username/Nasa-Space-Hackathon.git
cd Nasa-Space-Hackathon

# Install all dependencies
npm run setup

# Configure environment
cd backend
cp .env.example .env
# Edit .env with your database credentials and ML API endpoint

# Run database migrations
npm run migrate

# Start both frontend and backend
cd ..
npm run dev
```

This will start:
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:5000`
- **ML Integration:** Connected to your trained models

## 📚 Available Scripts

### Main Project Scripts
```bash
npm run setup          # Install dependencies for both frontend and backend
npm run full-setup     # Complete setup including database migration
npm run dev           # Run both frontend and backend in development
npm start             # Run frontend only
npm run build         # Build frontend for production
npm run server        # Run backend in production
npm run dev-server    # Run backend in development
npm run migrate       # Run database migrations
```

### Backend-Specific Scripts
```bash
cd backend
npm run dev           # Start with auto-reload and debug logging
npm start             # Production mode
npm run migrate       # Database migrations
npm test              # Run tests with ES modules support
```

## 🔌 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Body Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | `{username, email, password}` |
| POST | `/api/auth/login` | Login user | `{email, password}` |
| POST | `/api/auth/logout` | Logout user | - |
| GET | `/api/auth/verify` | Verify JWT token | - |

### 🤖 ML Model Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/ml/models` | Get available ML models | Optional |
| POST | `/api/ml/classify` | Classify NASA data | Yes |
| POST | `/api/ml/detect` | Object detection in space images | Yes |
| POST | `/api/ml/predict` | Predictive analysis (orbital, weather) | Yes |
| POST | `/api/ml/anomaly-detection` | Detect anomalies in datasets | Yes |
| POST | `/api/ml/time-series` | Time series analysis and forecasting | Yes |
| GET | `/api/ml/predictions` | Get user's prediction history | Yes |
| GET | `/api/ml/usage-stats` | Get ML usage statistics | Yes |
| GET | `/api/ml/health` | Check ML API connectivity | No |

### 👤 User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| POST | `/api/users/favorites` | Add prediction/data to favorites | Yes |
| GET | `/api/users/favorites` | Get user favorites with filtering | Yes |
| DELETE | `/api/users/favorites/:id` | Remove from favorites | Yes |
| GET | `/api/users/ml-history` | Get ML prediction history | Yes |
| GET | `/api/users/stats` | Get comprehensive user statistics | Yes |

## 🗄️ Database Schema

### Enhanced Database Design

**Core Tables:**
- **users** - User accounts with authentication
- **user_sessions** - JWT session management and tracking
- **favorites** - User's favorite NASA data and ML predictions

**ML Integration Tables:**
- **ml_predictions** - Complete ML prediction history with metadata
- **model_usage_stats** - ML API usage analytics and performance metrics

**Key Features:**
- **Foreign key constraints** for data integrity
- **JSONB storage** for flexible NASA data and ML results
- **Indexes** for high-performance queries
- **Triggers** for automatic timestamp updates
- **Connection pooling** for optimal database performance

## 🔐 Environment Configuration

### Backend Configuration

Create `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_2024

# ML Model API Integration
ML_API_BASE_URL=http://localhost:8000
ML_API_KEY=your_ml_api_key_if_required

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=your_secure_password

# File Upload & Security
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration (Optional)

Create `.env` in root:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_FEATURES_ENABLED=true
```

## 🧪 Testing the System

### Backend API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Get API information
curl http://localhost:5000/api/info

# Check ML connectivity
curl http://localhost:5000/api/ml/health

# Register test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "astronaut",
    "email": "user@example.com",
    "password": "password123"
  }'

# Test ML classification
curl -X POST http://localhost:5000/api/ml/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data_type": "exoplanet_data",
    "input_data": {
      "orbital_period": 365.25,
      "planet_radius": 1.0,
      "stellar_magnitude": 4.83
    }
  }'
```

### ML Model Integration Testing

1. **Ensure your ML API is running**
2. **Test direct ML API connection:**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/models
   ```
3. **Test through backend proxy**
4. **Upload test images for object detection**

## 🏗️ Project Structure

```
Nasa-Space-Hackathon/
├── 📁 public/                    # Static assets and manifest
├── 📁 src/                       # React frontend source code
│   ├── 📁 components/            # Reusable React components
│   │   ├── Background.js         # 3D space background
│   │   ├── HomePage.js           # Landing page with ML demos
│   │   ├── LoginPage.js          # Authentication interface
│   │   ├── Navbar.js             # Navigation with ML features
│   │   └── PlaceholderPage.js    # Template for new pages
│   └── 📁 utils/                 # Frontend utilities
│       └── api.js                # Enhanced API client with ML endpoints
├── 📁 backend/                   # Node.js backend with ES modules
│   ├── 📁 config/                # Configuration files
│   │   └── database.js           # PostgreSQL connection & schema
│   ├── 📁 middleware/            # Express middleware
│   │   └── auth.js               # JWT authentication
│   ├── 📁 routes/                # API route handlers
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── nasa.js               # ML model integration endpoints
│   │   └── users.js              # User management & analytics
│   ├── 📁 scripts/               # Utility scripts
│   │   └── migrate.js            # Database migration runner
│   ├── 📄 .env                   # Environment variables
│   ├── 📄 package.json           # Backend dependencies (ES modules)
│   └── 📄 server.js              # Express server with ML integration
├── 📄 package.json               # Frontend dependencies & scripts
└── 📄 README.md                  # This comprehensive guide
```

## 🤖 ML Model Integration Details

### Supported ML Operations

1. **Data Classification**
   - Exoplanet habitability analysis
   - Celestial object categorization
   - Space phenomena classification

2. **Object Detection**
   - Space objects in images
   - Astronomical features identification
   - Satellite and debris detection

3. **Predictive Analysis**
   - Orbital trajectory forecasting
   - Space weather prediction
   - Mission timeline optimization

4. **Anomaly Detection**
   - Unusual patterns in NASA datasets
   - Equipment malfunction prediction
   - Data quality assessment

5. **Time Series Analysis**
   - Temporal pattern recognition
   - Trend forecasting
   - Periodic behavior analysis

### ML API Requirements

Your trained ML models should expose these endpoints:

```python
# Expected ML API structure
GET  /health             # Health check
GET  /models             # List available models
POST /classify           # Data classification
POST /detect             # Image object detection
POST /predict            # Predictive analysis
POST /anomaly-detection  # Anomaly detection
POST /time-series        # Time series analysis
```

## 📱 Application Features

### 🏠 **Home Page**
- Interactive 3D space visualizations
- Live ML model demonstrations
- Quick access to popular features

### 🔐 **Authentication System**
- Secure user registration and login
- JWT-based session management
- Profile customization and preferences

### 🤖 **ML Dashboard**
- Real-time model predictions
- Interactive data visualization
- Historical analysis and trends

### 📊 **Data Management**
- NASA dataset exploration
- Personal favorites and collections
- Advanced filtering and search

### 📈 **Analytics & Insights**
- Usage statistics and patterns
- Model performance metrics
- Personal achievement tracking

## 🔧 Development Guidelines

### Adding New ML Features

1. **Backend Integration:**
   ```javascript
   // In routes/nasa.js
   router.post('/new-ml-feature', authenticateToken, async (req, res) => {
     const result = await makeMLRequest('/new-endpoint', req.body);
     // Store result, handle errors, return response
   });
   ```

2. **Frontend Integration:**
   ```javascript
   // In utils/api.js
   export const mlAPI = {
     newFeature: (data) => api.post('/ml/new-ml-feature', data),
   };
   ```

3. **Database Updates:**
   - Modify schema in `config/database.js`
   - Run migrations: `npm run migrate`
   - Update related endpoints

### Code Quality Standards

- **ES Modules** throughout the backend
- **Async/await** for all database operations
- **Error handling** with meaningful messages
- **Input validation** on all endpoints
- **TypeScript-style** JSDoc comments
- **Performance monitoring** for ML operations

## 🚀 Deployment Options

### Development
```bash
npm run dev    # Both frontend and backend with hot reload
```

### Production

**Option 1: Traditional Hosting**
```bash
npm run build                    # Build frontend
npm run server                   # Run backend in production
```

**Option 2: Docker Deployment**
```dockerfile
# Multi-stage build for optimized production
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production
# ... production setup
```

**Option 3: Cloud Platforms**
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** Heroku, AWS ECS, Google Cloud Run
- **Database:** AWS RDS, Google Cloud SQL, DigitalOcean

## 🏆 NASA Space Apps Challenge Integration

### Challenge Requirements Met

✅ **NASA Data Utilization** - Real NASA datasets processed by ML models  
✅ **Innovation** - AI/ML integration for space data analysis  
✅ **User Experience** - Intuitive interface with 3D visualizations  
✅ **Technical Excellence** - Modern full-stack architecture  
✅ **Scalability** - Database design supporting growth  
✅ **Security** - Comprehensive authentication and validation  

### Demonstration Scenarios

1. **Exoplanet Discovery** - ML classification of potentially habitable worlds
2. **Space Object Detection** - Automated identification in telescope images
3. **Mission Planning** - Predictive analysis for optimal trajectories
4. **Anomaly Detection** - Early warning systems for space missions
5. **Trend Analysis** - Long-term pattern recognition in space data

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-ml-feature`
3. Follow ES module standards and async patterns
4. Add comprehensive error handling
5. Update documentation and tests
6. Submit detailed pull request

### Development Workflow
- **Backend changes:** Ensure ML integration remains functional
- **Frontend updates:** Maintain responsive design principles
- **Database modifications:** Always include migration scripts
- **New ML features:** Document API contract and examples

## 🔍 Troubleshooting

### Common Issues

**ML API Connection Errors:**
```bash
# Check ML API status
curl http://localhost:8000/health

# Verify environment variables
echo $ML_API_BASE_URL
```

**Database Connection Issues:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Test database connection
psql -U postgres -d nasa_hackathon -c "SELECT version();"
```

**File Upload Problems:**
- Verify file size limits (`MAX_FILE_SIZE`)
- Check supported file types in multer config
- Ensure proper `multipart/form-data` headers

**Authentication Failures:**
- Verify `JWT_SECRET` environment variable
- Check token expiration settings
- Validate `Authorization: Bearer TOKEN` format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** - For providing incredible open datasets and APIs
- **ML Model Developer** - For training and providing the AI models
- **React Three Fiber** - For enabling stunning 3D visualizations
- **PostgreSQL** - For robust and scalable data management
- **Express.js** - For the excellent web framework foundation
- **Space Apps Challenge** - For inspiring innovative space solutions

---

**🚀 Ready to explore the universe with AI-powered insights!**

For detailed setup instructions, see the [Backend README](backend/README.md).
For ML integration specifics, check the API documentation at `/api/info`.