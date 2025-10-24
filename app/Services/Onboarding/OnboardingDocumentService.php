<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingDocument;
use App\Models\OnboardingSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class OnboardingDocumentService
{
    /**
     * Upload a new document
     */
    public function uploadDocument(
        OnboardingSubmission $submission,
        UploadedFile $file,
        string $documentType,
        ?string $description = null
    ) {
        $path = $file->store('onboarding-documents', 'private');
        
        $document = OnboardingDocument::create([
            'submission_id' => $submission->id,
            'document_type' => $documentType,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'description' => $description,
            'status' => 'pending',
        ]);
        
        $submission->calculateCompletion();
        $submission->invite->markAsInProgress();
        
        return $document;
    }

    /**
     * Replace/update an existing document
     */
    public function replaceDocument(
        OnboardingDocument $document,
        UploadedFile $newFile
    ) {
        $document->deleteFile();
        $path = $newFile->store('onboarding-documents', 'private');
        
        $document->update([
            'filename' => $newFile->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $newFile->getClientMimeType(),
            'size' => $newFile->getSize(),
            'status' => 'pending',
            'rejection_reason' => null,
            'verified_at' => null,
            'verified_by' => null,
        ]);
        
        return $document;
    }

    /**
     * Delete a document
     */
    public function deleteDocument(OnboardingDocument $document)
    {
        $document->deleteFile();
        $submission = $document->submission;
        $document->delete();
        $submission->calculateCompletion();
        
        return true;
    }

    /**
     * Approve a document (HR action)
     */
    public function approveDocument(OnboardingDocument $document)
    {
        $document->approve();
        return $document;
    }

    /**
     * Reject a document (HR action)
     */
    public function rejectDocument(OnboardingDocument $document, string $reason)
    {
        $document->reject($reason);
        // TODO: Send notification to candidate
        return $document;
    }

    /**
     * Bulk approve documents
     */
    public function bulkApproveDocuments(array $documentIds)
    {
        $documents = OnboardingDocument::whereIn('id', $documentIds)->get();
        
        foreach ($documents as $document) {
            $document->approve();
        }
        
        return $documents->count();
    }

    /**
     * ✅ UPDATED: Only NBI and PNP Clearance required
     */
    public function getRequiredDocumentTypes()
    {
        return [
            'nbi_clearance' => [
                'label' => 'NBI Clearance',
                'required' => true,
                'description' => 'Valid NBI clearance certificate',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'pnp_clearance' => [
                'label' => 'PNP Clearance',
                'required' => true,
                'description' => 'Valid PNP/Police clearance certificate',
                'accepted' => '.pdf, .jpg, .png',
            ],
            // ✅ Optional documents (if they want to upload early)
            'resume' => [
                'label' => 'Resume / CV (Optional)',
                'required' => false,
                'description' => 'Your updated resume - can be submitted later',
                'accepted' => '.pdf, .doc, .docx',
            ],
            'government_id' => [
                'label' => 'Government ID (Optional)',
                'required' => false,
                'description' => 'Any valid ID - can be submitted later',
                'accepted' => '.pdf, .jpg, .png',
            ],
        ];
    }
}