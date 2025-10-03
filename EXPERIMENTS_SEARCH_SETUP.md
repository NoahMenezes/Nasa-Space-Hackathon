# NASA Bioscience Experiments Search Engine Setup Guide

## Overview

This feature allows users to search NASA bioscience experiments by experiment name or scientist name, and then analyze them using Google's Gemini 2.0 Flash AI model.

## Features

- 🔍 **Full-text search** for experiments and scientists
- 🤖 **AI-powered analysis** using Gemini 2.0
- 📊 **Comprehensive experiment details** with structured sections
- 🎨 **Beautiful, responsive UI** with space-themed design
- 📱 **Mobile-friendly** interface

---

## Database Setup

### Step 1: Add Gemini API Key to Environment

Edit `backend/.env` and add:

```env
# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws
```

### Step 2: Install Dependencies

Navigate to the backend directory and install the new dependency:

```bash
cd backend
npm install csv-parse
```

### Step 3: Initialize Database Tables

The experiments tables will be created automatically when you start the server. The database initialization includes:

- `experiments` table - Stores all experiment data (title, authors, link)
- `experiment_analyses` table - Caches Gemini AI analysis results
- Full-text search indexes for fast querying

Start the server to create tables:

```bash
npm run dev
```

### Step 4: Load CSV Data into Database

Run the migration script to load all experiments from the CSV file:

```bash
node scripts/migrate-experiments.js
```

This will:
1. Create the experiments table if it doesn't exist
2. Create full-text search indexes
3. Load all experiments from `backend/data/expts_authors_links.csv`
4. Display progress as it inserts records

**Expected Output:**
```
🚀 Starting experiments migration...
✅ Experiments table created
✅ Indexes created
📊 Found XXXX experiments in CSV
✅ Inserted XXX/XXXX experiments
🎉 Experiments migration completed successfully!
```

---

## API Endpoints

### Search Experiments
```http
POST /api/experiments/search
Content-Type: application/json

{
  "query": "microgravity"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "title": "Experiment Title",
      "authors": "Author Names",
      "link": "https://..."
    }
  ],
  "query": "microgravity",
  "count": 10
}
```

### Get Experiment Details
```http
GET /api/experiments/:id
```

### Analyze Experiment with Gemini AI
```http
POST /api/experiments/:id/analyze
```

**Response includes:**
- Executive Summary
- Experiment Details
- Key Findings
- Biological Impacts
- Knowledge Graph
- Practical Applications
- Research Connections
- Visual Insights
- Future Research Recommendations

---

## Frontend Usage

### Search Page
Navigate to: `http://localhost:3000/#/search`

**Features:**
- Enter experiment name (e.g., "microgravity", "bone loss")
- Enter scientist name (e.g., "Ruth K Globus")
- View paginated search results
- Click on any result to view details

### Experiment Details Page
URL format: `http://localhost:3000/#/experiment/:id`

**Features:**
- View experiment metadata
- Click "Analyze with Gemini AI" button
- View AI-generated analysis with multiple sections
- Navigate between sections using section buttons
- Back button to return to search results

---

## Testing the Feature

### Test 1: Search by Experiment Topic
1. Go to search page
2. Enter "microgravity" 
3. Should return experiments related to microgravity research

### Test 2: Search by Scientist Name
1. Go to search page
2. Enter "Ruth K Globus"
3. Should return experiments authored by this scientist

### Test 3: AI Analysis
1. Search for any experiment
2. Click on an experiment card
3. Click "Analyze with Gemini AI"
4. Wait for analysis (may take 30-60 seconds)
5. View comprehensive analysis with multiple sections

---

## File Structure

```
Nasa-Space-Hackathon/
├── backend/
│   ├── data/
│   │   └── expts_authors_links.csv          # Experiments data
│   ├── routes/
│   │   └── experiments.js                   # Search & analysis routes
│   ├── services/
│   │   └── geminiService.js                 # Gemini AI integration
│   ├── scripts/
│   │   └── migrate-experiments.js           # Database migration
│   └── config/
│       └── database.js                      # Updated with experiments tables
├── src/
│   └── components/
│       ├── SearchEngine.js                  # Search page component
│       ├── SearchEngine.css                 # Search page styles
│       ├── ExperimentDetails.js             # Details & analysis page
│       └── ExperimentDetails.css            # Details page styles
└── EXPERIMENTS_SEARCH_SETUP.md              # This file
```

---

## Database Schema

### `experiments` Table
```sql
CREATE TABLE experiments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Full-text search indexes
CREATE INDEX idx_experiments_title ON experiments USING gin(to_tsvector('english', title));
CREATE INDEX idx_experiments_authors ON experiments USING gin(to_tsvector('english', authors));
CREATE INDEX idx_experiments_link ON experiments(link);
```

