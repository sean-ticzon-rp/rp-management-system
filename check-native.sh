#!/bin/bash

# Native Deployment Health Check Script
# For LXC/VPS/Bare Metal deployments (non-Docker)

set -e

echo "============================================="
echo "  RP Management - Native Deployment Check"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ISSUES++))
    fi
}

# Check PHP
echo "1. Checking PHP..."
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r "echo PHP_VERSION;" | cut -d. -f1,2)
    check_status 0 "PHP $PHP_VERSION installed"
    
    # Check required extensions
    REQUIRED_EXTS="pdo_mysql mbstring xml bcmath gd zip"
    for ext in $REQUIRED_EXTS; do
        if php -m | grep -q "$ext"; then
            check_status 0 "PHP extension: $ext"
        else
            check_status 1 "PHP extension missing: $ext"
        fi
    done
else
    check_status 1 "PHP is not installed"
fi

# Check Composer
echo ""
echo "2. Checking Composer..."
if command -v composer &> /dev/null; then
    check_status 0 "Composer installed"
else
    check_status 1 "Composer is not installed"
fi

# Check Node.js
echo ""
echo "3. Checking Node.js..."
if command -v node &> /dev/null; then
    check_status 0 "Node.js $(node --version) installed"
else
    check_status 1 "Node.js is not installed"
fi

# Check environment
echo ""
echo "4. Checking environment configuration..."
if [ -f .env ]; then
    check_status 0 ".env file exists"
    
    if grep -q "APP_KEY=base64:" .env; then
        check_status 0 "APP_KEY is set"
    else
        check_status 1 "APP_KEY is not set"
    fi
    
    if grep -q "APP_URL=http://localhost" .env; then
        echo -e "${YELLOW}⚠${NC} APP_URL is still set to localhost"
        ((ISSUES++))
    else
        check_status 0 "APP_URL is configured"
    fi
else
    check_status 1 ".env file does not exist"
fi

# Check vendor directory
echo ""
echo "5. Checking dependencies..."
if [ -d vendor ]; then
    check_status 0 "PHP dependencies installed"
else
    check_status 1 "PHP dependencies not installed (run: composer install)"
fi

if [ -d node_modules ]; then
    check_status 0 "Node dependencies installed"
else
    check_status 1 "Node dependencies not installed (run: npm install)"
fi

# Check build
if [ -d public/build ]; then
    check_status 0 "Frontend assets built"
else
    check_status 1 "Frontend assets not built (run: npm run build)"
fi

# Check permissions
echo ""
echo "6. Checking file permissions..."
if [ -w storage ]; then
    check_status 0 "Storage directory is writable"
else
    check_status 1 "Storage directory is not writable"
fi

if [ -w bootstrap/cache ]; then
    check_status 0 "Bootstrap cache is writable"
else
    check_status 1 "Bootstrap cache is not writable"
fi

# Check services
echo ""
echo "7. Checking systemd services..."
if systemctl is-active --quiet rp-management-worker; then
    check_status 0 "Queue worker is running"
else
    check_status 1 "Queue worker is not running"
fi

if systemctl is-active --quiet rp-management-scheduler.timer; then
    check_status 0 "Scheduler timer is active"
else
    check_status 1 "Scheduler timer is not active"
fi

# Check Nginx
echo ""
echo "8. Checking Nginx..."
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        check_status 0 "Nginx is running"
        
        if [ -f /etc/nginx/sites-available/rp-management ]; then
            check_status 0 "Nginx site configuration exists"
        else
            check_status 1 "Nginx site configuration not found"
        fi
        
        if [ -L /etc/nginx/sites-enabled/rp-management ]; then
            check_status 0 "Nginx site is enabled"
        else
            check_status 1 "Nginx site is not enabled"
        fi
    else
        check_status 1 "Nginx is not running"
    fi
else
    check_status 1 "Nginx is not installed"
fi

# Check PHP-FPM
echo ""
echo "9. Checking PHP-FPM..."
if systemctl list-units --type=service | grep -q php.*fpm; then
    PHP_FPM_SERVICE=$(systemctl list-units --type=service | grep php.*fpm | awk '{print $1}' | head -n1)
    if systemctl is-active --quiet $PHP_FPM_SERVICE; then
        check_status 0 "PHP-FPM is running ($PHP_FPM_SERVICE)"
    else
        check_status 1 "PHP-FPM is not running"
    fi
else
    check_status 1 "PHP-FPM service not found"
fi

# Check database connectivity
echo ""
echo "10. Checking database..."
if php artisan migrate:status &> /dev/null; then
    check_status 0 "Database connection successful"
else
    check_status 1 "Cannot connect to database"
fi

# Check application accessibility
echo ""
echo "11. Checking application accessibility..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
    check_status 0 "Application responds on localhost"
else
    check_status 1 "Application is not accessible on localhost"
fi

# Get server IP
echo ""
echo "12. Network configuration..."
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ ! -z "$SERVER_IP" ]; then
    echo -e "${GREEN}✓${NC} Server IP: $SERVER_IP"
    echo "   External clients can connect to: http://$SERVER_IP"
else
    echo -e "${YELLOW}⚠${NC} Could not determine server IP"
fi

# Check port 80
if ss -tuln | grep -q ":80 "; then
    check_status 0 "Port 80 is in use"
else
    check_status 1 "Port 80 is not in use"
fi

# Summary
echo ""
echo "============================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your application is ready for external client access!"
    echo "Access URL: http://$SERVER_IP"
else
    echo -e "${RED}Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please address the issues above."
    echo "Run ./deploy-native.sh to fix common issues."
fi
echo "============================================="
echo ""

# Service status
echo "Service Status:"
echo "  - Queue Worker: $(systemctl is-active rp-management-worker 2>/dev/null || echo 'not configured')"
echo "  - Scheduler: $(systemctl is-active rp-management-scheduler.timer 2>/dev/null || echo 'not configured')"
echo "  - PHP-FPM: $(systemctl is-active php*fpm 2>/dev/null | head -n1 || echo 'not running')"
echo "  - Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'not running')"
echo ""

echo "Useful commands:"
echo "  - View worker logs: sudo journalctl -u rp-management-worker -f"
echo "  - View nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Restart services: sudo systemctl restart rp-management-worker nginx"
echo "  - Run artisan: php artisan <command>"
echo ""

exit $ISSUES



