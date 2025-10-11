// resources/js/Pages/Assets/Index.jsx
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
    Laptop,
    Plus,
    Search,
    User,
    Package,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    RotateCcw,
} from 'lucide-react';

export default function Index({ auth, assignments, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [userId, setUserId] = useState(filters.user_id || 'all');
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (status && status !== 'all') params.status = status;
        if (userId && userId !== 'all') params.user_id = userId;
        
        router.get(route('assets.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setUserId('all');
        router.get(route('assets.index'));
    };

    const handleReturn = (assignment) => {
        setSelectedAssignment(assignment);
        setReturnModalOpen(true);
    };

    const confirmReturn = () => {
        if (selectedAssignment) {
            router.post(route('assets.return', selectedAssignment.id), {
                return_date: new Date().toISOString().split('T')[0],
                notes: 'Asset returned',
            }, {
                onSuccess: () => {
                    setReturnModalOpen(false);
                    setSelectedAssignment(null);
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            returned: 'bg-gray-100 text-gray-700 border-gray-200',
            damaged: 'bg-red-100 text-red-700 border-red-200',
            lost: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const hasFilters = search || status !== 'all' || userId !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Laptop className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Asset Assignments</h2>
                            <p className="text-gray-600 mt-1">Track equipment assigned to employees</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('assets.assign')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Asset
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Asset Assignments" />

            <div className="space-y-6">
                {/* Filters Card */}
                <Card className="shadow-sm animate-fade-in">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by item name, barcode, or employee name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11 text-base"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Employee</label>
                                    <Select value={userId} onValueChange={setUserId}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employees</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="returned">Returned</SelectItem>
                                            <SelectItem value="damaged">Damaged</SelectItem>
                                            <SelectItem value="lost">Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10">
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
                                Showing <span className="font-semibold text-gray-900">{assignments.total}</span> {assignments.total === 1 ? 'assignment' : 'assignments'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">Asset</TableHead>
                                    <TableHead className="font-semibold">Assigned To</TableHead>
                                    <TableHead className="font-semibold">Assigned Date</TableHead>
                                    <TableHead className="font-semibold">Return Date</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.data.length > 0 ? (
                                    assignments.data.map((assignment, index) => (
                                        <TableRow key={assignment.id} className={`hover:bg-gray-50 animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <Package className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{assignment.inventory_item.name}</p>
                                                        <p className="text-sm text-gray-500">{assignment.inventory_item.sku}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                                                        <span className="text-sm font-medium text-white">
                                                            {assignment.user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{assignment.user.name}</p>
                                                        <p className="text-sm text-gray-500">{assignment.user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(assignment.assigned_date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {assignment.return_date ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(assignment.return_date).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadge(assignment.status)} border`}>
                                                    {assignment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {assignment.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReturn(assignment)}
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Return
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <Laptop className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">No assignments found</p>
                                                <p className="text-gray-500 text-sm mb-4">Start by assigning assets to employees</p>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                                    <Link href={route('assets.assign')}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Assign Asset
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
                    {assignments.data.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{assignments.from}</span> to{' '}
                                    <span className="font-medium">{assignments.to}</span> of{' '}
                                    <span className="font-medium">{assignments.total}</span> results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(assignments.prev_page_url)}
                                    disabled={!assignments.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(assignments.next_page_url)}
                                    disabled={!assignments.next_page_url}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Return Modal */}
            {returnModalOpen && selectedAssignment && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setReturnModalOpen(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <RotateCcw className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Return Asset</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">{selectedAssignment.inventory_item.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setReturnModalOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Mark this asset as returned from <span className="font-medium">{selectedAssignment.user.name}</span>?
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setReturnModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={confirmReturn}
                                >
                                    Confirm Return
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}