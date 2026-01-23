<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\OnboardingSubmission;
use App\Models\OnboardingDocument;
use App\Services\Onboarding\OnboardingSubmissionService;
use App\Services\Onboarding\OnboardingDocumentService;
use App\Http\Resources\OnboardingChecklistResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingSubmissionController extends Controller
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
     * Display all submissions for HR review
     */
    public function index(Request $request)
    {
        // Policy authorization - automatically checks with OnboardingSubmissionPolicy
        $this->authorize('viewAny', OnboardingSubmission::class);

        // Build query with eager loading (prevent N+1)
        $query = OnboardingSubmission::with(['invite', 'documents', 'reviewer']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by candidate email/name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('invite', function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $submissions = $query->latest()->paginate(15)->withQueryString();

        // Get stats (consider caching these for better performance)
        $stats = [
            'total' => OnboardingSubmission::count(),
            'draft' => OnboardingSubmission::draft()->count(),
            'approved' => OnboardingSubmission::approved()->count(),
        ];

        return Inertia::render('Admin/Onboarding/Submissions/Index', [
            'submissions' => $submissions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Review a specific submission
     */
    public function review(OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('review', $submission);

        // Eager load relationships to prevent N+1 queries
        $submission->load([
            'invite',
            'documents',
            'reviewer'
        ]);

        // Transform documents for frontend
        $submission->documents->each(function($doc) {
            // These accessors are already defined in model
            $doc->append(['file_size', 'document_type_label']);

            // Add URLs (consider moving to API Resource)
            $doc->download_url = route('onboarding.submissions.download-document', $doc->id);
            $doc->view_url = route('onboarding.submissions.view-document', $doc->id);
        });

        $checklist = new OnboardingChecklistResource($submission);

        return Inertia::render('Admin/Onboarding/Submissions/Review', [
            'submission' => $submission,
            'checklist' => $checklist,
        ]);
    }

    /**
     * Approve a document
     */
    public function approveDocument(OnboardingDocument $document)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        try {
            $this->documentService->approveDocument($document);

            return back()->with('success', 'Document approved!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Approve entire submission
     */
    public function approve(Request $request, OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('finalize', $submission);

        $validated = $request->validate([
            'hr_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->submissionService->finalizeOnboarding($submission, $validated['hr_notes'] ?? null);

            return back()->with('success', 'Submission approved! You can now convert this to a user account.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject/request revisions for a submission
     */
    public function reject(Request $request, OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('finalize', $submission);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        try {
            // Update submission status back to draft and add rejection note
            $submission->update([
                'status' => OnboardingSubmission::STATUS_DRAFT,
                'hr_notes' => $validated['rejection_reason'],
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            // Optionally send notification email to candidate
            // Notify::send($submission->invite, new OnboardingRevisionRequested($submission));

            return back()->with('success', 'Revision request sent to candidate.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a document
     */
    public function rejectDocument(Request $request, OnboardingDocument $document)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        try {
            $this->documentService->rejectDocument($document, $validated['rejection_reason']);

            return back()->with('success', 'Document rejected. Candidate will be notified.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Bulk approve all uploaded documents for a submission
     */
    public function bulkApproveDocuments(OnboardingSubmission $submission)
    {
        // Policy authorization
        $this->authorize('approveDocument', OnboardingSubmission::class);

        try {
            // Use transaction for atomic operation
            $count = DB::transaction(function() use ($submission) {
                // Get count first
                $count = $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_UPLOADED)
                    ->count();

                if ($count === 0) {
                    throw new \Exception('No documents waiting for approval.');
                }

                // Bulk update - single query instead of loop
                $submission->documents()
                    ->where('status', OnboardingDocument::STATUS_UPLOADED)
                    ->update([
                        'status' => OnboardingDocument::STATUS_APPROVED,
                        'verified_at' => now(),
                        'verified_by' => auth()->id(),
                        'rejection_reason' => null,
                    ]);

                return $count;
            });

            return back()->with('success', "Approved {$count} document(s)!");

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
