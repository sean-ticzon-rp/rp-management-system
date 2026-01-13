// resources/js/Pages/Admin/Onboarding/Submissions/Review.jsx
import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    FileCheck,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    FileText,
    Download,
    Eye,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    AlertTriangle,
    UserCheck,
    Clock,
    Briefcase,
    Building2,
} from 'lucide-react';

export default function Review({ submission, checklist }) {
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDocRejectDialog, setShowDocRejectDialog] = useState(false);

    const approveForm = useForm({
        hr_notes: '',
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const docRejectForm = useForm({
        rejection_reason: '',
    });

    const approveDocument = (document) => {
        router.post(route('onboarding.submissions.approve-document', document.id), {}, {
            preserveScroll: true,
        });
    };

    const openRejectDocDialog = (document) => {
        setSelectedDocument(document);
        setShowDocRejectDialog(true);
    };

    const rejectDocument = () => {
        if (selectedDocument) {
            docRejectForm.post(route('onboarding.submissions.reject-document', selectedDocument.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDocRejectDialog(false);
                    docRejectForm.reset();
                    setSelectedDocument(null);
                },
            });
        }
    };

    const handleApproveSubmission = () => {
        approveForm.post(route('onboarding.submissions.approve', submission.id), {
            onSuccess: () => {
                setShowApproveDialog(false);
                approveForm.reset();
            },
        });
    };

    const handleRejectSubmission = () => {
        rejectForm.post(route('onboarding.submissions.reject', submission.id), {
            onSuccess: () => {
                setShowRejectDialog(false);
                rejectForm.reset();
            },
        });
    };

    const handleConvertToUser = () => {
        router.post(route('onboarding.invites.convert-to-user', submission.invite.id), {
            onSuccess: () => {
                setShowConvertDialog(false);
            },
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
            approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
            rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <Badge className={`${badge.color} border`}>
                <Icon className="h-3 w-3 mr-1" />
                {status}
            </Badge>
        );
    };

    // Generate work email preview
    const generateWorkEmail = () => {
        const personal = submission.personal_info || {};
        const firstName = (personal.first_name || '').toLowerCase();
        const lastName = (personal.last_name || '').toLowerCase();
        return `${firstName}.${lastName}@rocketpartners.ph`;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Review - ${submission.invite.first_name} ${submission.invite.last_name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('onboarding.submissions.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Submissions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {submission.invite.first_name} {submission.invite.last_name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {submission.invite.position}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {submission.invite.department}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {submission.status === 'submitted' && (
                            <>
                                <Button 
                                    variant="outline" 
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => setShowRejectDialog(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Request Revisions
                                </Button>
                                <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => setShowApproveDialog(true)}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve All
                                </Button>
                            </>
                        )}
                        
                        {submission.status === 'approved' && !submission.invite.converted_user_id && (
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setShowConvertDialog(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Convert to User Account
                            </Button>
                        )}
                    </div>
                </div>

                {/* Overall Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Completion Progress</span>
                            <span className="text-2xl font-bold text-blue-600">{submission.completion_percentage}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={submission.completion_percentage} className="h-3" />
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {checklist.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {item.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-gray-300" />
                                    )}
                                    <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {item.section}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Personal Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {submission.personal_info ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">
                                                {submission.personal_info.first_name} {submission.personal_info.middle_name} {submission.personal_info.last_name} {submission.personal_info.suffix !== 'none' ? submission.personal_info.suffix : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Birthday</p>
                                            <p className="font-medium">{submission.personal_info.birthday || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Gender</p>
                                            <p className="font-medium">{submission.personal_info.gender || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Civil Status</p>
                                            <p className="font-medium">{submission.personal_info.civil_status || '—'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium">
                                                {submission.personal_info.address_line_1}, {submission.personal_info.city}, {submission.personal_info.country}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{submission.personal_info.phone_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium">{submission.personal_info.mobile_number || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Government IDs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Government IDs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {submission.government_ids ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">SSS Number</p>
                                            <p className="font-medium font-mono">{submission.government_ids.sss_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">TIN Number</p>
                                            <p className="font-medium font-mono">{submission.government_ids.tin_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">HDMF/Pag-IBIG</p>
                                            <p className="font-medium font-mono">{submission.government_ids.hdmf_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">PhilHealth</p>
                                            <p className="font-medium font-mono">{submission.government_ids.philhealth_number || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {submission.emergency_contact ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{submission.emergency_contact.name || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Relationship</p>
                                            <p className="font-medium">{submission.emergency_contact.relationship || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{submission.emergency_contact.phone || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium">{submission.emergency_contact.mobile || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Documents & Actions */}
                    <div className="space-y-6">
                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Uploaded Documents
                                </CardTitle>
                                <CardDescription>Review NBI & PNP Clearance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {submission.documents && submission.documents.length > 0 ? (
                                    submission.documents.map((doc) => (
                                        <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                        <p className="font-medium text-gray-900">{doc.document_type_label}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{doc.filename}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{doc.file_size}</p>
                                                </div>
                                                {getStatusBadge(doc.status)}
                                            </div>

                                            {doc.rejection_reason && (
                                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Rejection Reason:</strong> {doc.rejection_reason}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <a 
                                                    href={doc.download_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex-1"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </a>
                                                <a 
                                                    href={doc.download_url} 
                                                    download
                                                    className="flex-1"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </a>
                                            </div>

                                            {doc.status === 'pending' && (
                                                <div className="flex gap-2 pt-2 border-t">
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                        onClick={() => approveDocument(doc)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                                        onClick={() => openRejectDocDialog(doc)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p>No documents uploaded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submission Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(submission.status)}
                                    </div>
                                </div>
                                
                                {submission.submitted_at && (
                                    <div>
                                        <p className="text-sm text-gray-500">Submitted Date</p>
                                        <p className="font-medium">{new Date(submission.submitted_at).toLocaleString()}</p>
                                    </div>
                                )}

                                {submission.reviewed_at && (
                                    <div>
                                        <p className="text-sm text-gray-500">Reviewed Date</p>
                                        <p className="font-medium">{new Date(submission.reviewed_at).toLocaleString()}</p>
                                    </div>
                                )}

                                {submission.reviewer && (
                                    <div>
                                        <p className="text-sm text-gray-500">Reviewed By</p>
                                        <p className="font-medium">{submission.reviewer.name}</p>
                                    </div>
                                )}

                                {submission.hr_notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">HR Notes</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{submission.hr_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Preview Work Email */}
                        {submission.personal_info && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-sm text-blue-900">Work Email Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <code className="text-sm font-mono text-blue-900">{generateWorkEmail()}</code>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                        This will be their login username after conversion
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Approve Submission Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Approve Onboarding Submission
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will approve <strong>{submission.invite.first_name} {submission.invite.last_name}'s</strong> onboarding submission.
                            They will be notified and you can then convert this to a user account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-2 py-4">
                        <Label>HR Notes (Optional)</Label>
                        <Textarea
                            value={approveForm.data.hr_notes}
                            onChange={(e) => approveForm.setData('hr_notes', e.target.value)}
                            placeholder="Internal notes about this approval..."
                            rows={3}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApproveSubmission}
                            disabled={approveForm.processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Approve Submission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Submission Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Request Revisions
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The candidate will be notified to make corrections and resubmit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-2 py-4">
                        <Label>Reason for Rejection *</Label>
                        <Textarea
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Explain what needs to be corrected..."
                            rows={4}
                            required
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectSubmission}
                            disabled={rejectForm.processing || !rejectForm.data.rejection_reason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Request Revisions
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Document Dialog */}
            <AlertDialog open={showDocRejectDialog} onOpenChange={setShowDocRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Reject Document
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Reject <strong>{selectedDocument?.document_type_label}</strong>?
                            The candidate will need to reupload a valid document.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-2 py-4">
                        <Label>Rejection Reason *</Label>
                        <Textarea
                            value={docRejectForm.data.rejection_reason}
                            onChange={(e) => docRejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Why is this document being rejected?"
                            rows={3}
                            required
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDocRejectDialog(false);
                            docRejectForm.reset();
                            setSelectedDocument(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={rejectDocument}
                            disabled={docRejectForm.processing || !docRejectForm.data.rejection_reason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Reject Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Convert to User Dialog */}
            <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                            Convert to User Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a user account with the following details:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-3 py-4 bg-gray-50 rounded-lg p-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">
                                {submission.personal_info?.first_name} {submission.personal_info?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Work Email (Login Username)</p>
                            <code className="text-sm font-mono text-blue-600">{generateWorkEmail()}</code>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="font-medium">{submission.invite.position}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium">{submission.invite.department}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Temporary Password</p>
                            <code className="text-sm font-mono text-orange-600">ChangeMe123!</code>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> A welcome email will be sent with login credentials.
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConvertToUser}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Create User Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}