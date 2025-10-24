// resources/js/Pages/Admin/Onboarding/Invites/Index.jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Eye,
    Ban,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Copy,
    ExternalLink,
} from 'lucide-react';

export default function Index({ invites, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('onboarding.invites.index'), 
            { search: searchTerm },
            { preserveState: true }
        );
    };

    const filterByStatus = (status) => {
        router.get(route('onboarding.invites.index'), 
            { status, search: searchTerm },
            { preserveState: true }
        );
    };

    const copyGuestLink = (invite) => {
        const guestUrl = `${window.location.origin}/onboarding/${invite.token}`;
        navigator.clipboard.writeText(guestUrl);
        alert('Guest link copied to clipboard!');
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
            in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, label: 'In Progress' },
            submitted: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle2, label: 'Submitted' },
            approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
            expired: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, label: 'Expired' },
            cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: Ban, label: 'Cancelled' },
        };
        
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        
        return (
            <Badge className={`${badge.color} border`}>
                <Icon className="h-3 w-3 mr-1" />
                {badge.label}
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Onboarding Invites" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Onboarding Invites</h1>
                        <p className="text-gray-600 mt-1">Manage pre-employment onboarding invitations</p>
                    </div>
                    <Link href={route('onboarding.invites.create')}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Send New Invite
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Invites</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('pending')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('in_progress')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-blue-600">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-700">{stats.in_progress}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('submitted')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-purple-600">Submitted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-purple-700">{stats.submitted}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('approved')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('expired')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-700">{stats.expired}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, email, or position..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                            {(filters?.search || filters?.status !== 'all') && (
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => router.get(route('onboarding.invites.index'))}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Invites Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Invites ({invites.data.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent Date</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invites.data.length > 0 ? invites.data.map((invite) => (
                                    <TableRow key={invite.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {invite.first_name} {invite.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">{invite.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-700">{invite.position || '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-700">{invite.department || '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(invite.status)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600">
                                                {new Date(invite.created_at).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {invite.expires_at ? (
                                                <span className={`text-sm ${
                                                    new Date(invite.expires_at) < new Date() 
                                                        ? 'text-red-600 font-medium' 
                                                        : 'text-gray-600'
                                                }`}>
                                                    {new Date(invite.expires_at).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-green-600 font-medium">No expiry</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('onboarding.invites.show', invite.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem onClick={() => copyGuestLink(invite)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Guest Link
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <a 
                                                            href={`/onboarding/${invite.token}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Open Guest Link
                                                        </a>
                                                    </DropdownMenuItem>

                                                    {invite.status === 'pending' && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm('Resend invitation email?')) {
                                                                    router.post(route('onboarding.invites.resend', invite.id));
                                                                }
                                                            }}
                                                        >
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Resend Email
                                                        </DropdownMenuItem>
                                                    )}

                                                    {['pending', 'in_progress'].includes(invite.status) && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm('Cancel this invitation?')) {
                                                                    router.post(route('onboarding.invites.cancel', invite.id));
                                                                }
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            <Ban className="h-4 w-4 mr-2" />
                                                            Cancel Invite
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium mb-2">No invites sent yet</p>
                                            <p className="text-sm mb-4">Send your first onboarding invitation to get started</p>
                                            <Link href={route('onboarding.invites.create')}>
                                                <Button className="bg-blue-600 hover:bg-blue-700">
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Send First Invite
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {invites.data.length > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {invites.from} to {invites.to} of {invites.total} invites
                        </p>
                        <div className="flex gap-2">
                            {invites.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}