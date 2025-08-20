@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting CarersMind API deployment to IONOS...
echo.

REM Configuration
set PROJECT_NAME=carersmind-api
set DEPLOY_DIR=deploy-temp

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the server directory.
    pause
    exit /b 1
)

echo 📋 Deployment Configuration:
echo Project: %PROJECT_NAME%
echo Deploy Directory: %DEPLOY_DIR%
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
echo 📦 Creating deployment package...
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
copy ".env" "%DEPLOY_DIR%\" /Y

REM Remove development files
if exist "%DEPLOY_DIR%\config\swagger.js" del "%DEPLOY_DIR%\config\swagger.js"
if exist "%DEPLOY_DIR%\node_modules" rmdir /s /q "%DEPLOY_DIR%\node_modules"

REM Create production start script
echo Creating start script...
(
echo @echo off
echo set NODE_ENV=production
echo set PORT=5002
echo node server.js
) > "%DEPLOY_DIR%\start.bat"

REM Create systemd service file
echo Creating systemd service file...
(
echo [Unit]
echo Description=CarersMind API
echo After=network.target
echo.
echo [Service]
echo Type=simple
echo User=www-data
echo WorkingDirectory=/var/www/carersmind-api
echo Environment=NODE_ENV=production
echo Environment=PORT=5002
echo ExecStart=/var/www/carersmind-api/start.sh
echo Restart=always
echo RestartSec=10
echo.
echo [Install]
echo WantedBy=multi-user.target
) > "%DEPLOY_DIR%\carersmind-api.service"

REM Create nginx configuration
echo Creating nginx configuration...
(
echo server {
echo     listen 80;
echo     server_name api.carersmind.co.uk;
echo.    
echo     location / {
echo         proxy_pass http://127.0.0.1:5002;
echo         proxy_http_version 1.1;
echo         proxy_set_header Upgrade $http_upgrade;
echo         proxy_set_header Connection 'upgrade';
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo         proxy_cache_bypass $http_upgrade;
echo         proxy_read_timeout 300s;
echo         proxy_connect_timeout 75s;
echo     }
echo }
) > "%DEPLOY_DIR%\nginx-carersmind-api.conf"

REM Create deployment instructions
echo Creating deployment instructions...
(
echo # IONOS Deployment Instructions
echo.
echo ## 1. Upload Files
echo Upload all files in this directory to: /var/www/carersmind-api/
echo.
echo ## 2. Install Dependencies
echo ```bash
echo cd /var/www/carersmind-api/
echo npm ci --only=production
echo ```
echo.
echo ## 3. Set Environment Variables
echo Edit .env file with your production values:
echo - STRIPE_SECRET_KEY ^(LIVE key^)
echo - SUPABASE credentials
echo - JWT_SECRET
echo.
echo ## 4. Set Up Nginx
echo ```bash
echo sudo cp nginx-carersmind-api.conf /etc/nginx/sites-available/
echo sudo ln -s /etc/nginx/sites-available/nginx-carersmind-api.conf /etc/nginx/sites-enabled/
echo sudo nginx -t
echo sudo systemctl reload nginx
echo ```
echo.
echo ## 5. Set Up Systemd Service
echo ```bash
echo sudo cp carersmind-api.service /etc/systemd/system/
echo sudo systemctl daemon-reload
echo sudo systemctl enable carersmind-api
echo sudo systemctl start carersmind-api
echo ```
echo.
echo ## 6. Check Status
echo ```bash
echo sudo systemctl status carersmind-api
echo sudo journalctl -u carersmind-api -f
echo ```
echo.
echo ## 7. Set Up SSL ^(Let's Encrypt^)
echo ```bash
echo sudo apt install certbot python3-certbot-nginx
echo sudo certbot --nginx -d api.carersmind.co.uk
echo ```
) > "%DEPLOY_DIR%\DEPLOYMENT-INSTRUCTIONS.md"

echo.
echo ✅ Deployment package created in: %DEPLOY_DIR%
echo.
echo 📤 Next Steps:
echo 1. Upload the contents of '%DEPLOY_DIR%' to your IONOS server
echo 2. Follow the DEPLOYMENT-INSTRUCTIONS.md file
echo 3. Update your DNS to point api.carersmind.co.uk to your IONOS server
echo.
echo ⚠️  Important:
echo - Make sure to update .env with your LIVE Stripe keys
echo - Set up SSL certificate for api.carersmind.co.uk
echo - Configure your domain DNS records
echo.
echo 🎉 Deployment package ready!
echo.
pause
