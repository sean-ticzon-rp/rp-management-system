# RP Management System

## Local Development URLs

**Using Laravel Herd or Valet:**
- http://rp-management-system.test/login

**Using `php artisan serve`:**
- http://127.0.0.1:8000/login

## Prerequisites
* PHP 8.2+
* Composer
* Node.js & npm
* MySQL/PostgreSQL

## Installation

1. **Clone repo and install dependencies**
   ```bash
   composer install
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure database**

   Install and start MySQL:
   ```bash
   brew install mysql
   brew services start mysql
   ```

   Create database:
   ```bash
   mysql -u root -e "CREATE DATABASE rp_management_system;"
   ```

   Update `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_DATABASE=rp_management_system
   ```

4. **Run migrations and seed data**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Create storage link**
   ```bash
   php artisan storage:link
   ```

6. **Initialize leave balances (one-time)**
   ```bash
   php artisan leaves:initialize-balances
   ```

## Daily Development

**Terminal 1:** `npm run dev` (Frontend)  
**Terminal 2:** `php artisan serve` (Backend - if not using Herd/Valet)

## Test Accounts

After running `php artisan migrate:fresh --seed`, check the terminal output for the complete user summary with all test account emails and roles. All passwords are: `password`

## Leave Balance System

* **Automatic:** New users automatically get leave balances
* **Manual (one-time):** Run `php artisan leaves:initialize-balances` after initial setup
* **Testing reset:** `php artisan leaves:reset-year 2026`

## Production Deployment

Set up cron job:
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

## Common Issues

**"vendor/autoload.php not found"**  
Run `composer install`

**"No application encryption key"**  
Run `php artisan key:generate`

**"Connection refused" (MySQL)**  
Start MySQL: `brew services start mysql`
