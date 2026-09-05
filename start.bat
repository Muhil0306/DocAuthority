@echo off
title Launching DocAuthority...
echo Starting DocAuthority Backend and Frontend...

:: Start Backend in a new window
start "DocAuthority Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && set PYTHONPATH=. && uvicorn main:app --reload --port 8000"

:: Start Frontend in a new window
start "DocAuthority Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait 3 seconds for servers to initialize, then open browser
timeout /t 3 >nul
start http://localhost:5173

echo Done! Website opened at http://localhost:5173
