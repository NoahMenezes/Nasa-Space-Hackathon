# NASA Space Apps Hackathon - Backend API with ML Integration

A modern Node.js backend API server built with ES modules, featuring PostgreSQL database and ML model integration for NASA data analysis.

## 🚀 Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🤖 **ML Model Integration** - Direct integration with your friend's trained AI/ML models
- 🐘 **PostgreSQL Database** - Robust relational database with advanced schema
- 📁 **File Upload Support** - Multi-format file handling with validation
- 🛡️ **Security First** - Helmet, CORS, rate limiting, input validation
- 📊 **Analytics & Tracking** - ML usage statistics and prediction history
- 🔄 **ES Modules** - Modern JavaScript module system
- ⚡ **Performance** - Connection pooling and query optimization

## 🔧 Prerequisites

- **Node.js** (v16 or higher) - Required for ES modules support
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Your Friend's ML API** running on specified endpoint

## 🚀 Quick Start

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Install with default settings
```

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
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE nasa_hackathon;
CREATE USER nasa_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nasa_hackathon TO nasa_user;

# Exit
\q
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret (use a strong secret in production)
JWT_SECRET=your_super_secret_jwt_key_2024

# ML Model API Configuration (Your friend's API)
ML_API_BASE_URL=http://localhost:8000
ML_API_KEY=your_ml_api_key_if_required

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads

# Security & Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | `{username, email, password}` |
| POST | `/auth/login` | Login user | `{email, password}` |
| POST | `/auth/logout` | Logout user | - |
| GET | `/auth/verify` | Verify JWT token | - |

**Example Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "astronaut",
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 🤖 ML Model Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ml/models` | Get available ML models | Optional |
| POST | `/ml/classify` | Classify NASA data | Yes |
| POST | `/ml/detect` | Object detection in images | Yes |
| POST | `/ml/predict` | Predictive analysis | Yes |
| POST | `/ml/anomaly-detection` | Detect anomalies in datasets | Yes |
| POST | `/ml/time-series` | Time series analysis | Yes |
| GET | `/ml/predictions` | Get user's prediction history | Yes |
| GET | `/ml/usage-stats` | Get ML usage statistics | Yes |
| GET | `/ml/health` | Check ML API health | No |

**Example Classification:**
```bash
curl -X POST http://localhost:5000/api/ml/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data_type": "exoplanet_data",
    "input_data": {
      "orbital_period": 365.25,
      "planet_radius": 1.0,
      "stellar_magnitude": 4.83
    },
    "model_version": "latest"
  }'
```

**Example Object Detection:**
```bash
curl -X POST http://localhost:5000/api/ml/detect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/space_image.jpg" \
  -F "detection_type=space_objects"
```

### 👤 User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| POST | `/users/favorites` | Add to favorites | Yes |
| GET | `/users/favorites` | Get user favorites | Yes |
| DELETE | `/users/favorites/:id` | Remove from favorites | Yes |
| GET | `/users/ml-history` | Get ML prediction history | Yes |
| GET | `/users/stats` | Get user statistics | Yes |

### 🔍 System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/info` | API information and endpoints |

## 🗄️ Database Schema

### Core Tables

**users** - User accounts and authentication
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**user_sessions** - JWT session tracking
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**favorites** - User's favorite NASA data
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  data_id VARCHAR(255) NOT NULL,
  data_content JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**ml_predictions** - ML model prediction history
