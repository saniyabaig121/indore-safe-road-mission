# Indore Pothole Tracker Backend

This is the AI-powered backend for the Indore Pothole Tracker Civic Issue Reporting System.

## Features
- **FastAPI** backend with SQLite database
- **YOLOv8** integration for automatic pothole severity detection
- **Priority Algorithm**: `(damage 1-10) × (repeats 1-5) × (road type: main=2, lane=1)`
- **RESTful Endpoints**

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate fake reports (Seed Data):**
   ```bash
   python seed_data.py
   ```
   *This populates the database with 15 fake reports around Indore (22.7196, 75.8577).*

3. **Run the server:**
   ```bash
   python app.py
   ```
   *The server will start on `http://localhost:8000`*

## API Endpoints

- `POST /api/report` - Upload a photo and location (triggers YOLO detection & priority calculation)
- `GET /api/reports` - Fetch all reports, sorted by priority (Highest first)
- `GET /api/report/{id}` - Fetch details of a single report
- `POST /api/report/{id}/status` - Update the status of a report (Pending -> In Progress -> Fixed)

*You can test these endpoints automatically at the interactive docs: `http://localhost:8000/docs`*
