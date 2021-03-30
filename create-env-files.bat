@echo off

copy /d /y "app\.env.local.example" "app\.env.local"
copy /d /y "server\.env.local.example" "server\.env.local"

echo =====================================================================
echo   YOU HAVE NOW CRETED .ENV.FILES FOR SERVER AND APP - FILL THEM IN
echo =====================================================================

PAUSE
