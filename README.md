# RP Management System

Employee & Asset Management System built with Laravel 11, React, and Inertia.js

---

## Prerequisites (macOS)

Before you begin, install these tools:

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install PHP 8.2+
```bash
brew install php@8.2
brew link php@8.2
php --version  # Should show 8.2.x
```

### 3. Install Composer
```bash
brew install composer
composer --version
```

### 4. Install Node.js & npm
```bash
brew install node
node --version  # Should show v18+ or v20+
npm --version
```

### 5. Install Database

**Option A: MySQL (Traditional)**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Option B: SQLite (Recommended for quick setup)**
```bash
# Already included with macOS/PHP!
# Just create the database file during setup
```

---

## First-Time Setup

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd rp-management-system
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### Step 3: Configure Environment

**For SQLite (Easiest):**
```bash
# Copy environment file
cp .env.example .env

# Create SQLite database
touch database/database.sqlite

# Edit .env file and set:
# DB_CONNECTION=sqlite
# Comment out or remove these lines:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=
```

**For MySQL:**
```bash
# Copy environment file
cp .env.example .env

# Create database
mysql -u root -p
CREATE DATABASE rp_management;
EXIT;

# Edit .env file:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rp_management
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 4: Generate Application Key
```bash
php artisan key:generate
```

### Step 5: Run Migrations & Seed Database
```bash
# Fresh install with sample data
php artisan migrate:fresh --seed
```

**This creates:**
- Super Admin account
- Test users for all roles (Admin, HR, Lead, Senior Engineers, etc.)
- Sample inventory items, projects, and tasks
- Leave types (Vacation, Sick, Emergency, etc.)
- Leave balances for all users

### Step 6: Create Storage Link
```bash
php artisan storage:link
```

### Step 7: Build Frontend Assets
```bash
npm run build
```

---

## Daily Development

**You need 2 terminal windows:**

### Terminal 1 - Backend Server
```bash
php artisan serve
```
Access at: **http://localhost:8000**

### Terminal 2 - Frontend Hot Reload
```bash
npm run dev
```
This watches for file changes and auto-reloads the browser.

---

## Default Login Credentials

After running migrations with `--seed`, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | password |
| Admin | admin1@example.com | password |
| HR Manager | hr1@example.com | password |
| Project Manager | pm1@example.com | password |
| Lead Engineer | lead1@example.com | password |
| Senior Engineer | senior1@example.com | password |

**All test accounts use the password:** `password`

---

## Key Features

- ✅ **User Management** - Role-based permissions, approval workflows
- ✅ **Leave Management** - Request, approve, track employee leave with cascading approvals
- ✅ **Asset Tracking** - Individual asset assignments with barcodes
- ✅ **Inventory** - Manage consumables and trackable assets
- ✅ **Projects & Tasks** - Kanban board, task assignments
- ✅ **Onboarding System** - Guest forms for new employee data collection

---

## Leave Balance System

### Automatic Initialization
- New users automatically get leave balances when created
- Leave balances initialize via **UserObserver** after user creation

### Manual Commands (if needed)
```bash
# Initialize balances for all active users (one-time)
php artisan leaves:initialize-balances

# Initialize for a specific user
php artisan leaves:initialize-balances --user=1

# Initialize for a specific year
php artisan leaves:initialize-balances --year=2025

# Reset balances for new year (testing)
php artisan leaves:reset-year 2026
```

### Scheduled Tasks
The system automatically resets leave balances every January 1st at midnight via cron:
```bash
# This is handled by Laravel's scheduler
php artisan schedule:work  # For development testing
```

---

## Useful Commands

### Database
```bash
# Reset database with fresh data
php artisan migrate:fresh --seed

# Create migration
php artisan make:migration create_table_name

# Run specific seeder
php artisan db:seed --class=UserSeeder
```

### Cache & Optimization
```bash
# Clear all caches
php artisan optimize:clear

# Cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Development
```bash
# View all routes
php artisan route:list

# Debug managers/roles
php artisan debug:managers

# Access Tinker (Laravel REPL)
php artisan tinker

# Run tests
php artisan test
```

### Frontend
```bash
# Rebuild assets
npm run build

# Development with hot reload
npm run dev

# Lint and format code
npm run format
npm run lint
```

---

## Troubleshooting

### "Class 'PDO' not found"
Enable PHP extensions:
```bash
# Check php.ini location
php --ini

# Edit php.ini and uncomment:
# extension=pdo_mysql
# extension=pdo_sqlite
```

### Storage/Permission Errors
```bash
chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:_www storage bootstrap/cache
```

### "Vite manifest not found"
```bash
npm run build
```

### Frontend not updating
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection errors (MySQL)
```bash
# Check if MySQL is running
brew services list

# Start MySQL
brew services start mysql
```

---

## Production Deployment

### 1. Environment Setup
```bash
cp .env.example .env
# Set APP_ENV=production
# Set APP_DEBUG=false
# Set proper APP_URL
```

### 2. Optimize for Production
```bash
composer install --optimize-autoloader --no-dev
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Set Up Cron Job
Add to crontab (`crontab -e`):
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Set Up Queue Worker (Optional)
```bash
php artisan queue:work --daemon
```

---

## Project Structure

```
rp-management-system/
├── app/
│   ├── Console/Commands/       # Custom artisan commands
│   ├── Http/Controllers/       # Request handlers
│   ├── Models/                 # Database models
│   ├── Services/               # Business logic
│   └── Observers/              # Model event listeners
├── database/
│   ├── migrations/             # Database schema
│   ├── seeders/                # Sample data generators
│   └── factories/              # Test data factories
├── resources/
│   ├── js/                     # React frontend (Inertia.js)
│   │   ├── components/         # Reusable UI components
│   │   ├── layouts/            # Page layouts
│   │   └── pages/              # Application pages
│   └── views/                  # Blade templates
├── routes/
│   ├── web.php                 # Web routes
│   └── auth.php                # Authentication routes
└── public/                     # Publicly accessible files
```

---

## Tech Stack

- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** React 18 + Inertia.js + TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Database:** MySQL / SQLite
- **Icons:** Lucide React

---

## Getting Help

- **Laravel Docs:** [laravel.com/docs](https://laravel.com/docs/11.x)
- **Inertia.js Docs:** [inertiajs.com](https://inertiajs.com)
- **React Docs:** [react.dev](https://react.dev)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## License

Proprietary - Rocket Partners Internal Use Only

---

**Happy Coding! 🚀**