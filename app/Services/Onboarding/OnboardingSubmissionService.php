<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingSubmission;
use App\Models\OnboardingInvite;
use Illuminate\Support\Facades\DB;

class OnboardingSubmissionService
{
    public function updatePersonalInfo(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'personal_info' => $data,
        ]);
        
        $submission->markSectionComplete('personal_info');
        
        return $submission;
    }

    public function updateGovernmentIds(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'government_ids' => $data,
        ]);
        
        $submission->markSectionComplete('government_ids');
        
        return $submission;
    }

    public function updateEmergencyContact(OnboardingSubmission $submission, array $data)
    {
        $submission->update([
            'emergency_contact' => $data,
        ]);
        
        $submission->markSectionComplete('emergency_contact');
        
        return $submission;
    }

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
     * ✅ NEW: Approve submission (HR action)
     */
    public function approveSubmission(OnboardingSubmission $submission, ?string $hrNotes = null)
    {
        if ($submission->status !== 'submitted') {
            throw new \Exception('Can only approve submitted submissions.');
        }

        $submission->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'hr_notes' => $hrNotes,
        ]);

        // TODO: Send approval email to candidate

        return $submission;
    }

    /**
     * ✅ NEW: Reject submission (request revisions)
     */
    public function rejectSubmission(OnboardingSubmission $submission, string $reason)
    {
        if ($submission->status !== 'submitted') {
            throw new \Exception('Can only reject submitted submissions.');
        }

        $submission->update([
            'status' => 'draft', // Send back to draft for revisions
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'hr_notes' => $reason,
        ]);

        // Set invite back to in_progress
        $submission->invite->update(['status' => 'in_progress']);

        // TODO: Send revision request email to candidate

        return $submission;
    }

    public function getRequirementsChecklist(OnboardingSubmission $submission)
    {
        return [
            [
                'section' => 'Personal Information',
                'completed' => !empty($submission->personal_info),
                'required' => true,
            ],
            [
                'section' => 'Government IDs',
                'completed' => !empty($submission->government_ids),
                'required' => true,
            ],
            [
                'section' => 'Emergency Contact',
                'completed' => !empty($submission->emergency_contact),
                'required' => true,
            ],
            [
                'section' => 'Required Documents',
                'completed' => $submission->hasRequiredDocuments(),
                'required' => true,
            ],
        ];
    }
}