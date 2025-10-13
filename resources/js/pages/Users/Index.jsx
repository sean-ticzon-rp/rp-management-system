// resources/js/Pages/Users/Index.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import {
    Users as UsersIcon,
    Plus,
    Upload,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Shield,
    Laptop,
    LayoutGrid,
    List,
    Phone,
    Briefcase,
    MoreHorizontal,
} from 'lucide-react';

export default function Index({ auth, users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (role && role !== 'all') params.role = role;
        
        router.get(route('users.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setRole('all');
        router.get(route('users.index'));
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('users.destroy', userToDelete.id));
        }
    };

    const hasFilters = search || role !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UsersIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                            <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex border rounded-lg p-1 bg-white">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                            >
                                <List className="h-4 w-4 mr-2" />
                                Table
                            </Button>
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('card')}
                                className={viewMode === 'card' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route('users.import')}>
                                <Upload className="h-4 w-4 mr-2" />
                                Import Users
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={route('users.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Users" />

            <div className="space-y-6">
                {/* Filters */}
                <Card className="shadow-sm animate-fade-in">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-10">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    {hasFilters && (
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-10">
                                            <X className="h-4 w-4 mr-2" />
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{users.total}</span> {users.total === 1 ? 'user' : 'users'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <Card className="shadow-sm animate-fade-in animation-delay-200">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2">
                                        <TableHead className="font-semibold text-gray-700 h-12">User</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Email</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Roles</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12 text-center">Assets</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Joined</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user, index) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50 border-b">
                                                <TableCell className="py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        {user.profile_picture ? (
                                                            <img
                                                                src={`/storage/${user.profile_picture}`}
                                                                alt={user.name}
                                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0">
                                                                <span className="text-sm font-medium text-white">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                                            {user.position && (
                                                                <p className="text-xs text-gray-500 truncate">{user.position}</p>
                                                            )}
                                                            {user.id === auth.user.id && (
                                                                <Badge className="bg-blue-100 text-blue-700 text-xs mt-0.5">You</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <span className="text-sm text-gray-600 truncate">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((role) => (
                                                                <Badge key={role.id} className="bg-purple-100 text-purple-700 border-purple-200 border text-xs whitespace-nowrap">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    {role.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">No roles</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Laptop className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {user.current_assets?.length || 0}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="align-middle text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('users.show', user.id)} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('users.edit', user.id)} className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit User
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {user.id !== auth.user.id && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(user)}
                                                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete User
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                        <UsersIcon className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-900 font-medium text-lg mb-1">No users found</p>
                                                    <p className="text-gray-500 text-sm mb-4">Add your first user to get started</p>
                                                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <Link href={route('users.create')}>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add User
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {users.data.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{users.from}</span> to{' '}
                                    <span className="font-medium">{users.to}</span> of{' '}
                                    <span className="font-medium">{users.total}</span> results
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(users.prev_page_url)}
                                        disabled={!users.prev_page_url}
                                        className="h-9"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(users.next_page_url)}
                                        disabled={!users.next_page_url}
                                        className="h-9"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    /* Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-200">
                        {users.data.length > 0 ? (
                            users.data.map((user, index) => (
                                <Card key={user.id} className={`hover:shadow-lg transition-shadow animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                    <CardContent className="pt-6">
                                        {/* User Avatar & Name */}
                                        <div className="flex items-center gap-4 mb-4">
                                            {user.profile_picture ? (
                                                <img
                                                    src={`/storage/${user.profile_picture}`}
                                                    alt={user.name}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                                    <span className="text-2xl font-medium text-white">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
                                                {user.position && (
                                                    <p className="text-sm text-gray-600">{user.position}</p>
                                                )}
                                                {user.id === auth.user.id && (
                                                    <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">You</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 mb-4 pb-4 border-b">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            {user.phone_number && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{user.phone_number}</span>
                                                </div>
                                            )}
                                            {user.department && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Briefcase className="h-4 w-4" />
                                                    <span>{user.department}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Roles */}
                                        {user.roles && user.roles.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-600 mb-2">Roles</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role.id} className="bg-purple-100 text-purple-700 border-purple-200 border text-xs">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Assets Count */}
                                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Laptop className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm text-gray-700">Assets</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {user.current_assets?.length || 0}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <Link href={route('users.show', user.id)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild className="flex-1">
                                                <Link href={route('users.edit', user.id)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            {user.id !== auth.user.id && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleDelete(user)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="text-center py-16">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                <UsersIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium text-lg mb-1">No users found</p>
                                            <p className="text-gray-500 text-sm mb-4">Add your first user to get started</p>
                                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                                <Link href={route('users.create')}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add User
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Pagination for Card View */}
                        {users.data.length > 0 && viewMode === 'card' && (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{users.from}</span> to{' '}
                                            <span className="font-medium">{users.to}</span> of{' '}
                                            <span className="font-medium">{users.total}</span> results
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(users.prev_page_url)}
                                                disabled={!users.prev_page_url}
                                                className="h-9"
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(users.next_page_url)}
                                                disabled={!users.next_page_url}
                                                className="h-9"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                description="This will permanently delete this user and remove all their data. Any assets assigned to them will become unassigned."
                itemName={userToDelete?.name}
            />
        </AuthenticatedLayout>
    );
}