// resources/js/Pages/Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
    Users, 
    Package, 
    FolderKanban, 
    AlertTriangle,
    TrendingUp,
    Plus,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function Dashboard({ auth, stats, lowStockItems, recentTasks, projectsByStatus, inventoryByCategory }) {
    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'bg-blue-500',
            href: '/users'
        },
        {
            title: 'Inventory Items',
            value: stats.total_inventory,
            icon: Package,
            color: 'bg-green-500',
            href: '/inventory'
        },
        {
            title: 'Active Projects',
            value: `${stats.active_projects}/${stats.total_projects}`,
            icon: FolderKanban,
            color: 'bg-purple-500',
            href: '/projects'
        },
        {
            title: 'Low Stock Alerts',
            value: stats.low_stock_items,
            icon: AlertTriangle,
            color: 'bg-red-500',
            href: '/inventory?filter=low-stock'
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            'todo': 'bg-gray-100 text-gray-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'review': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'planning': 'bg-purple-100 text-purple-800',
            'on_hold': 'bg-orange-100 text-orange-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'text-gray-600',
            'medium': 'text-yellow-600',
            'high': 'text-orange-600',
            'urgent': 'text-red-600',
        };
        return colors[priority] || 'text-gray-600';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-600 mt-1">Welcome back, {auth.user.name}!</p>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href="/inventory/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Inventory
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/projects/create">
                                <Plus className="h-4 w-4 mr-2" />
                                New Project
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.title}
                                href={stat.href}
                                className={`block animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                            >
                                <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '#') }}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                            </div>
                                            <div className={`${stat.color} p-3 rounded-lg`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Status */}
                    <Card className="animate-fade-in animation-delay-500">
                        <CardHeader>
                            <CardTitle>Project Status</CardTitle>
                            <CardDescription>Overview of all projects by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {projectsByStatus.map((project) => (
                                    <div key={project.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium capitalize">{project.status.replace('_', ' ')}</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{project.count}</span>
                                    </div>
                                ))}
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4">
                                <Link href="/projects">
                                    View All Projects
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Inventory by Category */}
                    <Card className="animate-fade-in animation-delay-600">
                        <CardHeader>
                            <CardTitle>Inventory Categories</CardTitle>
                            <CardDescription>Items grouped by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {inventoryByCategory.map((category) => (
                                    <div key={category.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                                            <span className="text-sm font-medium">{category.name}</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                                    </div>
                                ))}
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4">
                                <Link href="/inventory">
                                    View Inventory
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Alerts & Recent Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Low Stock Alerts */}
                    <Card className="animate-fade-in animation-delay-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Low Stock Alerts
                                    </CardTitle>
                                    <CardDescription>Items that need restocking</CardDescription>
                                </div>
                                <span className="text-2xl font-bold text-red-500">{stats.low_stock_items}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStockItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-600">{item.category?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-red-600">
                                                    {item.quantity} / {item.min_quantity}
                                                </p>
                                                <p className="text-xs text-gray-500">{item.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/inventory?filter=low-stock">
                                            View All Alerts
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                    <p>All items are well stocked!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Tasks */}
                    <Card className="animate-fade-in animation-delay-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Tasks</CardTitle>
                                    <CardDescription>Latest task activity</CardDescription>
                                </div>
                                <span className="text-2xl font-bold text-blue-500">{stats.pending_tasks}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTasks.map((task) => (
                                        <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="font-medium text-gray-900">{task.title}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FolderKanban className="h-4 w-4" />
                                                    {task.project?.name}
                                                </span>
                                                {task.assignee && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {task.assignee.name}
                                                    </span>
                                                )}
                                                <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                                    <AlertCircle className="h-4 w-4" />
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/tasks">
                                            View All Tasks
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-2" />
                                    <p>No recent tasks</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}