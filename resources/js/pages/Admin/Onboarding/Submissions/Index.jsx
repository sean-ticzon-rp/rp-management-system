// resources/js/Pages/Admin/Onboarding/Submissions/Index.jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
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
    FileCheck,
    Search,
    Eye,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    FileText,
    UserCheck,
} from 'lucide-react';

export default function Index({ submissions, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('onboarding.submissions.index'), 
            { search: searchTerm },
            { preserveState: true }
        );
    };

    const filterByStatus = (status) => {
        router.get(route('onboarding.submissions.index'), 
            { status, search: searchTerm },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: 'Draft' },
            submitted: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Submitted' },
            under_review: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, label: 'Under Review' },
            approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Needs Revision' },
        };
        
        const badge = badges[status] || badges.draft;
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
            <Head title="Onboarding Submissions" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Onboarding Submissions</h1>
                        <p className="text-gray-600 mt-1">Review and approve pre-employment documents</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('draft')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('submitted')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-yellow-600">Needs Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-700">{stats.submitted}</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => filterByStatus('under_review')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-blue-600">Under Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-700">{stats.under_review}</p>
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
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by candidate name or email..."
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
                                    onClick={() => router.get(route('onboarding.submissions.index'))}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Submissions ({submissions.data.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.data.length > 0 ? submissions.data.map((submission) => (
                                    <TableRow key={submission.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {submission.invite.first_name} {submission.invite.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">{submission.invite.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-700">{submission.invite.position || '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Progress value={submission.completion_percentage} className="h-2" />
                                                <p className="text-xs text-gray-600">{submission.completion_percentage}%</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {submission.documents?.length || 0} uploaded
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(submission.status)}
                                        </TableCell>
                                        <TableCell>
                                            {submission.submitted_at ? (
                                                <span className="text-sm text-gray-600">
                                                    {new Date(submission.submitted_at).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
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
                                                        <Link href={route('onboarding.submissions.review', submission.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Review Submission
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    {submission.status === 'approved' && !submission.invite.converted_user_id && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm('Convert this submission to a user account?')) {
                                                                    router.post(route('onboarding.invites.convert-to-user', submission.invite.id));
                                                                }
                                                            }}
                                                            className="text-green-600"
                                                        >
                                                            <UserCheck className="h-4 w-4 mr-2" />
                                                            Convert to User
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium mb-2">No submissions yet</p>
                                            <p className="text-sm">Submissions will appear here after candidates fill out their forms</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {submissions.data.length > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {submissions.from} to {submissions.to} of {submissions.total} submissions
                        </p>
                        <div className="flex gap-2">
                            {submissions.links.map((link, index) => (
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