```sql
CREATE TABLE ml_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  model_type VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  prediction_result JSONB NOT NULL,
  confidence_score DECIMAL(5,4),
  processing_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**model_usage_stats** - ML API usage analytics
```sql
CREATE TABLE model_usage_stats (
  id SERIAL PRIMARY KEY,
  model_endpoint VARCHAR(200) NOT NULL UNIQUE,
  request_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_response_time DECIMAL(8,2),
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 ML Model Integration

### Supported ML Operations

1. **Classification** - Categorize NASA data (exoplanets, celestial objects, etc.)
2. **Object Detection** - Identify objects in space images
3. **Predictive Analysis** - Forecast trends and patterns
4. **Anomaly Detection** - Find unusual patterns in datasets
5. **Time Series Analysis** - Analyze temporal data patterns

### ML API Requirements

Your friend's ML API should implement these endpoints:

```python
# Expected ML API structure
GET  /models              # List available models
POST /classify            # Data classification
POST /detect             # Image object detection
POST /predict            # Predictive analysis
POST /anomaly-detection  # Anomaly detection
POST /time-series        # Time series analysis
GET  /health             # Health check
```

### Example ML API Response Format

```json
{
  "success": true,
  "data": {
    "prediction": "habitable_exoplanet",
    "confidence": 0.87,
    "details": {
      "probability_scores": {
        "habitable": 0.87,
        "non_habitable": 0.13
      },
      "key_factors": ["orbital_period", "planet_radius"]
    }
  },
  "processing_time": 245,
  "model_version": "v2.1.0"
}
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `ML_API_BASE_URL` | Your friend's ML API URL | `http://localhost:8000` | **Yes** |
| `ML_API_KEY` | ML API authentication key | - | No |
| `DB_HOST` | PostgreSQL host | `localhost` | **Yes** |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_NAME` | Database name | `nasa_hackathon` | **Yes** |
| `DB_USER` | Database user | `postgres` | **Yes** |
| `DB_PASSWORD` | Database password | - | **Yes** |
| `MAX_FILE_SIZE` | Max upload size in bytes | `52428800` (50MB) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests | `100` | No |

## 🧪 Testing

### Manual API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Get API information
curl http://localhost:5000/api/info

# Check ML API connectivity
curl http://localhost:5000/api/ml/health

# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "testpass123"
  }'
```

### Run Automated Tests

```bash
npm test
```

## 📁 Project Structure

```
backend/
├── 📁 config/
│   └── database.js              # PostgreSQL configuration & pool
├── 📁 middleware/
│   └── auth.js                  # JWT authentication middleware
├── 📁 routes/
│   ├── auth.js                  # Authentication endpoints
│   ├── nasa.js                  # ML model integration endpoints
│   └── users.js                 # User management endpoints
├── 📁 scripts/
│   └── migrate.js               # Database migration runner
├── 📄 .env                      # Environment variables
├── 📄 .env.example              # Environment template
├── 📄 package.json              # Dependencies and scripts
├── 📄 README.md                 # This file
└── 📄 server.js                 # Main Express server
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Setup

1. **Set production environment variables:**
```env
NODE_ENV=production
JWT_SECRET=your_super_secure_production_secret
ML_API_BASE_URL=https://your-ml-api.com
DB_HOST=your-production-db-host
```

2. **Build and run:**
```bash
npm start
```

3. **Process Management (PM2):**
```bash
npm install -g pm2
pm2 start server.js --name nasa-backend
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Development

### Adding New ML Endpoints

1. Add endpoint to `routes/nasa.js`:
```javascript
router.post('/new-ml-endpoint', authenticateToken, async (req, res) => {
  const result = await makeMLRequest('/new-endpoint', req.body);
  res.json(result);
});
```

2. Update frontend `src/utils/api.js`:
```javascript
export const mlAPI = {
  newMLFunction: (data) => api.post('/ml/new-ml-endpoint', data),
};
```

### Database Schema Changes

1. Modify `config/database.js`
2. Run migration: `npm run migrate`
3. Update related API endpoints

### Adding Authentication to Endpoints

```javascript
import { authenticateToken } from '../middleware/auth.js';

router.get('/protected-endpoint', authenticateToken, (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ userId: req.user.userId });
});
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l
```

**ML API Connection Error:**
- Verify your friend's ML API is running
- Check `ML_API_BASE_URL` in .env
- Test ML API directly: `curl http://localhost:8000/health`

**File Upload Errors:**
- Check file size limits in `MAX_FILE_SIZE`
- Verify file types are allowed in multer configuration
- Ensure proper `Content-Type: multipart/form-data`

**JWT Token Issues:**
- Verify `JWT_SECRET` is set in .env
- Check token expiration (default 24h)
- Ensure `Authorization: Bearer TOKEN` header format

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# PostgreSQL query logging
LOG_LEVEL=debug npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow ES module standards
4. Add appropriate error handling
5. Update documentation
6. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Your Friend** - For providing the trained ML models
- **NASA** - For open data APIs and datasets
- **PostgreSQL** - For robust database foundation
- **Express.js** - For excellent web framework
- **Node.js** - For ES modules and modern JavaScript support
