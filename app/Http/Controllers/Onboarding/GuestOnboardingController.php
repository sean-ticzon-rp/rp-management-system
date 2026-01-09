<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\OnboardingInvite;
use App\Services\Onboarding\OnboardingSubmissionService;
use App\Services\Onboarding\OnboardingDocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestOnboardingController extends Controller
{
    protected $submissionService;
    protected $documentService;

    public function __construct(
        OnboardingSubmissionService $submissionService,
        OnboardingDocumentService $documentService
    ) {
        $this->submissionService = $submissionService;
        $this->documentService = $documentService;
    }

    /**
     * Display the guest onboarding form
     */
    public function show($token)
    {
        $invite = OnboardingInvite::where('token', $token)
            ->with(['submission.documents']) // ✅ Load documents relationship
            ->firstOrFail();

        // Check if invite is valid
        if (!$invite->isValid()) {
            return Inertia::render('Guest/Onboarding/Expired', [
                'invite' => $invite,
            ]);
        }

        // Check if already approved
        if ($invite->status === 'approved') {
            return Inertia::render('Guest/Onboarding/Completed', [
                'invite' => $invite,
            ]);
        }

        // ✅ Load submission with documents and add document_type_label
        $submission = $invite->submission;
        if ($submission && $submission->documents) {
            $submission->documents->each(function($doc) {
                $doc->document_type_label = $doc->getDocumentTypeLabelAttribute();
            });
        }

        return Inertia::render('Guest/Onboarding/Form', [
            'invite' => $invite,
            'submission' => $submission,
            'requiredDocuments' => $this->documentService->getRequiredDocumentTypes(),
        ]);
    }

    /**
     * Display requirements checklist
     */
    public function checklist($token)
    {
        $invite = OnboardingInvite::where('token', $token)
            ->with(['submission.documents'])
            ->firstOrFail();

        if (!$invite->isValid()) {
            return redirect()->route('guest.onboarding.show', $token);
        }

        $checklist = $this->submissionService->getRequirementsChecklist($invite->submission);

        return Inertia::render('Guest/Onboarding/Checklist', [
            'invite' => $invite,
            'submission' => $invite->submission,
            'checklist' => $checklist,
        ]);
    }

    /**
     * Update personal information
     */
    public function updatePersonalInfo(Request $request, $token)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return response()->json(['error' => 'Invite expired or invalid'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birthday' => 'required|date',
            'gender' => 'required|in:male,female,other,prefer_not_to_say',
            'civil_status' => 'nullable|in:single,married,widowed,divorced,separated',
            'phone_number' => 'required|string|max:20',
            'mobile_number' => 'nullable|string|max:20',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        $this->submissionService->updatePersonalInfo($invite->submission, $validated);

        return back()->with('success', 'Personal information saved!');
    }

    /**
     * Update government IDs
     */
    public function updateGovernmentIds(Request $request, $token)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return response()->json(['error' => 'Invite expired or invalid'], 403);
        }

        $validated = $request->validate([
            'sss_number' => 'nullable|string|max:15',
            'tin_number' => 'nullable|string|max:20',
            'hdmf_number' => 'nullable|string|max:12',
            'philhealth_number' => 'nullable|string|max:15',
            'payroll_account' => 'nullable|string|max:12',
        ]);

        $this->submissionService->updateGovernmentIds($invite->submission, $validated);

        return back()->with('success', 'Government IDs saved!');
    }

    /**
     * Update emergency contact
     */
    public function updateEmergencyContact(Request $request, $token)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return response()->json(['error' => 'Invite expired or invalid'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'relationship' => 'required|string|max:100',
        ]);

        $this->submissionService->updateEmergencyContact($invite->submission, $validated);

        return back()->with('success', 'Emergency contact saved!');
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, $token)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return back()->with('error', 'Invite expired or invalid');
        }

        $validated = $request->validate([
            'document_type' => 'required|string|in:resume,government_id,sss_id,tin_id,philhealth_id,hdmf_pagibig_id,birth_certificate,nbi_clearance,pnp_clearance,medical_certificate,diploma,transcript,previous_employment_coe,other',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:51200', // 50MB
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $document = $this->documentService->uploadDocument(
                $invite->submission,
                $request->file('file'),
                $validated['document_type'],
                $validated['description'] ?? null
            );

            return back()->with('success', 'Document uploaded successfully!');

        } catch (\Exception $e) {
            return back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Delete uploaded document
     */
    public function deleteDocument($token, $documentId)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return back()->with('error', 'Invite expired or invalid');
        }

        $document = $invite->submission->documents()->findOrFail($documentId);

        try {
            $this->documentService->deleteDocument($document);

            return back()->with('success', 'Document deleted successfully!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Submit final onboarding form
     */
    public function submit($token)
    {
        $invite = OnboardingInvite::where('token', $token)->firstOrFail();

        if (!$invite->isValid()) {
            return back()->with('error', 'Invite expired or invalid');
        }

        try {
            $this->submissionService->submitOnboarding($invite->submission);

            return redirect()->route('guest.onboarding.checklist', $token)
                ->with('success', 'Onboarding submitted successfully! HR will review your submission.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
