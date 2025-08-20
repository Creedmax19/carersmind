@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting CarersMind Frontend deployment for IONOS VPS...
echo.

REM Configuration
set PROJECT_NAME=carersmind-frontend
set DEPLOY_DIR=deploy-frontend

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Error: index.html not found. Please run this script from the docs directory.
    pause
    exit /b 1
)

echo 📋 Deployment Configuration:
echo Project: %PROJECT_NAME%
echo Deploy Directory: %DEPLOY_DIR%
echo Target: IONOS VPS (Frontend)
echo.

REM Create deployment package
echo 📦 Creating deployment package for IONOS VPS...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

REM Copy necessary files
echo Copying files...
xcopy "*.html" "%DEPLOY_DIR%\" /Y
xcopy "js" "%DEPLOY_DIR%\js\" /E /I /Y
xcopy "css" "%DEPLOY_DIR%\css\" /E /I /Y
xcopy "images" "%DEPLOY_DIR%\images\" /E /I /Y
xcopy "fonts" "%DEPLOY_DIR%\fonts\" /E /I /Y
xcopy "resources" "%DEPLOY_DIR%\resources\" /E /I /Y
xcopy "store" "%DEPLOY_DIR%\store\" /E /I /Y
xcopy "admin" "%DEPLOY_DIR%\admin\" /E /I /Y

REM Copy configuration files
copy "manifest.json" "%DEPLOY_DIR%\" /Y
copy "robots.txt" "%DEPLOY_DIR%\" /Y
copy "sitemap.xml" "%DEPLOY_DIR%\" /Y
copy "browserconfig.xml" "%DEPLOY_DIR%\" /Y

REM Create nginx configuration for frontend
echo Creating nginx configuration...
(
echo server {
echo     listen 80;
echo     server_name carersmind.co.uk www.carersmind.co.uk;
echo     root /var/www/carersmind.co.uk;
echo     index index.html;
echo.
echo     # Security headers
echo     add_header X-Frame-Options "SAMEORIGIN" always;
echo     add_header X-XSS-Protection "1; mode=block" always;
echo     add_header X-Content-Type-Options "nosniff" always;
echo     add_header Referrer-Policy "no-referrer-when-downgrade" always;
echo     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
echo.
echo     # Gzip compression
echo     gzip on;
echo     gzip_vary on;
echo     gzip_min_length 1024;
echo     gzip_proxied expired no-cache no-store private must-revalidate auth;
echo     gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
echo.
echo     # Static file caching
echo     location ~* \.^(jpg^|jpeg^|png^|gif^|ico^|css^|js^|pdf^|txt^)$ {
echo         expires 1y;
echo         add_header Cache-Control "public, immutable";
echo     }
echo.
echo     # Handle SPA routing
echo     location / {
echo         try_files $uri $uri/ /index.html;
echo     }
echo }
) > "%DEPLOY_DIR%\nginx-frontend.conf"

REM Create deployment instructions
echo Creating deployment instructions...
(
echo # IONOS VPS Frontend Deployment Instructions
echo.
echo ## 1. Upload Files
echo Upload ALL contents of %DEPLOY_DIR% to: /var/www/carersmind.co.uk/
echo.
echo ## 2. Set Up Nginx
echo ```bash
echo sudo cp nginx-frontend.conf /etc/nginx/sites-available/carersmind.co.uk
echo sudo ln -s /etc/nginx/sites-available/carersmind.co.uk /etc/nginx/sites-enabled/
echo sudo nginx -t
echo sudo systemctl reload nginx
echo ```
echo.
echo ## 3. Set Up SSL
echo ```bash
echo sudo certbot --nginx -d carersmind.co.uk -d www.carersmind.co.uk
echo ```
echo.
echo ## 4. Configure DNS
echo Point carersmind.co.uk to your IONOS VPS IP address
echo.
echo ## 5. Test
echo Visit: https://carersmind.co.uk
echo.
echo ## ✅ Result
echo Your frontend will be live at: https://carersmind.co.uk
echo.
echo ## 🆘 Need Help?
echo - IONOS VPS Support: 24/7 technical support
echo - Check nginx status: sudo systemctl status nginx
echo - Check nginx config: sudo nginx -t
) > "%DEPLOY_DIR%\DEPLOYMENT-INSTRUCTIONS.md"

echo.
echo ✅ Frontend deployment package created in: %DEPLOY_DIR%
echo.
echo 📤 Next Steps:
echo 1. Upload contents of '%DEPLOY_DIR%' to /var/www/carersmind.co.uk/ on IONOS VPS
echo 2. Follow DEPLOYMENT-INSTRUCTIONS.md
echo 3. Configure nginx and SSL
echo 4. Test your frontend
echo.
echo 🎯 This package is optimized for IONOS VPS hosting!
echo.
pause
