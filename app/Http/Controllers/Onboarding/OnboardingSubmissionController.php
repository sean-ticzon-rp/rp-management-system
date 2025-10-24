<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\OnboardingSubmission;
use App\Models\OnboardingDocument;
use App\Services\Onboarding\OnboardingSubmissionService;
use App\Services\Onboarding\OnboardingDocumentService;
use Illuminate\Http\Request;
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
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can review onboarding submissions.');
        }

        $query = OnboardingSubmission::with(['invite', 'documents']);

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

        $stats = [
            'total' => OnboardingSubmission::count(),
            'draft' => OnboardingSubmission::draft()->count(),
            'submitted' => OnboardingSubmission::submitted()->count(),
            'under_review' => OnboardingSubmission::underReview()->count(),
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
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403, 'Only HR can review onboarding submissions.');
        }

        $submission->load([
            'invite',
            'documents',
            'reviewer'
        ]);

        $checklist = $this->submissionService->getRequirementsChecklist($submission);

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
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        try {
            $this->documentService->approveDocument($document);
            
            return back()->with('success', 'Document approved!');
            
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject a document
     */
    public function rejectDocument(Request $request, OnboardingDocument $document)
    {
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

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
     * Approve entire submission
     */
    public function approve(Request $request, OnboardingSubmission $submission)
    {
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        $validated = $request->validate([
            'hr_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->submissionService->approveSubmission($submission, $validated['hr_notes'] ?? null);
            
            return back()->with('success', 'Submission approved! You can now convert this to a user account.');
            
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject submission (request revisions)
     */
    public function reject(Request $request, OnboardingSubmission $submission)
    {
        // Check permission
        if (!auth()->user()->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count()) {
            abort(403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        try {
            $this->submissionService->rejectSubmission($submission, $validated['rejection_reason']);
            
            return back()->with('success', 'Submission rejected. Candidate has been notified to make revisions.');
            
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}