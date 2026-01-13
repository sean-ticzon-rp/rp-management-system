#!/bin/bash

# RP Management System Deployment Script
# This script handles first-time setup and updates

set -e

echo "==================================="
echo "RP Management System - Deployment"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please update it with your configuration.${NC}"
    echo -e "${YELLOW}Important: Set your APP_URL, DB credentials, and APP_KEY${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo ""
echo "Step 1: Building Docker containers..."
$DOCKER_COMPOSE build

echo ""
echo "Step 2: Starting containers..."
$DOCKER_COMPOSE up -d

echo ""
echo "Waiting for database to be ready..."
sleep 10

echo ""
echo "Step 3: Installing dependencies and setting up application..."

# Generate app key if not set
if grep -q "APP_KEY=$" .env || ! grep -q "APP_KEY=" .env; then
    echo "Generating application key..."
    $DOCKER_COMPOSE exec app php artisan key:generate
fi

# Run migrations
echo "Running database migrations..."
$DOCKER_COMPOSE exec app php artisan migrate --force

# Run seeders (only on first install)
read -p "Do you want to seed the database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    $DOCKER_COMPOSE exec app php artisan db:seed --force
fi

# Create storage link
echo "Creating storage link..."
$DOCKER_COMPOSE exec app php artisan storage:link || true

# Clear caches
echo "Clearing caches..."
$DOCKER_COMPOSE exec app php artisan config:clear
$DOCKER_COMPOSE exec app php artisan cache:clear
$DOCKER_COMPOSE exec app php artisan view:clear
$DOCKER_COMPOSE exec app php artisan route:clear

# Optimize for production
echo "Optimizing application..."
$DOCKER_COMPOSE exec app php artisan config:cache
$DOCKER_COMPOSE exec app php artisan route:cache
$DOCKER_COMPOSE exec app php artisan view:cache

# Initialize leave balances if needed
read -p "Initialize leave balances for all users? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Initializing leave balances..."
    $DOCKER_COMPOSE exec app php artisan leaves:initialize-balances
fi

echo ""
echo -e "${GREEN}==================================="
echo "Deployment completed successfully!"
echo "===================================${NC}"
echo ""
echo "Application is running at: ${APP_URL:-http://localhost}"
echo ""
echo "Useful commands:"
echo "  - View logs: $DOCKER_COMPOSE logs -f app"
echo "  - Stop containers: $DOCKER_COMPOSE down"
echo "  - Restart containers: $DOCKER_COMPOSE restart"
echo "  - Access app shell: $DOCKER_COMPOSE exec app bash"
echo ""

