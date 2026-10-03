@echo off
title Launching DocAuthority Full-Stack System...
echo ===================================================
echo   DocAuthority - Authoritative Version Resolver
echo ===================================================
echo Starting Backend (FastAPI) and Frontend (React/Vite)...

:: Kill any old lingering instances on ports
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul

:: Launch Backend Server in new window
start "DocAuthority Backend API" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && set PYTHONPATH=. && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Launch Frontend Server in new window
start "DocAuthority Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait 3 seconds for initialization
timeout /t 3 >nul

:: Open browser automatically
start http://localhost:5173

echo ===================================================
echo DocAuthority Website Opened Successfully!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000/docs
echo ===================================================
