@echo off
echo Killing old processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM mongod.exe 2>nul

echo.
echo Waiting 5 seconds...
timeout /t 5

echo.
echo Starting MongoDB...
start mongod

echo Waiting 5 seconds...
timeout /t 5

echo.
echo Starting Backend...
cd server
start cmd /k npm run dev

echo Waiting 5 seconds...
timeout /t 5

echo.
echo Starting Frontend...
cd ..\client
start cmd /k npm start

echo.
echo All services started!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause