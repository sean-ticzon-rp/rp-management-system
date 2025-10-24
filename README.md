# rp-management-system

## Development Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm
- MySQL/PostgreSQL

### Installation
1. Clone repo and install dependencies
2. Copy `.env.example` to `.env`
3. Configure database
4. Run migrations: `php artisan migrate:fresh --seed`
5. Create storage link: `php artisan storage:link`

### Daily Development
**Terminal 1:** `npm run dev` (Frontend)
**Terminal 2:** `php artisan serve` (Backend - if not using Herd/Valet)

### Leave Balance System
- **Automatic:** New users automatically get leave balances
- **Manual (one-time):** Run `php artisan leaves:initialize-balances` after initial setup
- **Testing reset:** `php artisan leaves:reset-year 2026`

### Production Deployment
Set up cron job:
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```