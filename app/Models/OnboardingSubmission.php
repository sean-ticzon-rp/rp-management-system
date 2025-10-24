<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'invite_id',
        'personal_info',
        'government_ids',
        'emergency_contact',
        'additional_info',
        'completion_percentage',
        'completed_sections',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'hr_notes',
    ];

    protected $casts = [
        'personal_info' => 'array',
        'government_ids' => 'array',
        'emergency_contact' => 'array',
        'additional_info' => 'array',
        'completed_sections' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * The invite this submission belongs to
     */
    public function invite()
    {
        return $this->belongsTo(OnboardingInvite::class, 'invite_id');
    }

    /**
     * HR user who reviewed the submission
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Uploaded documents
     */
    public function documents()
    {
        return $this->hasMany(OnboardingDocument::class, 'submission_id');
    }

    /**
     * Pending documents (waiting for HR review)
     */
    public function pendingDocuments()
    {
        return $this->hasMany(OnboardingDocument::class, 'submission_id')
                    ->where('status', 'pending');
    }

    /**
     * Approved documents
     */
    public function approvedDocuments()
    {
        return $this->hasMany(OnboardingDocument::class, 'submission_id')
                    ->where('status', 'approved');
    }

    /**
     * Rejected documents
     */
    public function rejectedDocuments()
    {
        return $this->hasMany(OnboardingDocument::class, 'submission_id')
                    ->where('status', 'rejected');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Calculate completion percentage based on filled fields
     */
    public function calculateCompletion()
    {
        $sections = [
            'personal_info' => $this->personal_info ? 20 : 0,
            'government_ids' => $this->government_ids ? 20 : 0,
            'emergency_contact' => $this->emergency_contact ? 20 : 0,
            'documents' => $this->hasRequiredDocuments() ? 40 : 0,
        ];

        $total = array_sum($sections);
        
        $this->update(['completion_percentage' => $total]);
        
        return $total;
    }

    /**
     * ✅ UPDATED: Check if REQUIRED documents are uploaded (only NBI & PNP)
     */
    public function hasRequiredDocuments()
    {
        $requiredTypes = ['nbi_clearance', 'pnp_clearance']; // Only these 2!
        $uploadedTypes = $this->documents()->pluck('document_type')->toArray();
        
        foreach ($requiredTypes as $type) {
            if (!in_array($type, $uploadedTypes)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * ✅ UPDATED: Get missing required documents
     */
    public function getMissingDocuments()
    {
        $requiredTypes = [
            'nbi_clearance' => 'NBI Clearance',
            'pnp_clearance' => 'PNP Clearance',
        ];
        
        $uploadedTypes = $this->documents()->pluck('document_type')->toArray();
        
        $missing = [];
        foreach ($requiredTypes as $type => $label) {
            if (!in_array($type, $uploadedTypes)) {
                $missing[$type] = $label;
            }
        }
        
        return $missing;
    }   

    /**
     * Mark section as completed
     */
    public function markSectionComplete($sectionName)
    {
        $completed = $this->completed_sections ?? [];
        
        if (!in_array($sectionName, $completed)) {
            $completed[] = $sectionName;
            $this->update(['completed_sections' => $completed]);
        }
        
        $this->calculateCompletion();
    }

    /**
     * Check if submission is complete (ready to submit)
     */
    public function isComplete()
    {
        return $this->completion_percentage >= 100;
    }

    /**
     * Submit the onboarding form
     */
    public function submit()
    {
        if (!$this->isComplete()) {
            throw new \Exception('Cannot submit incomplete onboarding form.');
        }

        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Update invite status
        $this->invite->markAsSubmitted();
    }

    /**
     * Convert submission data to user array (for creating User account)
     */
    public function toUserArray()
    {
        $personal = $this->personal_info ?? [];
        $govIds = $this->government_ids ?? [];
        $emergency = $this->emergency_contact ?? [];

        return [
            // Personal Info
            'first_name' => $personal['first_name'] ?? null,
            'middle_name' => $personal['middle_name'] ?? null,
            'last_name' => $personal['last_name'] ?? null,
            'suffix' => $personal['suffix'] ?? null,
            'name' => trim(($personal['first_name'] ?? '') . ' ' . ($personal['middle_name'] ?? '') . ' ' . ($personal['last_name'] ?? '')),
            'birthday' => $personal['birthday'] ?? null,
            'gender' => $personal['gender'] ?? null,
            'civil_status' => $personal['civil_status'] ?? null,
            
            // Contact
            'personal_email' => $this->invite->email,
            'phone_number' => $personal['phone_number'] ?? null,
            'personal_mobile' => $personal['mobile_number'] ?? null,
            
            // Address
            'address_line_1' => $personal['address_line_1'] ?? null,
            'address_line_2' => $personal['address_line_2'] ?? null,
            'city' => $personal['city'] ?? null,
            'state' => $personal['state'] ?? null,
            'postal_code' => $personal['postal_code'] ?? null,
            'country' => $personal['country'] ?? 'Philippines',
            
            // Government IDs
            'sss_number' => $govIds['sss_number'] ?? null,
            'tin_number' => $govIds['tin_number'] ?? null,
            'hdmf_number' => $govIds['hdmf_number'] ?? null,
            'philhealth_number' => $govIds['philhealth_number'] ?? null,
            'payroll_account' => $govIds['payroll_account'] ?? null,
            
            // Emergency Contact
            'emergency_contact_name' => $emergency['name'] ?? null,
            'emergency_contact_phone' => $emergency['phone'] ?? null,
            'emergency_contact_mobile' => $emergency['mobile'] ?? null,
            'emergency_contact_relationship' => $emergency['relationship'] ?? null,
            
            // Employment (from invite)
            'position' => $this->invite->position,
            'department' => $this->invite->department,
            'employment_status' => 'active',
            'account_status' => 'active',
            
            // Default password (must change on first login)
            'password' => bcrypt('ChangeMe123!'),
            'email_verified_at' => now(),
        ];
    }
}