### `experiment_analyses` Table
```sql
CREATE TABLE experiment_analyses (
  id SERIAL PRIMARY KEY,
  experiment_id INTEGER UNIQUE NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Gemini AI Integration

### Model Used
- **Model:** `gemini-2.0-flash-exp`
- **Max Output Tokens:** 8192
- **Temperature:** 0.7

### Analysis Sections Generated
1. **Executive Summary** - Overview and significance
2. **Experiment Details** - Methodology and design
3. **Key Findings** - Major discoveries (5-7 points)
4. **Biological Impacts** - Effects on cells, physiology, genetics
5. **Knowledge Graph** - Structured relationships and connections
6. **Practical Applications** - Real-world implications
7. **Research Connections** - Related studies and missions
8. **Visual Insights** - Recommended data visualizations
9. **Future Research** - Open questions and recommendations

### Caching
Analysis results are cached in the `experiment_analyses` table to:
- Reduce API calls
- Improve response time for repeat queries
- Save costs

---

## Troubleshooting

### Issue: "No experiments found"
**Solution:**
1. Check if migration script ran successfully
2. Verify CSV file is in `backend/data/`
3. Check database connection

### Issue: "Gemini API Error"
**Solution:**
1. Verify API key in `.env` file
2. Check API key has proper permissions
3. Ensure internet connectivity
4. Check Gemini API quota limits

### Issue: Search returns no results
**Solution:**
1. Try broader search terms
2. Check spelling of scientist names
3. Use partial matches (e.g., "micro" instead of "microgravity")

### Issue: Analysis takes too long
**Solution:**
- First analysis may take 30-60 seconds (normal)
- Subsequent analyses are cached and load instantly
- Check network connection to Google's API

---

## Environment Variables Summary

Add these to `backend/.env`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws

# Existing variables (keep these)
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_2024
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nasa_hackathon
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## Starting the Application

### Complete Startup Sequence

1. **Start PostgreSQL Database**
   ```bash
   # Windows (if not running as service)
   pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
   
   # Linux/Mac
   sudo systemctl start postgresql
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   
   Expected output:
   ```
   🐘 Connected to PostgreSQL database
   ✅ Database initialization completed
   🚀 NASA Space Hackathon Backend running on port 5000
   ```

3. **Start Frontend (in new terminal)**
   ```bash
   cd ..
   npm start
   ```
   
   Opens browser at: `http://localhost:3000`

4. **Navigate to Search**
   Click "Search Engine" in navigation or go to:
   `http://localhost:3000/#/search`

---

## Example Queries

### Popular Search Terms
- **Topics:** microgravity, bone, muscle, cell, radiation, DNA, immune
- **Scientists:** 
  - Ruth K Globus
  - Eduardo A C Almeida
  - Joshua S Alwood
  - Diane C Bassham
  - Kathleen M Beckingham

### Sample Workflow
1. Search: "bone"
2. Results: Multiple bone-related microgravity experiments
3. Click: "Microgravity Induces Pelvic Bone Loss..."
4. Analyze: AI generates comprehensive analysis
5. Navigate: Use section buttons to explore findings
6. Reference: Click "View Original Publication" for source

---

## Performance Considerations

### Search Performance
- Full-text search indexes enable sub-second queries
- Supports searches across ~1000+ experiments
- Returns top 50 results by relevance

### Analysis Performance
- **First analysis:** 30-60 seconds (API call)
- **Cached analysis:** < 1 second (database lookup)
- Consider implementing background jobs for large batches

### Database Size
- Experiments table: ~1-2 MB for 1000+ records
- Analysis cache: ~100-500 KB per analysis
- Indexes: Additional ~5-10 MB

---

## Security Notes

⚠️ **Important:** The Gemini API key is included in this setup guide for development purposes only.

For production:
1. Store API key in environment variables only
2. Never commit `.env` files to version control
3. Use secret management services (AWS Secrets Manager, Azure Key Vault)
4. Rotate API keys regularly
5. Implement rate limiting on analysis endpoints
6. Add user authentication for analysis features

---

## Future Enhancements

### Potential Features
- [ ] Bookmark favorite experiments
- [ ] Export analysis as PDF
- [ ] Compare multiple experiments
- [ ] Advanced filters (date, author affiliation, publication type)
- [ ] Citation export (BibTeX, APA, MLA)
- [ ] Related experiments recommendations
- [ ] Visualization of knowledge graphs
- [ ] Email analysis reports

### Performance Improvements
- [ ] Implement Redis for caching
- [ ] Add pagination for large result sets
- [ ] Background job queue for analysis
- [ ] Elasticsearch for advanced search

---

## Support & Contact

For issues or questions:
1. Check this guide first
2. Review console logs for errors
3. Check database connection
4. Verify all dependencies installed
5. Ensure CSV file is properly formatted

---

## Success Criteria

✅ You've successfully set up the feature when:
1. Search page loads without errors
2. Searching returns relevant results
3. Clicking an experiment shows details
4. AI analysis generates comprehensive report
5. Navigation between sections works smoothly
6. Back button returns to search results

**Enjoy exploring NASA's bioscience experiments! 🚀🔬**