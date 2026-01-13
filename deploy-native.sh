#!/bin/bash

# RP Management System - Native Deployment Script
# For LXC containers, VPS, or bare metal servers (without Docker)

set -e

echo "================================================"
echo "  RP Management System - Native Deployment"
echo "  For LXC/VPS/Bare Metal (Non-Docker)"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the current directory
PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo -e "${BLUE}Project Directory: $PROJECT_DIR${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}⚠ Running as root. Will create www-data user if needed.${NC}"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created.${NC}"
    echo -e "${YELLOW}Please edit .env and set:${NC}"
    echo "  - APP_URL (your server IP or domain)"
    echo "  - DB_* (database credentials)"
    echo "  - Other settings as needed"
    echo ""
    read -p "Press Enter after configuring .env, or Ctrl+C to exit..."
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
MISSING_DEPS=0

# if ! command_exists php; then
#     echo -e "${RED}✗ PHP is not installed${NC}"
#     MISSING_DEPS=1
# else
#     PHP_VERSION=$(php -r "echo PHP_VERSION;" | cut -d. -f1,2)
#     if (( $(echo "$PHP_VERSION >= 8.3" | bc -l) )); then
#         echo -e "${GREEN}✓ PHP $PHP_VERSION installed${NC}"
#     else
#         echo -e "${RED}✗ PHP 8.2+ required, found $PHP_VERSION${NC}"
#         MISSING_DEPS=1
#     fi
# fi

if ! command_exists composer; then
    echo -e "${RED}✗ Composer is not installed${NC}"
    MISSING_DEPS=1
else
    echo -e "${GREEN}✓ Composer installed${NC}"
fi

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    MISSING_DEPS=1
else
    echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    MISSING_DEPS=1
else
    echo -e "${GREEN}✓ npm installed${NC}"
fi

if ! command_exists nginx; then
    echo -e "${YELLOW}⚠ Nginx is not installed (will provide instructions)${NC}"
fi

# Check for MySQL/MariaDB
if ! command_exists mysql && ! command_exists mariadb; then
    echo -e "${YELLOW}⚠ MySQL/MariaDB client not found (may be OK if using remote DB)${NC}"
else
    echo -e "${GREEN}✓ MySQL/MariaDB client installed${NC}"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo -e "${RED}Missing required dependencies!${NC}"
    echo ""
    echo "To install on Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-gd php8.2-zip php8.2-curl"
    echo "  sudo apt install -y composer nodejs npm nginx mysql-server"
    echo ""
    exit 1
fi

echo ""
echo "Step 1: Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo ""
echo "Step 2: Installing Node dependencies..."
npm install

echo ""
echo "Step 3: Building frontend assets..."
npm run build

# After build, we can remove dev dependencies to save space
echo "Removing dev dependencies to save space..."
npm prune --omit=dev

echo ""
echo "Step 4: Setting up application..."

# Generate app key if not set
if grep -q "APP_KEY=$" .env || ! grep -q "APP_KEY=" .env; then
    echo "Generating application key..."
    php artisan key:generate
fi

# Create storage link
echo "Creating storage link..."
php artisan storage:link || true

# Set permissions
echo "Setting permissions..."
if command_exists setfacl; then
    # Use ACL for better permission management
    sudo setfacl -R -m u:www-data:rwX -m u:$(whoami):rwX storage bootstrap/cache
    sudo setfacl -dR -m u:www-data:rwX -m u:$(whoami):rwX storage bootstrap/cache
else
    # Fallback to standard permissions
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 775 storage bootstrap/cache
fi
echo -e "${GREEN}✓ Permissions set${NC}"

echo ""
echo "Step 5: Database setup..."

# Ask about database
read -p "Run database migrations? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
fi

read -p "Seed database with initial data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan db:seed --force
fi

# Initialize leave balances
read -p "Initialize leave balances? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan leaves:initialize-balances
fi

echo ""
echo "Step 6: Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "Step 7: Setting up services..."

# Create systemd service files
echo "Creating systemd service files..."

# Queue worker service
sudo tee /etc/systemd/system/rp-management-worker.service > /dev/null <<EOF
[Unit]
Description=RP Management System Queue Worker
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
RestartSec=5
ExecStart=/usr/bin/php $PROJECT_DIR/artisan queue:work --sleep=3 --tries=3 --max-time=3600
StandardOutput=append:$PROJECT_DIR/storage/logs/worker.log
StandardError=append:$PROJECT_DIR/storage/logs/worker.log

