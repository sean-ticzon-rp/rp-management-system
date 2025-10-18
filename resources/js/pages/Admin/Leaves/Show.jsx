// resources/js/Pages/Admin/Leaves/Show.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Calendar,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Phone,
    FileText,
    Download,
    MessageSquare,
    UserCheck,
    UserX,
    Send,
    Loader2,
    X as XIcon,
} from 'lucide-react';

export default function Show({ auth, leaveRequest }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const { data: approveData, setData: setApproveData, post: postApprove, processing: approveProcessing } = useForm({
        hr_comments: '',
    });

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing } = useForm({
        hr_comments: '',
    });

    const handleApprove = (e) => {
        e.preventDefault();
        postApprove(route('leaves.hr-approve', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
            }
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        postReject(route('leaves.hr-reject', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
            }
        });
    };
    const getStatusBadge = (status) => {
        const styles = {
            'pending_manager': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
            'pending_hr': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
            'approved': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
            'rejected_by_manager': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            'rejected_by_hr': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            'appealed': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle },
            'cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle },
        };
        return styles[status] || styles.pending_manager;
    };

    const statusStyle = getStatusBadge(leaveRequest.status);
    const StatusIcon = statusStyle.icon;
    const isPendingHR = leaveRequest.status === 'pending_hr';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('leaves.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: leaveRequest.leave_type.color + '15' }}
                            >
                                <Calendar className="h-6 w-6" style={{ color: leaveRequest.leave_type.color }} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {leaveRequest.user.name}'s Leave Request
                                    </h2>
                                    <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border flex items-center gap-1.5`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {leaveRequest.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 mt-1">{leaveRequest.leave_type.name}</p>
                            </div>
                        </div>
                    </div>
                    {isPendingHR && (
                        <div className="flex gap-3">
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`Leave Request - ${leaveRequest.user.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Employee Info */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                {leaveRequest.user.profile_picture ? (
                                    <img
                                        src={`/storage/${leaveRequest.user.profile_picture}`}
                                        alt={leaveRequest.user.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full border-2 border-gray-200">
                                        <span className="text-2xl font-medium text-white">
                                            {leaveRequest.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900">{leaveRequest.user.name}</h3>
                                    <p className="text-sm text-gray-600">{leaveRequest.user.position || leaveRequest.user.department || leaveRequest.user.email}</p>
                                    {leaveRequest.user.employee_id && (
                                        <p className="text-xs text-gray-500 mt-1">ID: {leaveRequest.user.employee_id}</p>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('users.show', leaveRequest.user.id)}>
                                        View Profile
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Leave Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Dates & Duration */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(leaveRequest.start_date).toLocaleDateString('en-US', { 
                                            weekday: 'short',
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(leaveRequest.end_date).toLocaleDateString('en-US', { 
                                            weekday: 'short',
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Duration</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <p className="font-bold text-2xl text-gray-900">
                                            {leaveRequest.total_days}
                                        </p>
                                        <span className="text-gray-500">
                                            {leaveRequest.total_days === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Duration Type */}
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">Duration Type</p>
                                <Badge variant="outline" className="capitalize">
                                    {leaveRequest.duration.replace(/_/g, ' ')}
                                </Badge>
                                {leaveRequest.duration === 'custom_hours' && leaveRequest.custom_start_time && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        {leaveRequest.custom_start_time} - {leaveRequest.custom_end_time}
                                    </p>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">Reason</p>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{leaveRequest.reason}</p>
                                </div>
                            </div>

                            {/* Attachment */}
                            {leaveRequest.attachment && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Attached Document</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/storage/${leaveRequest.attachment}`} download target="_blank">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Medical Certificate
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {/* Availability */}
                            {leaveRequest.availability && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Availability During Leave</p>
                                    <Badge variant="outline" className="capitalize">
                                        {leaveRequest.availability.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Approval Timeline */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Approval Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Submitted */}
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                                        <Send className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Request Submitted</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(leaveRequest.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>

                                {/* Manager Approval */}
                                <div className="flex items-start gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                                        leaveRequest.manager_approved_at ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                        <User className={`h-5 w-5 ${
                                            leaveRequest.manager_approved_at ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Manager Approval</p>
                                        {leaveRequest.manager && (
                                            <p className="text-sm text-gray-600">{leaveRequest.manager.name}</p>
                                        )}
                                        {leaveRequest.manager_approved_at && (
                                            <>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Approved by {leaveRequest.manager_approver?.name || 'Manager'} on{' '}
                                                    {new Date(leaveRequest.manager_approved_at).toLocaleString()}
                                                </p>
                                                {leaveRequest.manager_comments && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 mb-1">Manager's Comment:</p>
                                                        <p className="text-sm text-gray-700">{leaveRequest.manager_comments}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {leaveRequest.status === 'pending_manager' && (
                                            <Badge className="mt-2 bg-yellow-100 text-yellow-700">Pending</Badge>
                                        )}
                                        {leaveRequest.status === 'rejected_by_manager' && leaveRequest.manager_comments && (
                                            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-xs text-red-500 mb-1">Rejection Reason:</p>
                                                <p className="text-sm text-red-700">{leaveRequest.manager_comments}</p>
                                            </div>
                                        )}
                                    </div>
                                    {leaveRequest.manager_approved_at && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    {leaveRequest.status === 'rejected_by_manager' && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>

                                {/* HR Approval */}
                                {['pending_hr', 'approved', 'rejected_by_hr', 'appealed'].includes(leaveRequest.status) && (
                                    <div className="flex items-start gap-4">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                                            leaveRequest.hr_approved_at ? 'bg-green-100' : 
                                            leaveRequest.status === 'pending_hr' ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            <User className={`h-5 w-5 ${
                                                leaveRequest.hr_approved_at ? 'text-green-600' : 
                                                leaveRequest.status === 'pending_hr' ? 'text-blue-600' : 'text-gray-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">HR Approval</p>
                                            {leaveRequest.hr_approver && (
                                                <p className="text-sm text-gray-600">{leaveRequest.hr_approver.name}</p>
                                            )}
                                            {leaveRequest.hr_approved_at && (
                                                <>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {new Date(leaveRequest.hr_approved_at).toLocaleString()}
                                                    </p>
                                                    {leaveRequest.hr_comments && (
                                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-xs text-gray-500 mb-1">HR Comment:</p>
                                                            <p className="text-sm text-gray-700">{leaveRequest.hr_comments}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {leaveRequest.status === 'pending_hr' && (
                                                <Badge className="mt-2 bg-blue-100 text-blue-700 border border-blue-200">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Awaiting Your Approval
                                                </Badge>
                                            )}
                                            {leaveRequest.status === 'rejected_by_hr' && leaveRequest.hr_comments && (
                                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-xs text-red-500 mb-1">Rejection Reason:</p>
                                                    <p className="text-sm text-red-700">{leaveRequest.hr_comments}</p>
                                                </div>
                                            )}
                                        </div>
                                        {leaveRequest.status === 'approved' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {leaveRequest.status === 'rejected_by_hr' && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {leaveRequest.status === 'pending_hr' && (
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                )}

                                {/* Appeal Info */}
                                {leaveRequest.status === 'appealed' && leaveRequest.appeal_reason && (
                                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full flex-shrink-0">
                                            <MessageSquare className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Employee Appeal</p>
                                            <p className="text-xs text-gray-600 mb-2">
                                                Submitted on {new Date(leaveRequest.appealed_at).toLocaleString()}
                                            </p>
                                            <div className="p-3 bg-white rounded border border-orange-200">
                                                <p className="text-sm text-gray-900">{leaveRequest.appeal_reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Leave Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Leave Type</p>
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: leaveRequest.leave_type.color }}
                                        />
                                        <p className="font-medium text-gray-900">
                                            {leaveRequest.leave_type.name} ({leaveRequest.leave_type.code})
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Duration Type</p>
                                    <Badge variant="outline" className="capitalize">
                                        {leaveRequest.duration.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">Reason</p>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{leaveRequest.reason}</p>
                                </div>
                            </div>

                            {leaveRequest.attachment && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Supporting Document</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/storage/${leaveRequest.attachment}`} download target="_blank">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Attachment
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Emergency Contact */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Name</p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.emergency_contact_name || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Phone</p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.emergency_contact_phone || 'Not provided'}
                                </p>
                            </div>
                            {leaveRequest.availability && (
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-gray-600 mb-1">Availability</p>
                                    <Badge variant="outline" className="capitalize">
                                        {leaveRequest.availability.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leave Type Details */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>{leaveRequest.leave_type.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                {leaveRequest.leave_type.is_paid ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-gray-700">
                                    {leaveRequest.leave_type.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                                </span>
                            </div>

                            <div className="pt-3 border-t">
                                <p className="text-gray-600 mb-1">Annual Allocation</p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.leave_type.days_per_year} days/year
                                </p>
                            </div>

                            {leaveRequest.leave_type.description && (
                                <p className="text-gray-600 pt-3 border-t">
                                    {leaveRequest.leave_type.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Request Metadata */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Request Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Request ID</p>
                                <p className="font-mono font-medium text-gray-900">#{leaveRequest.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Submitted</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(leaveRequest.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Last Updated</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(leaveRequest.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* HR Actions (if pending HR approval) */}
                    {isPendingHR && (
                        <Card className="animate-fade-in animation-delay-400 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-700">HR Actions Required</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 justify-start"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Approve Leave Request
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <UserX className="h-5 w-5 mr-2" />
                                    Reject Leave Request
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setShowApproveModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <UserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Approve Leave Request</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            {leaveRequest.user.name} - {leaveRequest.total_days} {leaveRequest.total_days === 1 ? 'day' : 'days'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <XIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleApprove} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="approve_comments">Comments (Optional)</Label>
                                    <Textarea
                                        id="approve_comments"
                                        value={approveData.hr_comments}
                                        onChange={(e) => setApproveData('hr_comments', e.target.value)}
                                        placeholder="Add any comments for the employee..."
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                        <strong>This will:</strong>
                                        <br />• Approve the leave request
                                        <br />• Deduct {leaveRequest.total_days} {leaveRequest.total_days === 1 ? 'day' : 'days'} from employee's balance
                                        <br />• Send email notification to employee
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowApproveModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={approveProcessing}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {approveProcessing ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Approving...</>
                                        ) : (
                                            <><UserCheck className="h-4 w-4 mr-2" />Approve</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setShowRejectModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <UserX className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Reject Leave Request</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            {leaveRequest.user.name} - {leaveRequest.total_days} {leaveRequest.total_days === 1 ? 'day' : 'days'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <XIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleReject} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reject_comments">Rejection Reason *</Label>
                                    <Textarea
                                        id="reject_comments"
                                        value={rejectData.hr_comments}
                                        onChange={(e) => setRejectData('hr_comments', e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>This will:</strong>
                                        <br />• Reject the leave request
                                        <br />• Send email notification to employee
                                        <br />• Employee balance will NOT be deducted
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowRejectModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={rejectProcessing}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {rejectProcessing ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Rejecting...</>
                                        ) : (
                                            <><UserX className="h-4 w-4 mr-2" />Reject</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}