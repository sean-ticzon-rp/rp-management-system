<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class OnboardingDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'submission_id',
        'document_type',
        'filename',
        'path',
        'mime_type',
        'size',
        'description',
        'status',
        'rejection_reason',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * The submission this document belongs to
     */
    public function submission()
    {
        return $this->belongsTo(OnboardingSubmission::class, 'submission_id');
    }

    /**
     * HR user who verified the document
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get the document URL
     */
    public function getUrlAttribute()
    {
        return Storage::url($this->path);
    }

    /**
     * Get human-readable file size
     */
    public function getFileSizeAttribute()
    {
        $bytes = $this->size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Get document type label
     */
    public function getDocumentTypeLabelAttribute()
    {
        return match($this->document_type) {
            'resume' => 'Resume / CV',
            'government_id' => 'Government ID',
            'sss_id' => 'SSS ID',
            'tin_id' => 'TIN ID',
            'philhealth_id' => 'PhilHealth ID',
            'hdmf_pagibig_id' => 'HDMF / Pag-IBIG ID',
            'birth_certificate' => 'Birth Certificate',
            'nbi_clearance' => 'NBI Clearance',
            'pnp_clearance' => 'PNP Clearance',
            'police_clearance' => 'Police Clearance',
            'medical_certificate' => 'Medical Certificate',
            'diploma' => 'Diploma',
            'transcript' => 'Transcript of Records',
            'previous_employment_coe' => 'Certificate of Employment',
            'other' => 'Other Document',
            default => 'Unknown Document',
        };
    }

    /**
     * Approve the document
     */
    public function approve($verifiedBy = null)
    {
        $this->update([
            'status' => 'approved',
            'verified_at' => now(),
            'verified_by' => $verifiedBy ?? auth()->id(),
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject the document
     */
    public function reject($reason, $rejectedBy = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'verified_at' => now(),
            'verified_by' => $rejectedBy ?? auth()->id(),
        ]);
    }

    /**
     * Delete document file from storage
     */
    public function deleteFile()
    {
        if ($this->path && Storage::exists($this->path)) {
            Storage::delete($this->path);
        }
    }

    /**
     * Get status color for badge
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'expired' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Check if document is an image
     */
    public function isImage()
    {
        return in_array($this->mime_type, [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ]);
    }

    /**
     * Check if document is a PDF
     */
    public function isPdf()
    {
        return $this->mime_type === 'application/pdf';
    }
}