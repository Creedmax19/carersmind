# IONOS VPS Frontend Deployment Instructions

## 1. Upload Files
Upload ALL contents of deploy-frontend to: /var/www/carersmind.co.uk/

## 2. Set Up Nginx
```bash
sudo cp nginx-frontend.conf /etc/nginx/sites-available/carersmind.co.uk
sudo ln -s /etc/nginx/sites-available/carersmind.co.uk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. Set Up SSL
```bash
sudo certbot --nginx -d carersmind.co.uk -d www.carersmind.co.uk
```

## 4. Configure DNS
Point carersmind.co.uk to your IONOS VPS IP address

## 5. Test
Visit: https://carersmind.co.uk

## ✅ Result
Your frontend will be live at: https://carersmind.co.uk

## 🆘 Need Help?
- IONOS VPS Support: 24/7 technical support
- Check nginx status: sudo systemctl status nginx
- Check nginx config: sudo nginx -t
