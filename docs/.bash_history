apt update && upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x
bash - apt-get install -y nodejs
apt install nginx
apt install -y nodejs
apt install certbot python3-certbot-nginx -y
npm install -g pm2
apt install npm
mkdir -p /var/www/carersmind.co.uk
mkdir -p /var/www/api.carersmind.co.uk
mkdir -p /var/www/backups
chown -P www-data:www-data /var/www/
chown -R www-data:www-data /var/www/
chmod -R 755 /var/www/
cd /var/www/api.carersmind.co.uk
npm ci --only=production
npm@5 ci --only=production
npm install
ls -la /var/www/
scp -r docs/deploy-temp/* root@217.154.48.246:/var/www/carersmind.co.uk/
scp -r docs/deploy-temp/* root@217.154.48.246:/var/www/api.carersmind.co.uk/
cd /var/www/api.carersmind.co.uk 
npm ci --only=production
cd ..
cd root@Ubuntu
cd root@ubuntu
scp -r USER/Carer's-care CIC/server/*user@217.154.48.246:var/www/api.carersmind.co.uk
/

scp -r "C:\Users\USER\Carer's-care CIC\server" root@217.154.48.246:var/www/api.carersmind.co.uk
scp -r "C:\Users\USER\Carer's-care CIC\server\*" root@217.154.48.246:var/www/api.carersmind.co.uk/
cd /var/www/api.carersmind.co.uk 
nano ecosystem.config.js
pm2 start ecosystem.config.js
