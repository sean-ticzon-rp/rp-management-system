#!/bin/bash

# Server Deployment Health Check Script
# Verifies that the RP Management System is properly configured for external access

set -e

echo "========================================="
echo "  RP Management System - Deployment Check"
echo "========================================="
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

# Check if Docker is running
echo "1. Checking Docker..."
if command -v docker &> /dev/null && docker ps &> /dev/null; then
    check_status 0 "Docker is running"
else
    check_status 1 "Docker is not running or not installed"
fi

# Check if docker-compose is available
echo ""
echo "2. Checking Docker Compose..."
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    check_status 0 "Docker Compose v2 is available"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    check_status 0 "Docker Compose v1 is available"
else
    check_status 1 "Docker Compose is not installed"
    exit 1
fi

# Check if .env exists
echo ""
echo "3. Checking environment configuration..."
if [ -f .env ]; then
    check_status 0 ".env file exists"
    
    # Check critical env variables
    if grep -q "APP_KEY=base64:" .env; then
        check_status 0 "APP_KEY is set"
    else
        check_status 1 "APP_KEY is not set (run: php artisan key:generate)"
    fi
    
    if grep -q "APP_URL=http://localhost" .env; then
        echo -e "${YELLOW}⚠${NC} APP_URL is still set to localhost (update for external access)"
        ((ISSUES++))
    else
        check_status 0 "APP_URL is configured"
    fi
    
    if grep -q "APP_ENV=production" .env; then
        check_status 0 "APP_ENV is set to production"
    else
        echo -e "${YELLOW}⚠${NC} APP_ENV is not set to production"
    fi
    
    if grep -q "APP_DEBUG=false" .env; then
        check_status 0 "APP_DEBUG is set to false"
    else
        echo -e "${YELLOW}⚠${NC} APP_DEBUG should be false for production"
    fi
else
    check_status 1 ".env file does not exist (copy from .env.example)"
fi

# Check if containers are running
echo ""
echo "4. Checking Docker containers..."
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    check_status 0 "Docker containers are running"
    
    # Check individual services
    if $DOCKER_COMPOSE ps | grep "rp_management_system_app" | grep -q "Up"; then
        check_status 0 "Application container is running"
    else
        check_status 1 "Application container is not running"
    fi
    
    if $DOCKER_COMPOSE ps | grep "rp_management_system_db" | grep -q "Up"; then
        check_status 0 "Database container is running"
    else
        check_status 1 "Database container is not running"
    fi
else
    check_status 1 "Docker containers are not running (run: ./deploy.sh)"
fi

# Check if application is accessible
echo ""
echo "5. Checking application accessibility..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
    check_status 0 "Application responds on localhost"
else
    check_status 1 "Application is not accessible on localhost"
fi

# Check storage permissions
echo ""
echo "6. Checking file permissions..."
if [ -d storage ] && [ -w storage ]; then
    check_status 0 "Storage directory is writable"
else
    check_status 1 "Storage directory is not writable"
fi

# Get server IP
echo ""
echo "7. Network configuration..."
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ ! -z "$SERVER_IP" ]; then
    echo -e "${GREEN}✓${NC} Server IP: $SERVER_IP"
    echo "   External clients can connect to: http://$SERVER_IP"
else
    echo -e "${YELLOW}⚠${NC} Could not determine server IP"
fi

# Check ports
echo ""
echo "8. Checking port availability..."
if ss -tuln | grep -q ":80 "; then
    check_status 0 "Port 80 is in use (application should be listening)"
else
    check_status 1 "Port 80 is not in use (application may not be running)"
fi

# Check firewall (if ufw is installed)
echo ""
echo "9. Checking firewall..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "80.*ALLOW"; then
        check_status 0 "Firewall allows port 80"
    else
        echo -e "${YELLOW}⚠${NC} Firewall may be blocking port 80 (run: sudo ufw allow 80/tcp)"
        ((ISSUES++))
    fi
elif command -v firewall-cmd &> /dev/null; then
    if sudo firewall-cmd --list-services | grep -q "http"; then
        check_status 0 "Firewall allows HTTP"
    else
        echo -e "${YELLOW}⚠${NC} Firewall may be blocking HTTP (run: sudo firewall-cmd --add-service=http)"
        ((ISSUES++))
    fi
else
    echo -e "${YELLOW}⚠${NC} No firewall detected (ufw/firewalld)"
fi

# Summary
echo ""
echo "========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your application is ready for external client access!"
    echo "Access URL: http://$SERVER_IP"
else
    echo -e "${RED}Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please address the issues above before deployment."
    echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
fi
echo "========================================="
echo ""

# Useful commands
echo "Useful commands:"
echo "  - View logs: $DOCKER_COMPOSE logs -f app"
echo "  - Restart: $DOCKER_COMPOSE restart"
echo "  - Stop: $DOCKER_COMPOSE down"
echo "  - Shell access: $DOCKER_COMPOSE exec app bash"
echo ""

exit $ISSUES

