@echo off
cd /d "%~dp0"
node build.mjs
if errorlevel 1 (echo. & echo Could not update the blog. Read the error above.)
pause
