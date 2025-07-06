@echo off
echo Optimizing logo files...

REM Create images directory if it doesn't exist
if not exist "images" mkdir images

REM Copy original logo to main logo
xcopy /Y "images\logo.jpg" "images\logo.png"

REM Create favicon sizes
xcopy /Y "images\logo.jpg" "images\favicon-32x32.png"
xcopy /Y "images\logo.jpg" "images\favicon-16x16.png"
xcopy /Y "images\logo.jpg" "images\apple-touch-icon.png"
xcopy /Y "images\logo.jpg" "images\favicon-192x192.png"
xcopy /Y "images\logo.jpg" "images\favicon-512x512.png"

REM Create browserconfig.xml
if not exist "browserconfig.xml" (
    echo Creating browserconfig.xml...
    echo ^<?xml version="1.0" encoding="utf-8"?^> > browserconfig.xml
    echo ^<browserconfig^> >> browserconfig.xml
    echo     ^<msapplication^> >> browserconfig.xml
    echo         ^<tile^> >> browserconfig.xml
    echo             ^<square70x70logo src="/images/favicon-70x70.png"/^> >> browserconfig.xml
    echo             ^<square150x150logo src="/images/favicon-150x150.png"/^> >> browserconfig.xml
    echo             ^<square310x310logo src="/images/favicon-310x310.png"/^> >> browserconfig.xml
    echo             ^<wide310x150logo src="/images/favicon-310x150.png"/^> >> browserconfig.xml
    echo             ^<TileColor^>#2c3e50^</TileColor^> >> browserconfig.xml
    echo         ^</tile^> >> browserconfig.xml
    echo     ^</msapplication^> >> browserconfig.xml
    echo ^</browserconfig^> >> browserconfig.xml
)

echo Optimization complete!
pause
