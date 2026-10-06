# Project Commands & Workflow Guide

This document lists all standard commands for running and developing the application.

---

## ⚡ Quick Start: Daily Use (Only 1 Command Required!)

You **do NOT** need to run both frontend and backend separately for normal usage. 

The Python FastAPI server automatically serves the compiled frontend and the backend API together on port **8000**.

### Start the Full Application
```powershell
uv run main.py
```
- **Access App**: Open your browser at [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **What this does**: Starts the backend API, connects to SQLite (`backend/market_data.db`), and serves the complete frontend user interface.

To stop the server at any time, press `CTRL + C` in your terminal.

---

## 🎨 Frontend Rebuild (When UI Code Changes)

If you modify any files inside the `frontend/src/` folder and want the changes reflected in `uv run main.py`:

```powershell
npm run build --prefix frontend
```
This updates the production files in `frontend/dist/`.

---

## 🛠️ Development Mode (Optional — with Instant Hot-Reload)

Use this only if you are actively editing React code and want changes to appear immediately in your browser without rebuilding:

1. **Terminal 1 (Backend API)**:
   ```powershell
   uv run main.py
   ```

2. **Terminal 2 (Frontend Dev Server)**:
   ```powershell
   npm run dev --prefix frontend
   ```
   - Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
   - Vite will proxy all `/api` calls directly to `127.0.0.1:8000`.

---

## 📦 Dependency Installation

### Python Backend Dependencies
Always use `uv`:
```powershell
uv sync
```
Or to add a new Python package:
```powershell
uv add <package-name>
```

### Frontend Dependencies
```powershell
npm install --prefix frontend
```

---

## 🔧 Troubleshooting

### Port 8000 Already in Use (`[Errno 10048]`)
If you see an error saying the port is already in use, a previous server instance is still running in the background.

1. **Find the Process ID (PID)**:
   ```powershell
   netstat -ano | findstr :8000
   ```
2. **Kill the process** (replace `<PID>` with the number in the rightmost column):
   ```powershell
   taskkill /PID <PID> /F
   ```
3. Restart:
   ```powershell
   uv run main.py
   ```
