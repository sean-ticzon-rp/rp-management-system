// resources/js/Pages/Guest/Onboarding/Form.jsx
import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
    UserPlus,
    Building2,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    Send,
    CheckCircle2,
    Upload,
    FileText,
    Trash2,
    Info,
    Phone,
    CreditCard,
    Loader2,
    Rocket,
    Clock,
} from 'lucide-react';

export default function Form({ invite, submission, requiredDocuments }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDocType, setSelectedDocType] = useState('');

    const getUploadedDocument = (docType) => {
        return submission?.documents?.find(doc => doc.document_type === docType);
    };

    const totalSteps = 4;

    // Personal Info Form
    const personalForm = useForm({
        first_name: submission?.personal_info?.first_name || '',
        middle_name: submission?.personal_info?.middle_name || '',
        last_name: submission?.personal_info?.last_name || '',
        suffix: submission?.personal_info?.suffix || 'none',
        birthday: submission?.personal_info?.birthday || '',
        gender: submission?.personal_info?.gender || '',
        civil_status: submission?.personal_info?.civil_status || '',
        phone_number: submission?.personal_info?.phone_number || '',
        mobile_number: submission?.personal_info?.mobile_number || '',
        address_line_1: submission?.personal_info?.address_line_1 || '',
        address_line_2: submission?.personal_info?.address_line_2 || '',
        city: submission?.personal_info?.city || '',
        state: submission?.personal_info?.state || '',
        postal_code: submission?.personal_info?.postal_code || '',
        country: submission?.personal_info?.country || 'Philippines',
    });

    // Government IDs Form
    const govIdForm = useForm({
        sss_number: submission?.government_ids?.sss_number || '',
        tin_number: submission?.government_ids?.tin_number || '',
        hdmf_number: submission?.government_ids?.hdmf_number || '',
        philhealth_number: submission?.government_ids?.philhealth_number || '',
    });

    // Emergency Contact Form
    const emergencyForm = useForm({
        name: submission?.emergency_contact?.name || '',
        phone: submission?.emergency_contact?.phone || '',
        mobile: submission?.emergency_contact?.mobile || '',
        relationship: submission?.emergency_contact?.relationship || '',
    });

    const documentForm = useForm({
        document_type: '',
        file: null,
        description: '',
    });

    const steps = [
        { number: 1, title: 'Personal Info', icon: UserPlus },
        { number: 2, title: 'Government IDs', icon: CreditCard },
        { number: 3, title: 'Emergency Contact', icon: Phone },
        { number: 4, title: 'Documents', icon: FileText },
    ];

    const handleSavePersonalInfo = () => {
        personalForm.post(route('guest.onboarding.update-personal-info', invite.token), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(2),
        });
    };

    const handleSaveGovIds = () => {
        govIdForm.post(route('guest.onboarding.update-government-ids', invite.token), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(3),
        });
    };

    const handleSaveEmergency = () => {
        emergencyForm.post(route('guest.onboarding.update-emergency-contact', invite.token), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(4),
        });
    };

    const handleDeleteDocument = (documentId) => {
        if (confirm('Are you sure you want to delete this document?')) {
            router.delete(route('guest.onboarding.delete-document', [invite.token, documentId]), {
                preserveScroll: true,
            });
        }
    };

    const handleFinalSubmit = () => {
        router.post(route('guest.onboarding.submit', invite.token), {}, {
            onSuccess: () => {
                // Will redirect to checklist page
            },
        });
    };

    const getDocumentsForType = (docType) => {
        return submission?.documents?.filter(doc => doc.document_type === docType) || [];
    };

    const hasUpload = (docType) => {
        return getDocumentsForType(docType).length > 0;
    };

    const getRequiredDocsCount = () => {
        return Object.values(requiredDocuments || {}).filter(doc => doc.required).length;
    };

    const getUploadedRequiredCount = () => {
        return Object.keys(requiredDocuments || {})
            .filter(key => requiredDocuments[key].required && hasUpload(key))
            .length;
    };

    return (
        <>
            <Head title="Complete Your Onboarding" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Header with Logo */}
                    <div className="text-center animate-fade-in">
                        <div className="flex flex-col items-center justify-center mb-6">
                            {/* Logo with Black Background */}
                            <div className="bg-black px-8 py-4 rounded-xl shadow-xl mb-4">
                                <img
                                    src="https://i.postimg.cc/RV82nPB5/image.png"
                                    alt="Rocket Partners"
                                    className="h-12 w-auto"
                                />
                            </div>

                            {/* Title */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-[#2596be] rounded-xl shadow-lg">
                                    <Rocket className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900">
                                    Onboarding Portal
                                </h1>
                            </div>

                            <p className="text-lg text-gray-600">
                                Welcome, {invite.full_name || 'New Team Member'}!
                            </p>
                        </div>

                        {/* Position Badge */}
                        {invite.position && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge className="bg-[#2596be] text-white border-[#2596be] px-4 py-1.5 text-base">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    {invite.position}
                                </Badge>
                                {invite.department && (
                                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 px-4 py-1.5 text-base">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        {invite.department}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Expiration Warning */}
                        <Alert className="mt-6 border-amber-300 bg-amber-50">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>Expires:</strong> {new Date(invite.expires_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Progress Steps */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                {steps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isActive = currentStep === step.number;
                                    const isCompleted = currentStep > step.number;

                                    return (
                                        <div key={step.number} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center flex-1">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                                                    isCompleted ? 'bg-green-600 border-green-600' :
                                                        isActive ? 'bg-[#2596be] border-[#2596be]' :
                                                            'bg-gray-100 border-gray-300'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                                    ) : (
                                                        <StepIcon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                                    )}
                                                </div>
                                                <p className={`text-sm mt-2 font-medium ${
                                                    isActive ? 'text-[#2596be]' :
                                                        isCompleted ? 'text-green-600' :
                                                            'text-gray-500'
                                                }`}>
                                                    {step.title}
                                                </p>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className={`h-0.5 flex-1 mx-4 ${
                                                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                                                }`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#2596be]">
                                    <UserPlus className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Tell us about yourself</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleSavePersonalInfo(); }} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>First Name *</Label>
                                            <Input
                                                value={personalForm.data.first_name}
                                                onChange={(e) => personalForm.setData('first_name', e.target.value)}
                                                placeholder="John"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Middle Name</Label>
                                            <Input
                                                value={personalForm.data.middle_name}
                                                onChange={(e) => personalForm.setData('middle_name', e.target.value)}
                                                placeholder="Michael"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name *</Label>
                                            <Input
                                                value={personalForm.data.last_name}
                                                onChange={(e) => personalForm.setData('last_name', e.target.value)}
                                                placeholder="Doe"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Suffix</Label>
                                            <Select
                                                value={personalForm.data.suffix}
                                                onValueChange={(value) => personalForm.setData('suffix', value)}
                                            >
                                                <SelectTrigger className="focus:ring-[#2596be]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="Jr.">Jr.</SelectItem>
                                                    <SelectItem value="Sr.">Sr.</SelectItem>
                                                    <SelectItem value="II">II</SelectItem>
                                                    <SelectItem value="III">III</SelectItem>
                                                    <SelectItem value="IV">IV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Birthday *</Label>
                                            <Input
                                                type="date"
                                                value={personalForm.data.birthday}
                                                onChange={(e) => personalForm.setData('birthday', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Gender *</Label>
                                            <Select
                                                value={personalForm.data.gender}
                                                onValueChange={(value) => personalForm.setData('gender', value)}
                                            >
                                                <SelectTrigger className="focus:ring-[#2596be]">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Civil Status</Label>
                                        <Select
                                            value={personalForm.data.civil_status}
                                            onValueChange={(value) => personalForm.setData('civil_status', value)}
                                        >
                                            <SelectTrigger className="focus:ring-[#2596be]">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">Single</SelectItem>
                                                <SelectItem value="married">Married</SelectItem>
                                                <SelectItem value="widowed">Widowed</SelectItem>
                                                <SelectItem value="divorced">Divorced</SelectItem>
                                                <SelectItem value="separated">Separated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Phone Number *</Label>
                                            <Input
                                                type="tel"
                                                value={personalForm.data.phone_number}
                                                onChange={(e) => personalForm.setData('phone_number', e.target.value)}
                                                placeholder="09XX XXX XXXX"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mobile Number</Label>
                                            <Input
                                                type="tel"
                                                value={personalForm.data.mobile_number}
                                                onChange={(e) => personalForm.setData('mobile_number', e.target.value)}
                                                placeholder="09XX XXX XXXX"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Address Line 1 *</Label>
                                        <Input
                                            value={personalForm.data.address_line_1}
                                            onChange={(e) => personalForm.setData('address_line_1', e.target.value)}
                                            placeholder="House/Unit No., Street Name"
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Address Line 2</Label>
                                        <Input
                                            value={personalForm.data.address_line_2}
                                            onChange={(e) => personalForm.setData('address_line_2', e.target.value)}
                                            placeholder="Barangay, Subdivision"
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>City *</Label>
                                            <Input
                                                value={personalForm.data.city}
                                                onChange={(e) => personalForm.setData('city', e.target.value)}
                                                placeholder="Quezon City"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Province/State</Label>
                                            <Input
                                                value={personalForm.data.state}
                                                onChange={(e) => personalForm.setData('state', e.target.value)}
                                                placeholder="Metro Manila"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Postal Code</Label>
                                            <Input
                                                value={personalForm.data.postal_code}
                                                onChange={(e) => personalForm.setData('postal_code', e.target.value)}
                                                placeholder="1100"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={personalForm.processing}
                                            className="bg-[#2596be] hover:bg-[#1e7a9f]"
                                        >
                                            {personalForm.processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                            ) : (
                                                <>Save & Continue<ChevronRight className="h-4 w-4 ml-2" /></>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Government IDs */}
                    {currentStep === 2 && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#2596be]">
                                    <CreditCard className="h-5 w-5" />
                                    Government IDs
                                </CardTitle>
                                <CardDescription>Provide your government-issued identification numbers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveGovIds(); }} className="space-y-4">
                                    <Alert className="border-[#2596be] bg-blue-50">
                                        <Info className="h-4 w-4 text-[#2596be]" />
                                        <AlertDescription className="text-blue-800">
                                            <strong>Note:</strong> All fields are optional. You can provide these details later if you don't have them yet.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <Label htmlFor="sss_number">SSS Number</Label>
                                        <Input
                                            id="sss_number"
                                            value={govIdForm.data.sss_number}
                                            onChange={(e) => govIdForm.setData('sss_number', e.target.value)}
                                            placeholder="XX-XXXXXXX-X"
                                            maxLength={15}
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                        />
                                        <p className="text-xs text-gray-500">Format: XX-XXXXXXX-X (10 digits)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tin_number">TIN Number</Label>
                                        <Input
                                            id="tin_number"
                                            value={govIdForm.data.tin_number}
                                            onChange={(e) => govIdForm.setData('tin_number', e.target.value)}
                                            placeholder="XXX-XXX-XXX-XXX"
                                            maxLength={20}
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                        />
                                        <p className="text-xs text-gray-500">Tax Identification Number</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hdmf_number">HDMF / Pag-IBIG Number</Label>
                                        <Input
                                            id="hdmf_number"
                                            value={govIdForm.data.hdmf_number}
                                            onChange={(e) => govIdForm.setData('hdmf_number', e.target.value)}
                                            placeholder="XXXXXXXXXXXX"
                                            maxLength={12}
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                        />
                                        <p className="text-xs text-gray-500">12 digits</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="philhealth_number">PhilHealth Number</Label>
                                        <Input
                                            id="philhealth_number"
                                            value={govIdForm.data.philhealth_number}
                                            onChange={(e) => govIdForm.setData('philhealth_number', e.target.value)}
                                            placeholder="XXXX-XXXXX-XX"
                                            maxLength={15}
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                        />
                                        <p className="text-xs text-gray-500">Format: XXXX-XXXXX-XX</p>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={govIdForm.processing}
                                            className="bg-[#2596be] hover:bg-[#1e7a9f]"
                                        >
                                            {govIdForm.processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                            ) : (
                                                <>Save & Continue<ChevronRight className="h-4 w-4 ml-2" /></>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Emergency Contact */}
                    {currentStep === 3 && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#2596be]">
                                    <Phone className="h-5 w-5" />
                                    Emergency Contact
                                </CardTitle>
                                <CardDescription>Who should we contact in case of emergency?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveEmergency(); }} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_name">Contact Name *</Label>
                                        <Input
                                            id="emergency_name"
                                            value={emergencyForm.data.name}
                                            onChange={(e) => emergencyForm.setData('name', e.target.value)}
                                            placeholder="Jane Doe"
                                            className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_phone">Phone Number *</Label>
                                            <Input
                                                id="emergency_phone"
                                                type="tel"
                                                value={emergencyForm.data.phone}
                                                onChange={(e) => emergencyForm.setData('phone', e.target.value)}
                                                placeholder="09XX XXX XXXX"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_mobile">Mobile Number</Label>
                                            <Input
                                                id="emergency_mobile"
                                                type="tel"
                                                value={emergencyForm.data.mobile}
                                                onChange={(e) => emergencyForm.setData('mobile', e.target.value)}
                                                placeholder="09XX XXX XXXX"
                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="relationship">Relationship *</Label>
                                        <Select
                                            value={emergencyForm.data.relationship}
                                            onValueChange={(value) => emergencyForm.setData('relationship', value)}
                                        >
                                            <SelectTrigger className="focus:ring-[#2596be]">
                                                <SelectValue placeholder="Select relationship..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="spouse">Spouse</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                                <SelectItem value="sibling">Sibling</SelectItem>
                                                <SelectItem value="child">Child</SelectItem>
                                                <SelectItem value="relative">Other Relative</SelectItem>
                                                <SelectItem value="friend">Friend</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={emergencyForm.processing}
                                            className="bg-[#2596be] hover:bg-[#1e7a9f]"
                                        >
                                            {emergencyForm.processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                            ) : (
                                                <>Save & Continue<ChevronRight className="h-4 w-4 ml-2" /></>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Upload Documents - FIXED MULTI-FILE UPLOAD */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Document Type Selector Grid */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#2596be]">
                                        <Upload className="h-5 w-5" />
                                        Upload Required Documents
                                    </CardTitle>
                                    <CardDescription>
                                        Select a document type below. You can upload multiple files for each type.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Document Type Grid with Status Indicators */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                        {Object.entries(requiredDocuments || {}).map(([key, doc]) => {
                                            const documentsForType = getDocumentsForType(key);
                                            const isSelected = selectedDocType === key;

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDocType(key);
                                                        documentForm.setData('document_type', key);
                                                        documentForm.setData('file', null);
                                                        documentForm.setData('description', '');
                                                    }}
                                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                        isSelected
                                                            ? 'border-[#2596be] bg-blue-50'
                                                            : documentsForType.length > 0
                                                                ? 'border-green-200 bg-green-50 hover:border-green-300'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className={`h-4 w-4 ${
                                                                    documentsForType.length > 0 ? 'text-green-600' : 'text-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-sm">
                                                {doc.label}
                                                                    {doc.required && <span className="text-red-600 ml-1">*</span>}
                                            </span>
                                                            </div>
                                                            {documentsForType.length > 0 && (
                                                                <div className="mt-2 ml-6">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {documentsForType.length} file{documentsForType.length !== 1 ? 's' : ''}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {documentsForType.length > 0 && (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Upload Form and Existing Files for Selected Type */}
                                    {selectedDocType ? (
                                        <div className="space-y-4">
                                            {/* Show existing files for this document type */}
                                            {getDocumentsForType(selectedDocType).length > 0 && (
                                                <Card className="border-green-200 bg-green-50">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-green-600" />
                                                            Uploaded Files for {requiredDocuments[selectedDocType]?.label}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        {getDocumentsForType(selectedDocType).map((doc) => (
                                                            <div
                                                                key={doc.id}
                                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="p-2 bg-green-100 rounded">
                                                                        <FileText className="h-4 w-4 text-green-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                                            {doc.filename}
                                                                        </p>
                                                                        {doc.description && (
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {doc.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <Badge className={`flex-shrink-0 ${
                                                                        doc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                                'bg-red-100 text-red-700 border-red-200'
                                                                    }`}>
                                                                        {doc.status === 'approved' ? (
                                                                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</>
                                                                        ) : doc.status === 'pending' ? (
                                                                            <><Clock className="h-3 w-3 mr-1" /> Pending</>
                                                                        ) : (
                                                                            <>Rejected</>
                                                                        )}
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                    className="text-red-600 hover:bg-red-50 ml-2 flex-shrink-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Upload New File Form */}
                                            <Card className="border-2 border-[#2596be]">
                                                <CardHeader>
                                                    <CardTitle className="text-base">
                                                        {getDocumentsForType(selectedDocType).length > 0
                                                            ? `Add Another File for ${requiredDocuments[selectedDocType]?.label}`
                                                            : `Upload ${requiredDocuments[selectedDocType]?.label}`
                                                        }
                                                    </CardTitle>
                                                    <CardDescription>
                                                        You can upload multiple files for this document type
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Select File *</Label>
                                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2596be] transition-colors">
                                                                <Input
                                                                    type="file"
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            documentForm.setData('file', file);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                    id="file-upload"
                                                                />
                                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        Click to upload or drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        PDF, JPG, PNG, DOC, DOCX • Max 10MB
                                                                    </p>
                                                                    {documentForm.data.file && (
                                                                        <p className="text-sm text-[#2596be] font-medium mt-2">
                                                                            ✓ {documentForm.data.file.name}
                                                                        </p>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Description (Optional)</Label>
                                                            <Textarea
                                                                value={documentForm.data.description}
                                                                onChange={(e) => documentForm.setData('description', e.target.value)}
                                                                placeholder="Additional notes about this document..."
                                                                rows={2}
                                                                className="focus:ring-[#2596be] focus:border-[#2596be]"
                                                            />
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const formData = new FormData();
                                                                formData.append('document_type', documentForm.data.document_type);
                                                                formData.append('file', documentForm.data.file);
                                                                formData.append('description', documentForm.data.description || '');

                                                                documentForm.post(route('guest.onboarding.upload-document', invite.token), {
                                                                    preserveScroll: true,
                                                                    data: formData,
                                                                    forceFormData: true, // ← Add this
                                                                    onSuccess: (response) => {
                                                                        // Clear only file and description, keep document_type
                                                                        documentForm.setData('file', null);
                                                                        documentForm.setData('description', '');
                                                                        // Reset file input
                                                                        const fileInput = document.getElementById('file-upload');
                                                                        if (fileInput) fileInput.value = '';
                                                                    },
                                                                    onError: (errors) => {
                                                                        console.error('Upload failed:', errors);
                                                                        alert('Upload failed: ' + (errors.file || errors.document_type || 'Unknown error'));
                                                                    },
                                                                });
                                                            }}
                                                            disabled={documentForm.processing || !documentForm.data.file}
                                                            className="w-full bg-[#2596be] hover:bg-[#1e7a9f]"
                                                        >
                                                            {documentForm.processing ? (
                                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                                                            ) : (
                                                                <><Upload className="h-4 w-4 mr-2" />Upload File</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ) : (
                                        <Alert className="border-gray-300">
                                            <Info className="h-4 w-4 text-gray-600" />
                                            <AlertDescription className="text-gray-700">
                                                👆 Select a document type above to start uploading
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* All Uploaded Documents - Grouped by Type */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>All Uploaded Documents ({submission?.documents?.length || 0})</span>
                                        <Badge className="bg-[#2596be] text-white">
                                            {getUploadedRequiredCount()}/{getRequiredDocsCount()} Required Types
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {submission?.documents && submission.documents.length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(requiredDocuments || {}).map(([key, doc]) => {
                                                const docsForType = getDocumentsForType(key);
                                                if (docsForType.length === 0) return null;

                                                return (
                                                    <div key={key} className="space-y-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <h4 className="font-semibold text-sm text-gray-700">
                                                                {doc.label}
                                                                {doc.required && <span className="text-red-600 ml-1">*</span>}
                                                            </h4>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {docsForType.length} file{docsForType.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2 pl-6">
                                                            {docsForType.map((document) => (
                                                                <div
                                                                    key={document.id}
                                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-[#2596be] transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className="p-2 bg-[#2596be] rounded-lg flex-shrink-0">
                                                                            <FileText className="h-4 w-4 text-white" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                                {document.filename}
                                                                            </p>
                                                                            {document.description && (
                                                                                <p className="text-xs text-gray-500 truncate">
                                                                                    {document.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <Badge className={`flex-shrink-0 border ${
                                                                            document.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                                document.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                                    'bg-red-100 text-red-700 border-red-200'
                                                                        }`}>
                                                                            {document.status === 'approved' ? (
                                                                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</>
                                                                            ) : document.status === 'pending' ? (
                                                                                <><Clock className="h-3 w-3 mr-1" /> Pending</>
                                                                            ) : (
                                                                                <>Rejected</>
                                                                            )}
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteDocument(document.id)}
                                                                        className="text-red-600 hover:bg-red-50 ml-2 flex-shrink-0"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Upload className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                                            <p className="text-lg font-medium">No documents uploaded yet</p>
                                            <p className="text-sm mt-1">Select a document type above to get started</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Final */}
                            <Card className="border-2 border-[#2596be] bg-gradient-to-br from-blue-50 to-white">
                                <CardContent className="pt-6">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2596be] rounded-full mb-4">
                                            <Send className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Ready to Submit?
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {getUploadedRequiredCount()} of {getRequiredDocsCount()} required document types completed
                                        </p>
                                    </div>

                                    {/* Missing Required Document Types Alert */}
                                    {getUploadedRequiredCount() < getRequiredDocsCount() && (
                                        <Alert className="mb-4 border-orange-300 bg-orange-50">
                                            <Info className="h-4 w-4 text-orange-600" />
                                            <AlertDescription className="text-orange-800">
                                                <strong>Missing required documents:</strong>
                                                <ul className="list-disc list-inside mt-2">
                                                    {Object.entries(requiredDocuments || {})
                                                        .filter(([key, doc]) => doc.required && !hasUpload(key))
                                                        .map(([key, doc]) => (
                                                            <li key={key}>{doc.label}</li>
                                                        ))
                                                    }
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setCurrentStep(3)}>
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleFinalSubmit}
                                            disabled={getUploadedRequiredCount() < getRequiredDocsCount()}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit to HR
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
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
                .animation-delay-100 {
                    animation-delay: 0.1s;
                }
            `}</style>
        </>
    );
}

