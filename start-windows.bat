@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js 20.19+ is required & pause & exit /b 1)
if not exist "node_modules\react" (
  echo Installing React and Three.js dependencies (internet needed first time)...
  call npm.cmd install || (echo Installation failed. Check your internet connection. & pause & exit /b 1)
)
call npm.cmd run dev
pause
