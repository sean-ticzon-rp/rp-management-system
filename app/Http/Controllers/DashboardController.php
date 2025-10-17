<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Task;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics
        $stats = [
            'total_users' => User::count(),
            'total_inventory' => InventoryItem::count(),
            'total_projects' => Project::count(),
            'active_projects' => Project::where('status', 'in_progress')->count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'pending_tasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
        ];

        // Get low stock items
        $lowStockItems = InventoryItem::with('category')
            ->lowStock()
            ->orderBy('quantity', 'asc')
            ->limit(5)
            ->get();

        // Get recent tasks
        $recentTasks = Task::with(['project', 'assignee'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get project status breakdown
        $projectsByStatus = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        // Get inventory by category
        $inventoryByCategory = InventoryItem::with('category')
            ->selectRaw('category_id, count(*) as count')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'count' => $item->count,
                    'color' => $item->category->color ?? '#6B7280',
                ];
            });

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'lowStockItems' => $lowStockItems,
            'recentTasks' => $recentTasks,
            'projectsByStatus' => $projectsByStatus,
            'inventoryByCategory' => $inventoryByCategory,
        ]);
    }
}