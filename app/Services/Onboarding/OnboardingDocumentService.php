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
        \Log::info('Service: Starting upload', [
            'document_type' => $documentType,
            'filename' => $file->getClientOriginalName(),
        ]);

        try {
            // Store file
            $path = $file->store('onboarding-documents', 'private');
            \Log::info('Service: File stored', ['path' => $path]);

            // Create document record
            $document = OnboardingDocument::create([
                'submission_id' => $submission->id,
                'document_type' => $documentType,
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'description' => $description,
                'status' => 'approved',
            ]);
            \Log::info('Service: Document created', ['document_id' => $document->id]);

            // Update submission completion
            $submission->calculateCompletion();
            \Log::info('Service: Completion calculated');

            // Mark invite as in progress
            $submission->invite->markAsInProgress();
            \Log::info('Service: Upload complete');

            return $document;

        } catch (\Exception $e) {
            \Log::error('Service: Upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Replace/update an existing document
     */
    public function replaceDocument(
        OnboardingDocument $document,
        UploadedFile $newFile
    ) {
        // Delete old file
        $document->deleteFile();

        // Store new file
        $path = $newFile->store('onboarding-documents', 'private');

        // Update document record
        $document->update([
            'filename' => $newFile->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $newFile->getClientMimeType(),
            'size' => $newFile->getSize(),
            'status' => 'pending', // Reset to pending after reupload
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
        // Delete file from storage
        $document->deleteFile();

        // Get submission before deleting
        $submission = $document->submission;

        // Delete record
        $document->delete();

        // Recalculate completion
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
     * Get required documents list
     */
    public function getRequiredDocumentTypes()
    {
        return [
            'resume' => [
                'label' => 'Resume / CV',
                'required' => true,
                'description' => 'Your updated resume or curriculum vitae',
                'accepted' => '.pdf, .doc, .docx',
            ],
            'government_id' => [
                'label' => 'Government ID',
                'required' => true,
                'description' => 'Any valid government-issued ID',
                'accepted' => '.pdf, .jpg, .png',
            ],
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
            'medical_certificate' => [
                'label' => 'Medical Certificate',
                'required' => true,
                'description' => 'Recent medical examination results',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'sss_id' => [
                'label' => 'SSS ID',
                'required' => false,
                'description' => 'SSS UMID or E-card',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'tin_id' => [
                'label' => 'TIN ID',
                'required' => false,
                'description' => 'TIN card or BIR certificate',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'philhealth_id' => [
                'label' => 'PhilHealth ID',
                'required' => false,
                'description' => 'PhilHealth member card',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'hdmf_pagibig_id' => [
                'label' => 'HDMF / Pag-IBIG ID',
                'required' => false,
                'description' => 'Pag-IBIG member card',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'diploma' => [
                'label' => 'Diploma',
                'required' => false,
                'description' => 'Highest educational attainment',
                'accepted' => '.pdf, .jpg, .png',
            ],
            'transcript' => [
                'label' => 'Transcript of Records',
                'required' => false,
                'description' => 'Official transcript',
                'accepted' => '.pdf',
            ],
            'birth_certificate' => [
                'label' => 'Birth Certificate',
                'required' => false,
                'description' => 'PSA birth certificate',
                'accepted' => '.pdf, .jpg, .png',
            ],
        ];
    }
}
