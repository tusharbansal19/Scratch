# Scratch

## The Real-Time Collaborative Whiteboard for Modern Teams

Scratch is an industrial-grade, infinite-canvas collaborative whiteboard designed for speed, simplicity, and seamless real-time collaboration. It enables distributed teams to brainstorm, design systems, conduct technical discussions, and visualize ideas together with minimal latency and a consistent shared state.

---

## Why Scratch

Scratch is designed to feel native and responsive rather than like a traditional web-based drawing tool.

- Ultra-low latency real-time synchronization using WebSockets and Pub/Sub messaging
- Infinite canvas supporting unrestricted panning and zooming
- True multi-user collaboration with live cursor tracking
- Fully responsive interface supporting desktop and mobile devices
- Automatic persistence with lifecycle-managed collaborative rooms

---

## Technology Stack

The system is built with a strong focus on performance, scalability, and maintainability.

| Area       | Technology            | Purpose |
|------------|------------------------|---------|
| Frontend   | React with TypeScript  | Type-safe, scalable UI development |
| Canvas     | Fabric.js              | High-performance object-based canvas rendering |
| Styling    | Tailwind CSS           | Responsive, utility-first styling |
| Backend    | FastAPI (Python)       | Asynchronous, high-throughput API and WebSocket server |
| Real-Time  | Redis Pub/Sub          | Scalable event broadcasting |
| Database   | MongoDB                | Persistent board and session storage |
| Auth       | JWT and OAuth2         | Secure, stateless authentication |

---

## Quick Start

Follow the steps below to run the project locally.

### Prerequisites

- Node.js v16 or later
- Python v3.9 or later
- Redis and MongoDB (local installation or via Docker)

---

### Backend Setup

The backend manages authentication, WebSocket connections, and board state.

```bash
cd server

python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
