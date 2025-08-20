# IONOS Deployment Instructions

## 1. Upload Files
Upload all files in this directory to: /var/www/carersmind-api/

## 2. Install Dependencies
```bash
cd /var/www/carersmind-api/
npm ci --only=production
```

## 3. Set Environment Variables
Edit .env file with your production values:
- STRIPE_SECRET_KEY (LIVE key)
- SUPABASE credentials
- JWT_SECRET

## 4. Set Up Nginx
```bash
sudo cp nginx-carersmind-api.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/nginx-carersmind-api.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Set Up Systemd Service
```bash
sudo cp carersmind-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable carersmind-api
sudo systemctl start carersmind-api
```

## 6. Check Status
```bash
sudo systemctl status carersmind-api
sudo journalctl -u carersmind-api -f
```

## 7. Set Up SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.carersmind.co.uk
```
