@echo off
rem Preview the Tiny Tantrum Games website on this computer.
cd /d "%~dp0"
if not exist dist\index.html node build-site.js
echo Starting the website at http://localhost:3000  (close this window to stop it)
start "" cmd /c "timeout /t 5 >nul & start http://localhost:3000"
npx --yes serve dist -l 3000
