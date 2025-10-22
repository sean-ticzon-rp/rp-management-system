<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Models\User;
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
        
        $query = LeaveRequest::with(['leaveType', 'managerApprover'])
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

        return Inertia::render('Employees/Leaves/MyLeaves', [
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
        
        $leaveTypes = LeaveType::active()
            ->ordered()
            ->get()
            ->filter(function($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            })
            ->values();

        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Employees/Leaves/Apply', [
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $user,
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
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
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

        // ✅ Create leave request - No manager assignment, open queue
        LeaveRequest::create([
            ...$validated,
            'user_id' => $user->id,
            'total_days' => $totalDays,
            'status' => 'pending_manager',
            'manager_id' => null, // ✅ NULL - No specific assignment
        ]);

        return redirect()->route('my-leaves.index')->with('success', 
            'Leave request submitted successfully! Waiting for approval.'
        );
    }

    /**
     * Display the specified leave request
     */
    public function show(LeaveRequest $leave)
    {
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        $leave->load([
            'leaveType',
            'managerApprover',
            'hrApprover'
        ]);

        return Inertia::render('Employees/Leaves/Show', [
            'leaveRequest' => $leave,
        ]);
    }

    /**
     * Show the form for editing a leave request
     */
    public function edit(LeaveRequest $leave)
    {
        $user = auth()->user();
        
        if ($leave->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return redirect()->route('my-leaves.show', $leave->id)
                ->with('error', 'You can only edit leave requests that are pending review.');
        }

        $leave->load(['leaveType', 'user']);

        $leaveTypes = LeaveType::active()
            ->ordered()
            ->get()
            ->filter(function($leaveType) use ($user) {
                return $leaveType->isEligibleForUser($user);
            })
            ->values();

        $leaveBalances = LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Employees/Leaves/Edit', [
            'leaveRequest' => $leave,
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $user,
        ]);
    }

    /**
     * Update a leave request
     */
    public function update(Request $request, LeaveRequest $leave)
    {
        $user = auth()->user();
        
        if ($leave->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'You can only edit leave requests that are pending review.');
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'duration' => 'required|in:full_day,half_day_am,half_day_pm,custom_hours',
            'custom_start_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i',
            'custom_end_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i|after:custom_start_time',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'use_default_emergency_contact' => 'boolean',
            'availability' => 'nullable|in:reachable,offline,emergency_only',
        ]);

        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        if ($validated['leave_type_id'] != $leave->leave_type_id || $totalDays != $leave->total_days) {
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
        }

        if ($request->hasFile('attachment')) {
            if ($leave->attachment) {
                \Storage::disk('private')->delete($leave->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('leave-attachments', 'private');
        }

        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $user->emergency_contact_name;
            $validated['emergency_contact_phone'] = $user->emergency_contact_phone;
        }

        $leave->update([
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'duration' => $validated['duration'],
            'custom_start_time' => $validated['custom_start_time'] ?? null,
            'custom_end_time' => $validated['custom_end_time'] ?? null,
            'reason' => $validated['reason'],
            'attachment' => $validated['attachment'] ?? $leave->attachment,
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'availability' => $validated['availability'],
            'total_days' => $totalDays,
        ]);

        return redirect()->route('my-leaves.show', $leave->id)->with('success', 
            'Leave request updated successfully!'
        );
    }

    /**
     * Cancel a pending leave request
     */
    public function cancel(LeaveRequest $leave)
    {
        if ($leave->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this leave request.');
        }

        if (!$leave->canBeCancelled()) {
            return back()->with('error', 'This leave request cannot be cancelled.');
        }

        $leave->update(['status' => 'cancelled']);

        return redirect()->route('my-leaves.index')->with('success', 'Leave request cancelled successfully.');
    }

    /**
     * Calculate total leave days based on duration type
     */
    private function calculateTotalDays($startDate, $endDate, $duration)
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        $daysBetween = $start->diffInDays($end) + 1;

        switch ($duration) {
            case 'half_day_am':
            case 'half_day_pm':
                return 0.5;
            
            case 'custom_hours':
                return 0.5;
            
            case 'full_day':
            default:
                return $daysBetween;
        }
    }
}