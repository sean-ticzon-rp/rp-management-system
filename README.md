# RP Management System

A comprehensive management system for resource planning, asset management, leave management, and project tracking.

## Table of Contents
- [Deployment Options](#deployment-options)
- [Quick Start - Native/LXC (Recommended for LXC containers)](#quick-start---nativelxc)
- [Quick Start - Docker](#quick-start---docker)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Features](#features)
- [Maintenance](#maintenance)

---

## Deployment Options

Choose the deployment method that fits your environment:

| Method | Best For | Prerequisites |
|--------|----------|---------------|
| **Native/LXC** | LXC containers, VPS, bare metal servers | PHP 8.2+, Composer, Node.js, Nginx, MySQL |
| **Docker** | Isolated deployment, multiple environments | Docker & Docker Compose |
| **Local Dev** | Development and testing | PHP 8.2+, Composer, Node.js |

---

## Quick Start - Native/LXC

**Perfect for LXC containers and VPS servers** - No Docker needed!

### Prerequisites
- Ubuntu/Debian LXC container or VPS
- PHP 8.2+ with extensions (mysql, mbstring, xml, bcmath, gd, zip)
- Composer
- Node.js 18+ & npm
- Nginx
- MySQL/MariaDB

### One-Command Deployment

```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Set APP_URL, DB credentials, etc.

# 2. Deploy
./deploy-native.sh
```

The script will:
- ✅ Check all prerequisites
- ✅ Install PHP and Node dependencies
- ✅ Build frontend assets
- ✅ Set up database and migrations
- ✅ Configure Nginx
- ✅ Create systemd services (queue worker & scheduler)
- ✅ Set proper permissions
- ✅ Optimize for production

**Access your application at:** `http://your-server-ip`

### Manual Installation (Native)

If you prefer step-by-step installation:

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Install Dependencies (Ubuntu/Debian)

```bash
# PHP 8.2 and extensions
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml \
    php8.2-bcmath php8.2-gd php8.2-zip php8.2-curl php8.2-cli

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Web server and database
sudo apt install -y nginx mysql-server
```

#### 2. Configure Application

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --omit=dev

# Build assets
npm run build

# Configure environment
cp .env.example .env
nano .env  # Edit configuration
php artisan key:generate

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Database
php artisan migrate --force
php artisan storage:link
```

#### 3. Configure Nginx

Create `/etc/nginx/sites-available/rp-management`:

```nginx
server {
    listen 80;
    server_name _;
    root /path/to/rp-management-system/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    index index.php;
    charset utf-8;
    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/rp-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Set Up Services

See service configuration in `deploy-native.sh` or run it to auto-configure.

</details>

### Verify Installation

```bash
./check-native.sh
```

---

## Quick Start - Docker

**Perfect for containerized deployments and development environments**

### Prerequisites
- Docker & Docker Compose installed
- Server with ports 80 and 3306 available
- At least 2GB RAM and 10GB disk space

### One-Command Deployment

```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Edit configuration

# 2. Deploy
./deploy.sh
```

**Critical settings for Docker deployment:**
```bash
APP_URL=http://your-server-ip-or-domain
APP_ENV=production
APP_DEBUG=false
DB_HOST=mysql              # Important: Use 'mysql' for Docker
DB_PASSWORD=your-secure-password
```

The script will:
- ✅ Build Docker containers
- ✅ Start all services (app + database)
- ✅ Generate application key
- ✅ Run database migrations
- ✅ Optionally seed initial data
- ✅ Set up storage links
- ✅ Optimize for production

**Access your application at:** `http://your-server-ip`

### Docker Commands

```bash
# View logs
docker compose logs -f app

# Stop/start
docker compose down
docker compose up -d

# Restart
docker compose restart

# Access shell
docker compose exec app bash

# Run artisan commands
docker compose exec app php artisan <command>
```

### Verify Docker Installation

```bash
./check-deployment.sh
```

---

## Local Development Setup

For local development without server deployment:

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL/PostgreSQL or SQLite

### Installation Steps

1. **Install dependencies**
```bash
composer install
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure database**
Edit `.env`:
```bash
DB_CONNECTION=sqlite
# OR for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=rp_management
# DB_USERNAME=root
# DB_PASSWORD=
```

4. **Run migrations and seeders**
```bash
php artisan migrate:fresh --seed
php artisan storage:link
php artisan leaves:initialize-balances
```

5. **Start development servers**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
php artisan serve
```

Or bind to all interfaces for network access:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

6. **Access application**
- Open `http://localhost:8000` in your browser

---

## Configuration

### Environment Variables

See [ENV_SERVER.md](ENV_SERVER.md) for detailed configuration guide.

**Essential variables:**
- `APP_URL`: Your server's public URL or IP
- `APP_ENV`: `production` for production, `local` for development
- `APP_DEBUG`: `false` for production, `true` for development
- `DB_HOST`: 
  - `mysql` for Docker deployment
  - `127.0.0.1` or `localhost` for native deployment
  - Remote host for external database
- `DB_*`: Database credentials
- `MAIL_*`: Email configuration

### Network Access

#### Native/LXC Deployment
Already configured to accept external connections via Nginx on port 80.

#### Docker Deployment
Configured to bind to all interfaces and accept external connections.

#### Local Development
To accept connections from other devices:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Set in `.env`:
```bash
VITE_HMR_HOST=your-server-ip  # For HMR on remote server
```

### Firewall Configuration

Allow external access:

**Ubuntu/Debian:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # If using HTTPS
```

**CentOS/RHEL:**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Features

### Asset Management
- Track company assets and assignments
- Asset history and audit trail
- Individual and bulk assignments

### Leave Management
- Multiple leave types support
- Automatic leave balance initialization for new users
- Leave request approval workflow
- Annual leave balance tracking

### Project Management
- Project tracking and task management
- Project assignments
- Timeline and progress tracking

### User Management
- Role-based access control
- Permission management
- User onboarding system

### Inventory Management
- Track inventory items
- Stock levels and categories

---

## Maintenance

### Leave Balance System
- **Automatic:** New users automatically get leave balances upon creation
- **Manual initialization:** 
  - Native: `php artisan leaves:initialize-balances`
  - Docker: `docker compose exec app php artisan leaves:initialize-balances`
- **Reset for new year:** 
  - Native: `php artisan leaves:reset-year 2026`
  - Docker: `docker compose exec app php artisan leaves:reset-year 2026`

### Service Management

#### Native/LXC
```bash
# View logs
sudo journalctl -u rp-management-worker -f
tail -f storage/logs/scheduler.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart rp-management-worker
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm

# Check status
sudo systemctl status rp-management-worker
sudo systemctl status rp-management-scheduler.timer
```

#### Docker
```bash
# View logs
docker compose logs -f app
docker compose logs -f mysql

# Restart services
docker compose restart
docker compose restart app

# Check status
docker compose ps
```

### Backup Database

#### Native
```bash
mysqldump -u username -p database_name > backup.sql
```

#### Docker
```bash
docker compose exec mysql mysqldump -u rp_user -p rp_management > backup.sql
```

### Restore Database

#### Native
```bash
mysql -u username -p database_name < backup.sql
```

#### Docker
```bash
docker compose exec -T mysql mysql -u rp_user -p rp_management < backup.sql
```

### Update Application

#### Native/LXC
```bash
git pull
./deploy-native.sh
```

#### Docker
```bash
git pull
docker compose down
docker compose build --no-cache
./deploy.sh
```

### Clear Caches

#### Native
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### Docker
```bash
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear
```

### View Logs

#### Native
```bash
# Application logs
tail -f storage/logs/laravel.log

# Worker logs
sudo journalctl -u rp-management-worker -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### Docker
```bash
# All logs
docker compose logs -f

# Application logs
docker compose logs -f app

# Database logs
docker compose logs -f mysql
```

---

## Troubleshooting

### Cannot connect to application from external network

**Native/LXC:**
- Check Nginx is running: `sudo systemctl status nginx`
- Check Nginx configuration: `sudo nginx -t`
- Verify `APP_URL` in `.env` is set correctly
- Check firewall: `sudo ufw status`

**Docker:**
- Check containers are running: `docker compose ps`
- Check firewall rules (ports 80, 443)
- Verify `APP_URL` in `.env`

### Database connection errors

**Native/LXC:**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env`
- Test connection: `php artisan migrate:status`

**Docker:**
- Check MySQL container: `docker compose ps`
- View MySQL logs: `docker compose logs mysql`
- Verify DB_HOST=mysql in `.env`

### Permission errors

**Native/LXC:**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

**Docker:**
```bash
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
docker compose exec app chmod -R 775 storage bootstrap/cache
```

### Application key not set

**Native:**
```bash
php artisan key:generate
```

**Docker:**
```bash
docker compose exec app php artisan key:generate
```

### 502 Bad Gateway (Native)

Check PHP-FPM is running:
```bash
sudo systemctl status php8.2-fpm
sudo systemctl restart php8.2-fpm
```

Check PHP-FPM socket path in Nginx config matches:
```bash
ls -la /var/run/php/
```

---

## SSL/HTTPS Setup (Production Recommended)

### Native/LXC with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Docker with Let's Encrypt

See README for detailed instructions on adding SSL to Docker deployment.

---

## Support

For detailed guides:
- **Native deployment:** See `deploy-native.sh` and `check-native.sh`
- **Docker deployment:** See `deploy.sh` and `check-deployment.sh`
- **Configuration:** See `ENV_SERVER.md`
- **Changes:** See `CHANGES.md` and `DEPLOYMENT_GUIDE.md`

---

## License

[Add your license information here]
