# Scratch ⚡

> **The Real-Time Collaborative Whiteboard for Modern Teams.**

Scratch is an industrial-grade, infinite-canvas whiteboard designed for speed, simplicity, and seamless collaboration. Whether you're architecting a system, running a sprint, or just sketching ideas, Scratch keeps everyone on the same page—literally.

---

## ✨ Why Scratch?

We built Scratch because we wanted a whiteboard that felt **native**, not web-based.
- **🚀 Ultra-Low Latency**: Powered by WebSockets and Redis Pub/Sub, changes propagate in < 30ms.
- **🎨 Infinite Canvas**: Pan, zoom, and expand your ideas forever without hitting borders.
- **👥 True Multiplayer**: See your team's cursors fly around in real-time. Feels like you're in the same room.
- **📱 Mobile Ready**: A fully responsive interface that adapts to your device, from 4K monitors to smartphones.
- **💾 Smart Persistence**: Auto-saves your work. Rooms strictly manage their own lifecycle (auto-cleaning empty, stale rooms).

---

## 🛠️ The Tech Stack

Built with a focus on **performance** and **scalability**.

| Area | Technology | Reason |
|------|------------|--------|
| **Frontend** | **React + TypeScript** | Robust, type-safe UI architecture. |
| **Canvas Engine** | **Fabric.js** | High-performance object rendering. |
| **Styling** | **Tailwind CSS** | Modern, responsive, utility-first design. |
| **Backend** | **FastAPI (Python)** | Async-first, high-throughput API. |
| **Real-Time** | **Redis Pub/Sub** | Horizontally scalable message broker. |
| **Database** | **MongoDB** | Flexible, document-oriented persistence. |
| **Auth** | **JWT & OAuth2** | Secure, stateless authentication. |

---

## 🚀 Quick Start Guide

Want to run this locally? Let's get you set up in less than 5 minutes.

### Prerequisites
- **Node.js** (v16+)
- **Python** (v3.9+)
- **Redis** & **MongoDB** running locally (or via Docker)

### 1️⃣ Backend Setup
The heart of the operation. Handles auth, sockets, and data.

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```
*Server runs at `http://localhost:8000`*

### 2️⃣ Frontend Setup
The visual interface.

```bash
cd client

# Install packages
npm install

# Start development server
npm run dev
```
*Client runs at `http://localhost:5173`*

---

## 📁 System Architecture

A peek under the hood:

```
root/
├── client/                 # React Frontend application
│   ├── src/components/     # UI Building blocks (Canvas, Toolbar)
│   ├── src/store/          # Redux + Zustand state management
│   └── src/hooks/          # Custom hooks (KeepAlive, Auth)
│
├── server/                 # FastAPI Backend application
│   ├── app/api/            # REST Endpoints & WS Handlers
│   ├── app/services/       # Core Logic (Socket Manager, Cleanup Tasks)
│   └── app/db/             # Database Connectors (Redis/Mongo)
```

---

## 🤝 Contributing

We believe in the power of community.
1. **Fork** the repository.
2. **Clone** it to your machine.
3. **Create a branch** (`git checkout -b feature/cool-new-thing`).
4. **Commit** your changes.
5. **Push** and submit a **Pull Request**.

---

## 📄 License

This project is open-sourced under the **MIT License**. Use it, break it, fix it, resize it.

---

<p align="center">
  <i>Built with ❤️ for builders.</i>
</p>
