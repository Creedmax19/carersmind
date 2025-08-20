@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting CarersMind API deployment to IONOS Webspace...
echo.

REM Configuration
set PROJECT_NAME=carersmind-api-webspace
set DEPLOY_DIR=deploy-webspace

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the server directory.
    pause
    exit /b 1
)

echo 📋 Deployment Configuration:
echo Project: %PROJECT_NAME%
echo Deploy Directory: %DEPLOY_DIR%
echo Target: IONOS Webspace (via FileZilla)
echo.

REM Build the project
echo 🔨 Building project...
call npm ci --only=production
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Create deployment package
echo 📦 Creating deployment package for IONOS Webspace...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

REM Copy necessary files
echo Copying files...
xcopy "package*.json" "%DEPLOY_DIR%\" /Y
xcopy "routes" "%DEPLOY_DIR%\routes\" /E /I /Y
xcopy "config" "%DEPLOY_DIR%\config\" /E /I /Y
xcopy "middleware" "%DEPLOY_DIR%\middleware\" /E /I /Y
xcopy "utils" "%DEPLOY_DIR%\utils\" /E /I /Y
copy "server.js" "%DEPLOY_DIR%\" /Y
copy "config\production.env" "%DEPLOY_DIR%\.env" /Y

REM Remove development files
if exist "%DEPLOY_DIR%\config\swagger.js" del "%DEPLOY_DIR%\config\swagger.js"
if exist "%DEPLOY_DIR%\node_modules" rmdir /s /q "%DEPLOY_DIR%\node_modules"

REM Create .htaccess file for IONOS webspace
echo Creating .htaccess file...
(
echo # IONOS Webspace Configuration
echo RewriteEngine On
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^(.*^)$ index.php [QSA,L]
echo.
echo # Security Headers
echo Header always set X-Content-Type-Options nosniff
echo Header always set X-Frame-Options DENY
echo Header always set X-XSS-Protection "1; mode=block"
echo Header always set Referrer-Policy "strict-origin-when-cross-origin"
) > "%DEPLOY_DIR%\.htaccess"

REM Create index.php entry point for IONOS webspace
echo Creating index.php entry point...
(
echo ^<?php
echo // IONOS Webspace Node.js Entry Point
echo $command = 'cd ' . __DIR__ . ' ^&^& node server.js';
echo $output = shell_exec^($command^);
echo echo $output;
echo ?^>
) > "%DEPLOY_DIR%\index.php"

REM Create webspace-specific start script
echo Creating start script...
(
echo @echo off
echo echo Starting CarersMind API on IONOS Webspace...
echo set NODE_ENV=production
echo set PORT=80
echo node server.js
echo pause
) > "%DEPLOY_DIR%\start.bat"

REM Create deployment instructions for FileZilla
echo Creating FileZilla deployment instructions...
(
echo # IONOS Webspace Deployment via FileZilla
echo.
echo ## 1. Prepare FileZilla
echo - Download FileZilla Client if needed
echo - Open FileZilla → File → Site Manager
echo.
echo ## 2. Configure IONOS Connection
echo Host: ftp.carersmind.co.uk
echo Port: 21
echo Protocol: FTP
echo User: Your IONOS username
echo Password: Your IONOS password
echo.
echo ## 3. Connect and Upload
echo - Connect to IONOS
echo - Navigate to root directory ^(/ or /htdocs/^)
echo - Create 'api' folder
echo - Upload ALL files from %DEPLOY_DIR% to /api/
echo.
echo ## 4. Set File Permissions
echo - Files: 644
echo - Folders: 755
echo - Right-click → File permissions in FileZilla
echo.
echo ## 5. Test Your API
echo Visit: https://api.carersmind.co.uk/health
echo.
echo ## ⚠️ IMPORTANT NOTES:
echo - IONOS webspace may not support Node.js
echo - If you get errors, contact IONOS support
echo - Consider upgrading to IONOS VPS for full Node.js support
echo.
echo ## 🆘 Need Help?
echo - IONOS Support: Check your hosting control panel
echo - Node.js Support: Contact IONOS to confirm availability
) > "%DEPLOY_DIR%\FILEZILLA-INSTRUCTIONS.md"

echo.
echo ✅ Deployment package created in: %DEPLOY_DIR%
echo.
echo 📤 Next Steps:
echo 1. Open FileZilla and connect to IONOS
echo 2. Upload contents of '%DEPLOY_DIR%' to /api/ folder
echo 3. Follow FILEZILLA-INSTRUCTIONS.md
echo 4. Test your API endpoint
echo.
echo ⚠️  Important:
echo - IONOS webspace may not support Node.js applications
echo - If deployment fails, consider upgrading to IONOS VPS
echo - Contact IONOS support to confirm Node.js availability
echo.
echo 🎉 Deployment package ready for FileZilla!
echo.
pause
