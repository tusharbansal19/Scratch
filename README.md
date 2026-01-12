# Real-Time Collaborative Drawing Board

A Figma-like real-time collaboration tool built with React, FastAPI, WebSockets, Redis, and MongoDB.

## Features
- **Real-time Collaboration**: Live drawing sync via WebSockets and Redis Pub/Sub.
- **Interactive Canvas**: Powered by Fabric.js for object-based drawing (Shapes, Free draw, Text).
- **Shareable Links**: Unique board IDs allow users to jump into the same session instantly.
- **Scalable Architecture**: Designed with distributed systems in mind using Redis.
- **Persistence**: Boards are saved to MongoDB.

## Architecture
- **Frontend**: React + TypeScript + Vite
  - `fabric.js` for canvas manipulation.
  - `zustand` for client-state management.
  - `react-router-dom` for navigation.
  - `tailwindcss` for styling.
- **Backend**: FastAPI (Python)
  - `fastapi` for REST and WebSockets.
  - `redis` for real-time event broadcasting (Pub/Sub).
  - `motor` (Async Mongo) for database operations.

## Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.9+
- Redis running on `localhost:6379`
- MongoDB running on `localhost:27017`

### 1. Backend Setup
```bash
cd server
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
API running at: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
App running at: `http://localhost:5173`

## Usage
1. Open the frontend.
2. Click "Create New Board".
3. Share the URL with a friend (or open in a new tab).
4. Draw together!
