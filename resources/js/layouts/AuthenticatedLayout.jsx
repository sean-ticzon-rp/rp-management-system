// resources/js/Layouts/AuthenticatedLayout.jsx
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    FolderKanban, 
    Settings, 
    Bell, 
    Search,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Laptop,
    ClipboardList
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

export default function AuthenticatedLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMinimized, setSidebarMinimized] = useState(false);
    const { auth } = usePage().props;
    const currentUrl = usePage().url;

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Assets', href: '/assets', icon: Laptop },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Tasks', href: '/tasks', icon: ClipboardList },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href) => {
        return currentUrl === href || (currentUrl && currentUrl.startsWith(href + '/'));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left side */}
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>

                            {/* Logo */}
                            <Link href="/dashboard" className="flex items-center ml-4 lg:ml-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                    <LayoutDashboard className="w-6 h-6 text-white" />
                                </div>
                                <span className="ml-3 text-xl font-bold text-gray-900">
                                    Your Company
                                </span>
                            </Link>

                            {/* Search Bar - Desktop */}
                            <div className="hidden md:ml-8 md:flex md:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                            <span className="text-sm font-medium text-white">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="text-sm font-medium text-gray-900">
                                                {auth.user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {auth.user.email}
                                            </div>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')} className="flex items-center cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button" className="flex items-center w-full cursor-pointer text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log Out</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Container */}
            <div className="pt-16 flex">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed left-0 z-20
                        ${sidebarMinimized ? 'w-20' : 'w-64'} 
                        bg-white border-r border-gray-200
                        transform transition-all duration-300 ease-in-out
                        lg:translate-x-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{ top: '64px', height: 'calc(100vh - 64px)' }}
                >
                    <div className="h-full flex flex-col overflow-hidden">
                        {/* Minimize Button - Desktop Only */}
                        <div className="hidden lg:flex items-center justify-end px-4 py-2 border-b border-gray-200">
                            <button
                                onClick={() => setSidebarMinimized(!sidebarMinimized)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {sidebarMinimized ? (
                                    <Menu className="h-5 w-5" />
                                ) : (
                                    <X className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            flex items-center px-4 py-3 text-sm font-medium rounded-lg
                                            transition-all duration-200 group relative
                                            ${active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                            ${sidebarMinimized ? 'justify-center' : ''}
                                        `}
                                        title={sidebarMinimized ? item.name : ''}
                                    >
                                        <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                                        {!sidebarMinimized && (
                                            <span className="ml-3">{item.name}</span>
                                        )}
                                        {active && !sidebarMinimized && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r"></div>
                                        )}
                                        
                                        {/* Tooltip for minimized state */}
                                        {sidebarMinimized && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    {/* Page Header */}
                    {header && (
                        <header className="bg-white border-b border-gray-200 sticky top-16 z-10">
                            <div className="px-4 sm:px-6 lg:px-8 py-6">
                                {header}
                            </div>
                        </header>
                    )}

                    {/* Page Content */}
                    <div className="px-4 sm:px-6 lg:px-8 py-8 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}