[Install]
WantedBy=multi-user.target
EOF

# Scheduler service
sudo tee /etc/systemd/system/rp-management-scheduler.service > /dev/null <<EOF
[Unit]
Description=RP Management System Scheduler
After=network.target

[Service]
Type=oneshot
User=www-data
Group=www-data
ExecStart=/usr/bin/php $PROJECT_DIR/artisan schedule:run
StandardOutput=append:$PROJECT_DIR/storage/logs/scheduler.log
StandardError=append:$PROJECT_DIR/storage/logs/scheduler.log
EOF

# Scheduler timer
sudo tee /etc/systemd/system/rp-management-scheduler.timer > /dev/null <<EOF
[Unit]
Description=RP Management System Scheduler Timer
Requires=rp-management-scheduler.service

[Timer]
OnCalendar=*:0/1
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
sudo systemctl enable rp-management-worker.service
sudo systemctl start rp-management-worker.service
sudo systemctl enable rp-management-scheduler.timer
sudo systemctl start rp-management-scheduler.timer

echo -e "${GREEN}✓ Services configured and started${NC}"

echo ""
echo "Step 8: Web server configuration..."

# Check if Apache is running
if systemctl is-active --quiet apache2; then
    echo -e "${YELLOW}⚠ Apache2 is already running on port 80${NC}"
    echo "Configuring Apache2 instead of Nginx..."
    
    # Create Apache site configuration
    sudo tee /etc/apache2/sites-available/rp-management.conf > /dev/null <<'APACHEEOF'
<VirtualHost *:80>
    ServerAdmin admin@localhost
    DocumentRoot /root/rp-management-system/public
    
    <Directory /root/rp-management-system/public>
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/rp-management-error.log
    CustomLog ${APACHE_LOG_DIR}/rp-management-access.log combined
</VirtualHost>
APACHEEOF
    
    # Enable site and modules
    sudo a2ensite rp-management >/dev/null 2>&1 || true
    sudo a2enmod rewrite >/dev/null 2>&1 || true
    
    # Test and reload Apache
    if sudo apache2ctl configtest >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Apache2 configuration valid${NC}"
        sudo systemctl reload apache2
        echo -e "${GREEN}✓ Apache2 reloaded${NC}"
    else
        echo -e "${RED}✗ Apache2 configuration has errors${NC}"
    fi
    
    WEB_SERVER="apache2"
else
    # Apache not running, configure Nginx
    echo "Configuring Nginx..."
    
    # Create Nginx site configuration
    NGINX_CONF="/etc/nginx/sites-available/rp-management"
    sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root $PROJECT_DIR/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    client_max_body_size 100M;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

    # Enable site
    if [ ! -L /etc/nginx/sites-enabled/rp-management ]; then
        sudo ln -s $NGINX_CONF /etc/nginx/sites-enabled/rp-management
    fi
    
    # Remove default site to avoid conflicts
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    if sudo nginx -t; then
        echo -e "${GREEN}✓ Nginx configuration valid${NC}"
        sudo systemctl restart nginx
        echo -e "${GREEN}✓ Nginx restarted${NC}"
    else
        echo -e "${RED}✗ Nginx configuration has errors${NC}"
    fi
    
    WEB_SERVER="nginx"
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}=========================================="
echo "  Deployment Completed Successfully!"
echo "==========================================${NC}"
echo ""
echo "Your application is now accessible at:"
echo -e "${BLUE}  http://$SERVER_IP${NC}"
echo ""
echo "Service Status:"
echo "  - Queue Worker: $(systemctl is-active rp-management-worker)"
echo "  - Scheduler: $(systemctl is-active rp-management-scheduler.timer)"
echo "  - Web Server: $(systemctl is-active ${WEB_SERVER:-nginx})"
echo ""
echo "Useful Commands:"
echo "  - View worker logs: sudo journalctl -u rp-management-worker -f"
echo "  - View scheduler logs: tail -f storage/logs/scheduler.log"
echo "  - Restart worker: sudo systemctl restart rp-management-worker"
echo "  - Check nginx: sudo nginx -t"
echo "  - Restart nginx: sudo systemctl restart nginx"
echo "  - Run artisan: php artisan <command>"
echo ""
echo "For updates, run:"
echo "  ./deploy-native.sh"
echo ""


