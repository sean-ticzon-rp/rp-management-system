<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingSubmission;
use App\Models\OnboardingInvite;
use Illuminate\Support\Facades\DB;

class OnboardingSubmissionService
{
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
     * Get checklist of requirements
     */
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