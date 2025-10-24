// resources/js/Pages/Guest/Onboarding/Form.jsx
// ✅ FINAL VERSION - With proper Alert Dialog and no console logs

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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
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
    AlertTriangle,
} from 'lucide-react';

export default function Form({ invite, submission, requiredDocuments }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

    // Document Upload Form
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large. Maximum size is 10MB.');
                e.target.value = '';
                return;
            }
            
            setSelectedFile(file);
            documentForm.setData('file', file);
        }
    };

    const handleUploadDocument = (e) => {
        e.preventDefault();
        
        if (!documentForm.data.file) {
            alert('Please select a file to upload');
            return;
        }
        
        if (!documentForm.data.document_type) {
            alert('Please select a document type');
            return;
        }
        
        documentForm.post(route('guest.onboarding.upload-document', invite.token), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset form
                documentForm.reset();
                setSelectedFile(null);
                
                // Reset file input
                const fileInput = document.getElementById('file-upload-input');
                if (fileInput) fileInput.value = '';
            },
            onError: (errors) => {
                alert('Upload failed: ' + (errors.file?.[0] || errors.document_type?.[0] || 'Unknown error'));
            },
        });
    };

    const openDeleteDialog = (doc) => {
        setDocumentToDelete(doc);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (documentToDelete) {
            router.delete(route('guest.onboarding.delete-document', [invite.token, documentToDelete.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setDocumentToDelete(null);
                },
            });
        }
    };

    const handleFinalSubmit = () => {
        if (!submission || submission.completion_percentage < 100) {
            alert('Please complete all sections before submitting.');
            return;
        }
        
        router.post(route('guest.onboarding.submit', invite.token), {}, {
            onSuccess: () => {
                // Will redirect to checklist page
            },
        });
    };

    return (
        <>
            <Head title="Complete Your Onboarding" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center animate-fade-in">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-4xl font-bold text-gray-900">
                                    Welcome to Rocket Partners!
                                </h1>
                                <p className="text-lg text-gray-600 mt-1">
                                    {invite.full_name || 'Complete your onboarding'}
                                </p>
                            </div>
                        </div>
                        
                        {invite.position && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border px-4 py-1.5 text-base">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    {invite.position}
                                </Badge>
                                {invite.department && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 border px-4 py-1.5 text-base">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        {invite.department}
                                    </Badge>
                                )}
                            </div>
                        )}
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
                                                    isActive ? 'bg-blue-600 border-blue-600' :
                                                    'bg-gray-100 border-gray-300'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                                    ) : (
                                                        <StepIcon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                                    )}
                                                </div>
                                                <p className={`text-sm mt-2 font-medium ${
                                                    isActive ? 'text-blue-600' : 
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
                                <CardTitle className="flex items-center gap-2">
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
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Middle Name</Label>
                                            <Input
                                                value={personalForm.data.middle_name}
                                                onChange={(e) => personalForm.setData('middle_name', e.target.value)}
                                                placeholder="Michael"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name *</Label>
                                            <Input
                                                value={personalForm.data.last_name}
                                                onChange={(e) => personalForm.setData('last_name', e.target.value)}
                                                placeholder="Doe"
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
                                                <SelectTrigger>
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
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Gender *</Label>
                                            <Select 
                                                value={personalForm.data.gender} 
                                                onValueChange={(value) => personalForm.setData('gender', value)}
                                            >
                                                <SelectTrigger>
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
                                            <SelectTrigger>
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
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Address Line 1 *</Label>
                                        <Input
                                            value={personalForm.data.address_line_1}
                                            onChange={(e) => personalForm.setData('address_line_1', e.target.value)}
                                            placeholder="House/Unit No., Street Name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Address Line 2</Label>
                                        <Input
                                            value={personalForm.data.address_line_2}
                                            onChange={(e) => personalForm.setData('address_line_2', e.target.value)}
                                            placeholder="Barangay, Subdivision"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>City *</Label>
                                            <Input
                                                value={personalForm.data.city}
                                                onChange={(e) => personalForm.setData('city', e.target.value)}
                                                placeholder="Quezon City"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Province/State</Label>
                                            <Input
                                                value={personalForm.data.state}
                                                onChange={(e) => personalForm.setData('state', e.target.value)}
                                                placeholder="Metro Manila"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Postal Code</Label>
                                            <Input
                                                value={personalForm.data.postal_code}
                                                onChange={(e) => personalForm.setData('postal_code', e.target.value)}
                                                placeholder="1100"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={personalForm.processing}
                                            className="bg-blue-600 hover:bg-blue-700"
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
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Government IDs
                                </CardTitle>
                                <CardDescription>Provide your government-issued identification numbers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveGovIds(); }} className="space-y-4">
                                    <Alert className="border-blue-200 bg-blue-50">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            <strong>Note:</strong> All fields are optional for now. You can provide these details later if you don't have them yet.
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
                                            className="bg-blue-600 hover:bg-blue-700"
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
                                <CardTitle className="flex items-center gap-2">
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
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="relationship">Relationship *</Label>
                                        <Select 
                                            value={emergencyForm.data.relationship} 
                                            onValueChange={(value) => emergencyForm.setData('relationship', value)}
                                        >
                                            <SelectTrigger>
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
                                            className="bg-blue-600 hover:bg-blue-700"
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

                    {/* Step 4: Upload Documents */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Upload Required Documents
                                    </CardTitle>
                                    <CardDescription>
                                        Upload your requirements (Resume, IDs, NBI & PNP Clearance, Medical Cert)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUploadDocument} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Document Type *</Label>
                                            <Select 
                                                value={documentForm.data.document_type} 
                                                onValueChange={(value) => documentForm.setData('document_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select document type..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(requiredDocuments || {}).map(([key, doc]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4" />
                                                                {doc.label}
                                                                {doc.required && <span className="text-red-600 ml-1">*</span>}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Upload File *</Label>
                                            <Input
                                                id="file-upload-input"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={handleFileChange}
                                            />
                                            {selectedFile && (
                                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                                                        <p className="text-xs text-blue-700">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Accepted: PDF, JPG, PNG, DOC, DOCX • Max 10MB
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description (Optional)</Label>
                                            <Textarea
                                                value={documentForm.data.description}
                                                onChange={(e) => documentForm.setData('description', e.target.value)}
                                                placeholder="Additional notes..."
                                                rows={2}
                                            />
                                        </div>

                                        {documentForm.errors.file && (
                                            <Alert className="border-red-200 bg-red-50">
                                                <AlertDescription className="text-red-800">
                                                    {documentForm.errors.file}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <Button 
                                            type="submit" 
                                            disabled={documentForm.processing || !documentForm.data.file || !documentForm.data.document_type}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {documentForm.processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                                            ) : (
                                                <><Upload className="h-4 w-4 mr-2" />Upload Document</>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Uploaded Documents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Uploaded Documents ({submission?.documents?.length || 0})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {submission?.documents && submission.documents.length > 0 ? (
                                        <div className="space-y-3">
                                            {submission.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{doc.document_type_label}</p>
                                                            <p className="text-sm text-gray-500">{doc.filename}</p>
                                                        </div>
                                                        <Badge className={`border ${
                                                            doc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                            'bg-red-100 text-red-700 border-red-200'
                                                        }`}>
                                                            {doc.status}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(doc)}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            <p>No documents uploaded yet</p>
                                            <p className="text-sm mt-1">Upload your first document using the form above</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setCurrentStep(3)}>
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button 
                                            onClick={handleFinalSubmit}
                                            disabled={!submission || submission?.completion_percentage < 100}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit to HR
                                        </Button>
                                    </div>
                                    {submission && submission.completion_percentage < 100 && (
                                        <p className="text-sm text-orange-600 text-center mt-3">
                                            Complete all sections ({submission.completion_percentage}% complete)
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Footer */}
                    <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Auto-saved.</strong> Valid until {new Date(invite.expires_at).toLocaleDateString()}.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>

            {/* ✅ Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Delete Document?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{documentToDelete?.document_type_label}</strong>?
                            <br />
                            <span className="text-sm text-gray-600">({documentToDelete?.filename})</span>
                            <br /><br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDeleteDialog(false);
                            setDocumentToDelete(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}