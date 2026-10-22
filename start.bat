@echo off
REM AutoBridge Lite - starts the Java backend and React frontend in two windows (Windows).
setlocal
set "ROOT=%~dp0"

where java >nul 2>nul
if errorlevel 1 (
  echo ERROR: Java not found. Install JDK 21 from https://adoptium.net and try again.
  pause
  exit /b 1
)
where mvn >nul 2>nul
if errorlevel 1 (
  echo ERROR: Maven not found. Install Apache Maven 3.9+ from https://maven.apache.org/download.cgi and add it to PATH.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js not found. Install the Node.js LTS version from https://nodejs.org and try again.
  pause
  exit /b 1
)

echo Starting Java backend on http://localhost:8080 ...
start "AutoBridge Backend (Java)" cmd /k "cd /d "%ROOT%backend" && mvn spring-boot:run"

echo Starting React frontend on http://localhost:5173 ...
start "AutoBridge Frontend (React)" cmd /k "cd /d "%ROOT%frontend" && (if not exist node_modules npm install) && npm run dev"

echo.
echo Two windows were opened. When the backend window shows "Started AutoBridgeApplication"
echo and the frontend shows a Local URL, open http://localhost:5173 in your browser.
echo Close both windows to stop the app.
echo.
pause
