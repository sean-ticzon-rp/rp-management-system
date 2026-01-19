<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingSubmission;
use App\Models\OnboardingInvite;
use Illuminate\Support\Facades\DB;

class OnboardingSubmissionService
{
    protected $documentService;

    public function __construct(OnboardingDocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Update personal information section
     */
    public function updatePersonalInfo(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'personal_info' => $data,
        ]);

        $submission->markSectionComplete('personal_info');

        return $submission;
    }

    /**
     * Update government IDs section
     */
    public function updateGovernmentIds(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'government_ids' => $data,
        ]);

        $submission->markSectionComplete('government_ids');

        return $submission;
    }

    /**
     * Update emergency contact section
     */
    public function updateEmergencyContact(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'emergency_contact' => $data,
        ]);

        $submission->markSectionComplete('emergency_contact');

        return $submission;
    }

    /**
     * Submit the onboarding form (final submission)
     */
    public function submitOnboarding(OnboardingSubmission $submission)
    {
        if (!$submission->isComplete()) {
            throw new \Exception('Cannot submit incomplete onboarding. Completion: ' . $submission->completion_percentage . '%');
        }

        DB::beginTransaction();

        try {
            $submission->submit();
            DB::commit();
            return $submission;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get requirements checklist for display
     * Returns format expected by Checklist.jsx component
     */
    public function getRequirementsChecklist(OnboardingSubmission $submission)
    {
        $checklist = [];

        // 1. Personal Info
        $checklist['personal_info'] = [
            'label' => 'Personal Information',
            'status' => $submission->personal_info ? 'complete' : 'missing',
            'message' => $submission->personal_info
                ? 'All personal details submitted'
                : 'Personal information not provided',
        ];

        // 2. Government IDs
        $checklist['government_ids'] = [
            'label' => 'Government IDs',
            'status' => $submission->government_ids ? 'complete' : 'missing',
            'message' => $submission->government_ids
                ? 'Government ID information provided'
                : 'Government IDs not provided',
        ];

        // 3. Emergency Contact
        $checklist['emergency_contact'] = [
            'label' => 'Emergency Contact',
            'status' => $submission->emergency_contact ? 'complete' : 'missing',
            'message' => $submission->emergency_contact
                ? 'Emergency contact information provided'
                : 'Emergency contact not provided',
        ];

        // 4. Required Documents - Uses documentService to check
        $requiredDocs = collect($this->documentService->getRequiredDocumentTypes())
            ->filter(fn($doc) => $doc['required'])
            ->keys();

        $uploadedTypes = $submission->documents->pluck('document_type')->unique();
        $missingDocs = $requiredDocs->diff($uploadedTypes);

        if ($missingDocs->isEmpty()) {
            $checklist['documents'] = [
                'label' => 'Required Documents',
                'status' => 'complete',
                'message' => 'All required documents uploaded (' . $submission->documents->count() . ' files)',
            ];
        } else {
            $checklist['documents'] = [
                'label' => 'Required Documents',
                'status' => 'pending',
                'message' => $missingDocs->count() . ' required document type(s) missing: ' . $missingDocs->implode(', '),
            ];
        }

        return $checklist;
    }
}
