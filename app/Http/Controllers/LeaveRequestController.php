<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display employee's own leave requests
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = LeaveRequest::with(['leaveType', 'manager'])
            ->where('user_id', $user->id);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by year
        $year = $request->get('year', now()->year);
        $query->whereYear('start_date', $year);

        $leaveRequests = $query->latest()->paginate(15)->withQueryString();

        // Get current year leave balances
        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get();

        // Get available years for filter
        $availableYears = LeaveRequest::where('user_id', $user->id)
            ->selectRaw('DISTINCT YEAR(start_date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('Leaves/MyLeaves', [
            'leaveRequests' => $leaveRequests,
            'leaveBalances' => $leaveBalances,
            'availableYears' => $availableYears,
            'currentYear' => $year,
            'filters' => $request->only(['status', 'year']),
        ]);
    }

    /**
     * Show the form for creating a new leave request
     */
    public function create()
    {
        $user = auth()->user();
        
        // Get available leave types for this user (considering gender)
        $leaveTypes = LeaveType::active()
            ->ordered()
            ->get()
            ->filter(function($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            });

        // Get current year balances
        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Leaves/Apply', [
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $user->load('manager'),
        ]);
    }

    /**
     * Store a newly created leave request
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'duration' => 'required|in:full_day,half_day_am,half_day_pm,custom_hours',
            'custom_start_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i',
            'custom_end_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i|after:custom_start_time',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'emergency_contact_name' => 'nullable|required_if:use_default_emergency_contact,false|string|max:255',
            'emergency_contact_phone' => 'nullable|required_if:use_default_emergency_contact,false|string|max:20',
            'use_default_emergency_contact' => 'boolean',
            'availability' => 'nullable|in:reachable,offline,emergency_only',
        ]);

        // Calculate total days
        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        // Check if user has sufficient balance
        $balance = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $validated['leave_type_id'])
            ->where('year', now()->year)
            ->first();

        if (!$balance || !$balance->hasSufficientBalance($totalDays)) {
            return back()->withInput()->with('error', 
                'Insufficient leave balance. You have ' . 
                ($balance ? $balance->remaining_days : 0) . 
                ' days remaining but requested ' . $totalDays . ' days.'
            );
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('leave-attachments', 'private');
        }

        // Set default emergency contact if requested
        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $user->emergency_contact_name;
            $validated['emergency_contact_phone'] = $user->emergency_contact_phone;
        }

        // Create leave request
        $leaveRequest = LeaveRequest::create([
            ...$validated,
            'user_id' => $user->id,
            'manager_id' => $user->manager_id,
            'total_days' => $totalDays,
            'status' => 'pending_manager',
        ]);

        // TODO: Send email to manager

        return redirect()->route('leaves.index')->with('success', 
            'Leave request submitted successfully! Your manager will review it.'
        );
    }

    /**
     * Display the specified leave request
     */
    public function show(LeaveRequest $leave)
    {
        // Ensure user can only view their own requests
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        $leave->load([
            'leaveType',
            'manager',
            'managerApprover',
            'hrApprover'
        ]);

        return Inertia::render('Leaves/Show', [
            'leaveRequest' => $leave,
        ]);
    }

    /**
     * Cancel a pending leave request
     */
    public function cancel(LeaveRequest $leave)
    {
        // Ensure user can only cancel their own requests
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if (!$leave->canBeCancelled()) {
            return back()->with('error', 'This leave request cannot be cancelled.');
        }

        $leave->update(['status' => 'cancelled']);

        return back()->with('success', 'Leave request cancelled successfully.');
    }

    /**
     * Appeal a rejected leave request
     */
    public function appeal(Request $request, LeaveRequest $leave)
    {
        // Ensure user can only appeal their own requests
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if (!$leave->canBeAppealed()) {
            return back()->with('error', 'This leave request cannot be appealed.');
        }

        $validated = $request->validate([
            'appeal_reason' => 'required|string|max:1000',
        ]);

        $leave->appeal($validated['appeal_reason']);

        return back()->with('success', 
            'Your appeal has been submitted to HR for review.'
        );
    }

    /**
     * Calculate total leave days based on duration type
     */
    private function calculateTotalDays($startDate, $endDate, $duration)
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        // Get number of days between dates (inclusive)
        $daysBetween = $start->diffInDays($end) + 1;

        // Calculate based on duration type
        switch ($duration) {
            case 'half_day_am':
            case 'half_day_pm':
                return 0.5; // Always 0.5 days for half-day
            
            case 'custom_hours':
                // For custom hours, we'll calculate based on 8-hour workday
                // This is simplified - you may want more complex logic
                return 0.5; // Default to half day for custom hours
            
            case 'full_day':
            default:
                return $daysBetween;
        }
    }
}