@echo off
echo === Alexa ChatGPT Calendar Skill - Development Setup ===
echo.

echo Setting Node.js path...
set NODE_PATH=C:\Users\velazqud\AppData\Local\Temp\npm-install\node-v18.17.0-win-x64
set PATH=%NODE_PATH%;%PATH%

echo.
echo Node.js version:
node --version

echo NPM version:
npm --version

echo.
echo ===============================================
echo  Choose an option:
echo  1. Start Backend Server (port 3001)
echo  2. Start Frontend Client (port 3000)
echo  3. Start both (Backend + Frontend)
echo  4. Install MongoDB (required for backend)
echo ===============================================
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto mongodb
goto end

:backend
echo Starting Backend Server...
cd /d "C:\dev\GPT 21\server"
node index.js
goto end

:frontend
echo Starting Frontend Client...
cd /d "C:\dev\GPT 21\client"
npm start
goto end

:both
echo Starting both Backend and Frontend...
start cmd /k "cd /d C:\dev\GPT 21\server && node index.js"
timeout /t 3 >nul
cd /d "C:\dev\GPT 21\client"
npm start
goto end

:mongodb
echo.
echo MongoDB is required for the backend to work.
echo.
echo Option 1: Install MongoDB locally
echo Download from: https://www.mongodb.com/try/download/community
echo.
echo Option 2: Use MongoDB Atlas (cloud)
echo Sign up at: https://www.mongodb.com/atlas
echo Then update server/.env with your connection string
echo.
pause
goto end

:end
echo.
echo Thanks for using Alexa ChatGPT Calendar Skill!
pause