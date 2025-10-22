// resources/js/Layouts/AuthenticatedLayout.jsx
import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
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
    ChevronRight,
    Laptop,
    ClipboardList,
    Calendar,
    UserCheck,
    CheckSquare,
    Layers,
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
    const [expandedSections, setExpandedSections] = useState({});
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    
    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    // Check if a section has any active items
    const sectionHasActiveItem = (items) => {
        return items.some(item => isActive(item.href));
    };

    // ✅ Build navigation based on user permissions
    const buildNavigation = () => {
        const nav = [];

        // ============================================
        // EVERYONE - Personal (Always Expanded, No Accordion)
        // ============================================
        nav.push({ 
            type: 'items', // Simple items, no accordion
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'My Leaves', href: '/my-leaves', icon: Calendar },
                { name: 'My Assets', href: '/employees/assets', icon: Laptop },
            ]
        });

        // ============================================
        // USER MANAGEMENT
        // ============================================
        if (auth.user?.can_manage_users) {
            // Full User Management for HR/Admin
            nav.push({
                type: 'accordion',
                name: 'User Management',
                icon: Users,
                items: [
                    { name: 'All Users', href: '/users', icon: Users },
                    { name: 'Pending Approvals', href: '/users/pending-approvals', icon: UserCheck, badge: 'new' },
                ]
            });
        } else if (auth.user?.can_approve_users) {
            // Limited view for PM/Lead/Senior - Only Pending Approvals
            nav.push({
                type: 'items',
                items: [
                    { name: 'Pending Approvals', href: '/users/pending-approvals', icon: UserCheck, badge: 'new' },
                ]
            });
        }

        // ============================================
        // LEAVE MANAGEMENT (Accordion - if can approve leaves)
        // ============================================
        if (auth.user?.can_approve_leaves) {
            const leaveItems = [];
            
            // ✅ Check if user is Senior/Lead/PM (show Pending Approvals)
            const isSeniorOrAbove = auth.user.roles?.some(r => 
                ['senior-engineer', 'lead-engineer', 'project-manager'].includes(r.slug)
            );
            
            // ✅ Check if user is HR/Admin (show All Requests)
            const isHROrAdmin = auth.user.roles?.some(r => 
                ['super-admin', 'admin', 'hr-manager'].includes(r.slug)
            );
            
            if (isSeniorOrAbove) {
                // Senior/Lead/PM see hierarchical Pending Approvals
                leaveItems.push({ 
                    name: 'Pending Approvals', 
                    href: '/leaves/pending-approvals', 
                    icon: CheckSquare, 
                    badge: 'pending' 
                });
            }
            
            if (isHROrAdmin) {
                // HR/Admin see All Requests + HR Pending (NO APPEALS)
                leaveItems.push({ 
                    name: 'All Requests', 
                    href: '/leaves', 
                    icon: ClipboardList 
                });
                leaveItems.push({ 
                    name: 'Pending HR Approval', 
                    href: '/leaves?status=pending_hr', 
                    icon: CheckSquare, 
                    badge: 'pending' 
                });
                // ❌ REMOVED: Appealed Requests
                leaveItems.push({ 
                    name: 'Leave Types', 
                    href: '/leave-types', 
                    icon: Layers 
                });
            }

            if (leaveItems.length > 0) {
                nav.push({
                    type: 'accordion',
                    name: 'Leave Management',
                    icon: Calendar,
                    items: leaveItems
                });
            }
        }

        // ============================================
        // INVENTORY MANAGEMENT (Accordion - if can manage inventory)
        // ============================================
        if (auth.user?.can_manage_inventory) {
            nav.push({
                type: 'accordion',
                name: 'Inventory',
                icon: Package,
                items: [
                    { name: 'Inventory Items', href: '/inventory', icon: Package },
                    { name: 'Individual Assets', href: '/individual-assets', icon: Laptop },
                ]
            });
        }

        // ============================================
        // PROJECT MANAGEMENT (Accordion - if can manage projects)
        // ============================================
        if (auth.user?.can_manage_projects) {
            nav.push({
                type: 'accordion',
                name: 'Projects',
                icon: FolderKanban,
                items: [
                    { name: 'All Projects', href: '/projects', icon: FolderKanban },
                    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
                    { name: 'Kanban Board', href: '/tasks/kanban', icon: Layers },
                ]
            });
        }

        // ============================================
        // SETTINGS (Always visible, simple item)
        // ============================================
        nav.push({
            type: 'items',
            items: [
                { name: 'Settings', href: '/settings', icon: Settings },
            ]
        });

        return nav;
    };

    const navigation = buildNavigation();

    // ✅ Better active check - exact match first, then prefix
    const isActive = (href) => {
        const cleanHref = href.split('?')[0];
        const cleanUrl = currentUrl.split('?')[0];
        
        // Exact match
        if (cleanUrl === cleanHref) return true;
        
        // For /users, only match /users/* not /users itself from other routes
        if (cleanHref === '/users' && cleanUrl.startsWith('/users/')) return true;
        if (cleanHref === '/leaves' && cleanUrl.startsWith('/leaves/')) return true;
        if (cleanHref === '/inventory' && cleanUrl.startsWith('/inventory/')) return true;
        if (cleanHref === '/individual-assets' && cleanUrl.startsWith('/individual-assets/')) return true;
        if (cleanHref === '/projects' && cleanUrl.startsWith('/projects/')) return true;
        if (cleanHref === '/tasks' && cleanUrl.startsWith('/tasks/')) return true;
        
        return false;
    };

    // Auto-expand sections with active items
    useState(() => {
        const initialExpanded = {};
        navigation.forEach((section, idx) => {
            if (section.type === 'accordion') {
                initialExpanded[section.name] = sectionHasActiveItem(section.items);
            }
        });
        setExpandedSections(initialExpanded);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <Link href="/dashboard" className="flex items-center ml-4 lg:ml-0 group">
                                <div className="bg-gray-900 px-4 py-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                    <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
                                </div>
                            </Link>
                            <div className="hidden md:ml-8 md:flex md:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                        <span className="text-sm font-medium text-white">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-medium text-gray-900">{auth.user.name}</div>
                                        <div className="text-xs text-gray-500">{auth.user.email}</div>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('settings.index')} className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button" className="w-full cursor-pointer text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar with Accordions */}
            <aside
                className={`fixed left-0 z-20 bg-white border-r border-gray-200 transform transition-all duration-300
                    ${sidebarMinimized ? 'w-20' : 'w-64'}
                    lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ top: '64px', height: 'calc(100vh - 64px)' }}
            >
                <div className="h-full flex flex-col">
                    {/* Minimize Toggle */}
                    <div className="hidden lg:flex items-center justify-end px-4 py-2 border-b">
                        <button
                            onClick={() => setSidebarMinimized(!sidebarMinimized)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            {sidebarMinimized ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        {navigation.map((section, idx) => (
                            <div key={idx} className="mb-2">
                                {section.type === 'items' ? (
                                    // Simple items (no accordion)
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group relative
                                                        ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                                                        ${sidebarMinimized ? 'justify-center' : ''}`}
                                                >
                                                    <Icon className={`h-5 w-5 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                                                    {!sidebarMinimized && (
                                                        <span className="ml-3 flex-1">{item.name}</span>
                                                    )}
                                                    {item.badge && !sidebarMinimized && (
                                                        <Badge className={`text-xs ml-2 ${
                                                            item.badge === 'new' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            item.badge === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                            'bg-blue-100 text-blue-700'
                                                        } border`}>
                                                            {item.badge === 'new' ? '!' :
                                                             item.badge === 'pending' ? '•' : item.badge}
                                                        </Badge>
                                                    )}
                                                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r"></div>}
                                                    {sidebarMinimized && (
                                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                                            {item.name}
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Accordion sections
                                    <div>
                                        {/* Accordion Header */}
                                        <button
                                            onClick={() => toggleSection(section.name)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                                                ${sectionHasActiveItem(section.items) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                                                ${sidebarMinimized ? 'justify-center' : ''}`}
                                        >
                                            <div className="flex items-center flex-1">
                                                <section.icon className={`h-5 w-5 ${sectionHasActiveItem(section.items) ? 'text-blue-700' : 'text-gray-400'}`} />
                                                {!sidebarMinimized && <span className="ml-3">{section.name}</span>}
                                            </div>
                                            {!sidebarMinimized && (
                                                <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections[section.name] ? 'rotate-90' : ''}`} />
                                            )}
                                        </button>

                                        {/* Accordion Content */}
                                        {!sidebarMinimized && expandedSections[section.name] && (
                                            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                                {section.items.map((item) => {
                                                    const Icon = item.icon;
                                                    const active = isActive(item.href);
                                                    return (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                                                                ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                        >
                                                            <Icon className={`h-4 w-4 mr-2 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                                                            <span className="flex-1">{item.name}</span>
                                                            {item.badge && (
                                                                <Badge className={`text-xs ml-2 ${
                                                                    item.badge === 'new' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                    item.badge === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                    'bg-blue-100 text-blue-700'
                                                                } border`}>
                                                                    {item.badge === 'new' ? '!' :
                                                                     item.badge === 'pending' ? '•' : item.badge}
                                                                </Badge>
                                                            )}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* User Info Footer */}
                    {!sidebarMinimized && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0">
                                    <span className="text-sm font-medium text-white">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{auth.user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{auth.user.position || auth.user.email}</p>
                                </div>
                            </div>
                            {/* Permission Badges */}
                            {(auth.user.can_approve_users || auth.user.can_approve_leaves) && (
                                <div className="flex flex-wrap gap-1">
                                    {auth.user.can_approve_users && (
                                        <Badge className="bg-green-100 text-green-700 text-xs border-green-200 border">
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            Approver
                                        </Badge>
                                    )}
                                    {auth.user.can_approve_leaves && (
                                        <Badge className="bg-blue-100 text-blue-700 text-xs border-blue-200 border">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Manager
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'} pt-16`}>
                {header && (
                    <header className="bg-white border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8 py-6">{header}</div>
                    </header>
                )}
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}