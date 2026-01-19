import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    UserCheck,
    Rocket,
    Mail,
} from 'lucide-react';

export default function Checklist({ invite, submission, checklist }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'complete':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'missing':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'complete':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'pending':
                return <Clock className="h-5 w-5" />;
            case 'missing':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Onboarding Submitted" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="text-center animate-fade-in">
                        <div className="flex flex-col items-center justify-center mb-6">
                            {/* Logo */}
                            <div className="bg-black px-8 py-4 rounded-xl shadow-xl mb-4">
                                <img
                                    src="https://i.postimg.cc/RV82nPB5/image.png"
                                    alt="Rocket Partners"
                                    className="h-12 w-auto"
                                />
                            </div>

                            {/* Success Icon */}
                            <div className="p-4 bg-green-100 rounded-full mb-4">
                                <CheckCircle2 className="h-16 w-16 text-green-600" />
                            </div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Submission Complete! 🎉
                            </h1>
                            <p className="text-lg text-gray-600">
                                Thank you, {invite.first_name}!
                            </p>
                        </div>
                    </div>

                    {/* Status Alert */}
                    <Alert className="border-blue-300 bg-blue-50">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>What's Next?</strong> Our HR team will review your submission.
                            You'll receive an email notification once your onboarding has been approved.
                        </AlertDescription>
                    </Alert>

                    {/* Completion Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Your Submission Status</span>
                                <Badge className="bg-[#2596be] text-white">
                                    {submission?.completion_percentage || 0}% Complete
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Review the status of your submitted information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress
                                value={submission?.completion_percentage || 0}
                                className="h-3 mb-6"
                            />

                            {/* Checklist Items */}
                            <div className="space-y-4">
                                {checklist && Object.entries(checklist).map(([section, data], index) => (
                                    <div
                                        key={section}
                                        className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* Add number badge */}
                                                <div className="flex-shrink-0 w-8 h-8 bg-[#2596be] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className={`p-2 rounded-lg ${
                                                    data.status === 'complete' ? 'bg-green-100' :
                                                        data.status === 'pending' ? 'bg-yellow-100' :
                                                            'bg-red-100'
                                                }`}>
                                                    {getStatusIcon(data.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {data.label || section}
                                                    </h3>
                                                    {data.message && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {data.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(data.status)}>
                                                {data.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Summary */}
                    {submission?.documents && submission.documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#2596be]" />
                                    Uploaded Documents ({submission.documents.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {submission.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {doc.document_type_label}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.filename}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`flex-shrink-0 ${
                                                doc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Next Steps */}
                    <Card className="border-2 border-[#2596be]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-[#2596be]" />
                                What Happens Next?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#2596be] text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">HR Review</h4>
                                    <p className="text-sm text-gray-600">
                                        Our HR team will review your documents and information within 2-3 business days.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#2596be] text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Email Notification</h4>
                                    <p className="text-sm text-gray-600">
                                        You'll receive an email at <strong>{invite.email}</strong> with the review results.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#2596be] text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Account Activation</h4>
                                    <p className="text-sm text-gray-600">
                                        Once approved, you'll receive your login credentials and can start working!
                                    </p>
                                </div>
                            </div>

                            <Alert className="mt-4 flex items-center justify-center space-x-2">
                                <UserCheck className="h-4 w-4" />
                                <AlertDescription className="text-center">
                                    If you have any questions, please contact HR at&nbsp;
                                    <a href="mailto:hr@rocketpartners.com" className="font-semibold whitespace-nowrap">
                                        hr@rocketpartners.com
                                    </a>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </>
    );
}
