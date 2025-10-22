// resources/js/Pages/Admin/Leaves/Show.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Calendar,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Download,
    UserCheck,
    UserX,
    Send,
    Loader2,
    X as XIcon,
    Shield,
} from 'lucide-react';

export default function Show({ auth, leaveRequest }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // ✅ FIXED: Check if user is HR/Admin (by ROLE, not permission)
    const isHROrAdmin = auth.user?.roles?.some(role => 
        ['super-admin', 'admin', 'hr-manager'].includes(role.slug)
    );

    // ✅ Check if user is Senior/Lead/PM
    const isSeniorOrAbove = auth.user?.roles?.some(role => 
        ['senior-engineer', 'lead-engineer', 'project-manager'].includes(role.slug)
    );

    // ✅ Determine which approval step user can perform
    const isPendingManager = leaveRequest.status === 'pending_manager';
    const isPendingHR = leaveRequest.status === 'pending_hr';

    // ✅ User can approve as manager if they're Senior/Lead/PM OR HR (HR can override)
    const canApproveAsManager = isPendingManager && (isSeniorOrAbove || isHROrAdmin);

    // ✅ User can approve as HR if status is pending_hr AND they have HR role
    const canApproveAsHRFinal = isPendingHR && isHROrAdmin;

    // ✅ Combined permission check
    const canTakeAction = canApproveAsManager || canApproveAsHRFinal;
    const approvalType = isPendingManager ? 'manager' : 'hr';

    // ✅ FIXED: Smart Back Button Logic
    const getBackUrl = () => {
        // If HR/Admin - go to all leaves
        if (isHROrAdmin) {
            return route('leaves.index');
        }
        // If Senior/Lead/PM - go to pending approvals
        if (isSeniorOrAbove) {
            return route('leaves.pending-approvals');
        }
        // Default - go to my leaves
        return route('my-leaves.index');
    };

    // Forms for manager approval
    const { data: managerApproveData, setData: setManagerApproveData, post: postManagerApprove, processing: managerApproveProcessing } = useForm({
        manager_comments: '',
    });

    const { data: managerRejectData, setData: setManagerRejectData, post: postManagerReject, processing: managerRejectProcessing } = useForm({
        manager_comments: '',
    });

    // Forms for HR approval
    const { data: hrApproveData, setData: setHrApproveData, post: postHrApprove, processing: hrApproveProcessing } = useForm({
        hr_comments: '',
    });

    const { data: hrRejectData, setData: setHrRejectData, post: postHrReject, processing: hrRejectProcessing } = useForm({
        hr_comments: '',
    });

    // ✅ Handle manager approval
    const handleManagerApprove = (e) => {
        e.preventDefault();
        postManagerApprove(route('leaves.manager-approve', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
            }
        });
    };

    const handleManagerReject = (e) => {
        e.preventDefault();
        postManagerReject(route('leaves.manager-reject', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
            }
        });
    };

    // ✅ Handle HR approval
    const handleHrApprove = (e) => {
        e.preventDefault();
        postHrApprove(route('leaves.hr-approve', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
            }
        });
    };

    const handleHrReject = (e) => {
        e.preventDefault();
        postHrReject(route('leaves.hr-reject', leaveRequest.id), {
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
            'cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle },
        };
        return styles[status] || styles.pending_manager;
    };

    const statusStyle = getStatusBadge(leaveRequest.status);
    const StatusIcon = statusStyle.icon;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={getBackUrl()}>
                                {/* ✅ FIXED: Smart back button based on user role */}
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
                    
                    {/* ✅ Show appropriate buttons based on approval stage */}
                    {canTakeAction && (
                        <div className="flex gap-3">
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Approve {isPendingManager ? '(Review)' : '(HR)'}
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject {isPendingManager ? '(Review)' : '(HR)'}
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
                    {/* ✅ Permission Info Alert */}
                    {isPendingManager && !canApproveAsManager && (
                        <Alert className="bg-yellow-50 border-yellow-300 animate-fade-in">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>View Only:</strong> Only Seniors, Leads, Project Managers, or HR can approve this request.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPendingHR && !canApproveAsHRFinal && (
                        <Alert className="bg-yellow-50 border-yellow-300 animate-fade-in">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>View Only:</strong> Only HR roles (Super Admin, Admin, HR Manager) can approve this request.
                            </AlertDescription>
                        </Alert>
                    )}

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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Leave Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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

                                {/* Manager Review */}
                                <div className="flex items-start gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                                        leaveRequest.manager_approved_at ? 'bg-green-100' : 
                                        isPendingManager ? 'bg-yellow-100' : 
                                        leaveRequest.status === 'rejected_by_manager' ? 'bg-red-100' : 'bg-gray-100'
                                    }`}>
                                        <User className={`h-5 w-5 ${
                                            leaveRequest.manager_approved_at ? 'text-green-600' : 
                                            isPendingManager ? 'text-yellow-600' : 
                                            leaveRequest.status === 'rejected_by_manager' ? 'text-red-600' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Manager Review</p>
                                        
                                        {leaveRequest.manager_approver ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-full">
                                                    <span className="text-xs font-medium text-white">
                                                        {leaveRequest.manager_approver.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">Reviewed by {leaveRequest.manager_approver.name}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Waiting for review</p>
                                        )}
                                        
                                        {leaveRequest.manager_approved_at && (
                                            <>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {leaveRequest.status === 'rejected_by_manager' ? 'Rejected' : 'Approved'} on {new Date(leaveRequest.manager_approved_at).toLocaleString()}
                                                </p>
                                                {leaveRequest.manager_comments && (
                                                    <div className={`mt-2 p-3 rounded-lg ${
                                                        leaveRequest.status === 'rejected_by_manager' 
                                                            ? 'bg-red-50 border border-red-200' 
                                                            : 'bg-gray-50'
                                                    }`}>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            {leaveRequest.status === 'rejected_by_manager' ? 'Rejection Reason:' : 'Comment:'}
                                                        </p>
                                                        <p className={`text-sm ${
                                                            leaveRequest.status === 'rejected_by_manager' 
                                                                ? 'text-red-700' 
                                                                : 'text-gray-700'
                                                        }`}>
                                                            {leaveRequest.manager_comments}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {isPendingManager && (
                                            <Badge className="mt-2 bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {canApproveAsManager ? 'Awaiting Your Approval' : 'Pending'}
                                            </Badge>
                                        )}
                                    </div>
                                    {leaveRequest.manager_approved_at && leaveRequest.status !== 'rejected_by_manager' && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    {leaveRequest.status === 'rejected_by_manager' && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    {isPendingManager && (
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    )}
                                </div>

                                {/* HR Approval */}
                                {['pending_hr', 'approved', 'rejected_by_hr'].includes(leaveRequest.status) && (
                                    <div className="flex items-start gap-4">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                                            leaveRequest.hr_approved_at ? 'bg-green-100' : 
                                            isPendingHR ? 'bg-blue-100' : 
                                            leaveRequest.status === 'rejected_by_hr' ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                            <Shield className={`h-5 w-5 ${
                                                leaveRequest.hr_approved_at ? 'text-green-600' : 
                                                isPendingHR ? 'text-blue-600' : 
                                                leaveRequest.status === 'rejected_by_hr' ? 'text-red-600' : 'text-gray-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">HR Final Approval</p>
                                            {leaveRequest.hr_approver && (
                                                <p className="text-sm text-gray-600">Reviewed by {leaveRequest.hr_approver.name}</p>
                                            )}
                                            
                                            {leaveRequest.hr_approved_at && (
                                                <>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {leaveRequest.status === 'rejected_by_hr' ? 'Rejected' : 'Approved'} on {new Date(leaveRequest.hr_approved_at).toLocaleString()}
                                                    </p>
                                                    {leaveRequest.hr_comments && (
                                                        <div className={`mt-2 p-3 rounded-lg ${
                                                            leaveRequest.status === 'rejected_by_hr' 
                                                                ? 'bg-red-50 border border-red-200' 
                                                                : 'bg-gray-50'
                                                        }`}>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {leaveRequest.status === 'rejected_by_hr' ? 'Rejection Reason:' : 'HR Comment:'}
                                                            </p>
                                                            <p className={`text-sm ${
                                                                leaveRequest.status === 'rejected_by_hr' 
                                                                    ? 'text-red-700' 
                                                                    : 'text-gray-700'
                                                            }`}>
                                                                {leaveRequest.hr_comments}
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {isPendingHR && (
                                                <Badge className="mt-2 bg-blue-100 text-blue-700 border border-blue-200">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {canApproveAsHRFinal ? 'Awaiting Your Approval' : 'Awaiting HR'}
                                                </Badge>
                                            )}
                                        </div>
                                        {leaveRequest.status === 'approved' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {leaveRequest.status === 'rejected_by_hr' && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {isPendingHR && (
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Card for Manager Approval */}
                    {canApproveAsManager && (
                        <Card className="animate-fade-in border-yellow-300 border-2">
                            <CardHeader>
                                <CardTitle className="text-yellow-700 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Review Required
                                </CardTitle>
                                <CardDescription>
                                    Approve or reject this leave request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 justify-start"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Approve Request
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <UserX className="h-5 w-5 mr-2" />
                                    Reject Request
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Card for HR Approval */}
                    {canApproveAsHRFinal && (
                        <Card className="animate-fade-in border-blue-300 border-2">
                            <CardHeader>
                                <CardTitle className="text-blue-700 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    HR Final Approval
                                </CardTitle>
                                <CardDescription>
                                    Make the final decision on this request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 justify-start"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Approve (Final)
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <UserX className="h-5 w-5 mr-2" />
                                    Reject (Final)
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* ✅ MANAGER APPROVE MODAL */}
            {showApproveModal && approvalType === 'manager' && (
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

                            <form onSubmit={handleManagerApprove} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manager_comments">Comments (Optional)</Label>
                                    <Textarea
                                        id="manager_comments"
                                        value={managerApproveData.manager_comments}
                                        onChange={(e) => setManagerApproveData('manager_comments', e.target.value)}
                                        placeholder="Add any comments..."
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                        <strong>This will:</strong>
                                        <br />• Approve the request
                                        <br />• Forward to HR for final approval
                                        <br />• Send notification to employee
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
                                        disabled={managerApproveProcessing}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {managerApproveProcessing ? (
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

            {/* ✅ HR APPROVE MODAL */}
            {showApproveModal && approvalType === 'hr' && (
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
                                        <h3 className="text-lg font-semibold text-gray-900">Final HR Approval</h3>
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

                            <form onSubmit={handleHrApprove} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hr_comments">Comments (Optional)</Label>
                                    <Textarea
                                        id="hr_comments"
                                        value={hrApproveData.hr_comments}
                                        onChange={(e) => setHrApproveData('hr_comments', e.target.value)}
                                        placeholder="Add any comments for the employee..."
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                        <strong>This will:</strong>
                                        <br />• Approve the leave request (FINAL)
                                        <br />• Deduct {leaveRequest.total_days} {leaveRequest.total_days === 1 ? 'day' : 'days'} from balance
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
                                        disabled={hrApproveProcessing}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {hrApproveProcessing ? (
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

            {/* ✅ MANAGER REJECT MODAL */}
            {showRejectModal && approvalType === 'manager' && (
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

                            <form onSubmit={handleManagerReject} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manager_reject_comments">Rejection Reason *</Label>
                                    <Textarea
                                        id="manager_reject_comments"
                                        value={managerRejectData.manager_comments}
                                        onChange={(e) => setManagerRejectData('manager_comments', e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>This will:</strong>
                                        <br />• Reject the leave request (FINAL)
                                        <br />• Send notification to employee
                                        <br />• No appeals allowed
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
                                        disabled={managerRejectProcessing}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {managerRejectProcessing ? (
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

            {/* ✅ HR REJECT MODAL */}
            {showRejectModal && approvalType === 'hr' && (
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
                                        <h3 className="text-lg font-semibold text-gray-900">Final HR Rejection</h3>
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

                            <form onSubmit={handleHrReject} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hr_reject_comments">Rejection Reason *</Label>
                                    <Textarea
                                        id="hr_reject_comments"
                                        value={hrRejectData.hr_comments}
                                        onChange={(e) => setHrRejectData('hr_comments', e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>This will:</strong>
                                        <br />• Reject the leave request (FINAL)
                                        <br />• Balance will NOT be deducted
                                        <br />• Send email notification to employee
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
                                        disabled={hrRejectProcessing}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {hrRejectProcessing ? (
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