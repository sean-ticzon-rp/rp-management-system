<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    /**
     * Display all leave requests (HR Admin view)
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['user', 'leaveType', 'manager']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('leaveType', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by leave type
        if ($request->has('leave_type') && $request->leave_type !== 'all') {
            $query->where('leave_type_id', $request->leave_type);
        }

        // Filter by employee
        if ($request->has('employee') && $request->employee !== 'all') {
            $query->where('user_id', $request->employee);
        }

        $leaveRequests = $query->latest()->paginate(15)->withQueryString();

        // Get all leave types for filter
        $leaveTypes = LeaveType::active()->ordered()->get();

        // Get all active users for filter
        $users = User::where('employment_status', 'active')
            ->orderBy('name')
            ->get();

        // Calculate stats
        $stats = [
            'total' => LeaveRequest::count(),
            'pending_hr' => LeaveRequest::where('status', 'pending_hr')->count(),
            'approved' => LeaveRequest::where('status', 'approved')->count(),
            'this_month' => LeaveRequest::whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->count(),
        ];

        return Inertia::render('Admin/Leaves/Index', [
            'leaveRequests' => $leaveRequests,
            'leaveTypes' => $leaveTypes,
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'leave_type', 'employee']),
        ]);
    }

    /**
     * Display a specific leave request
     */
    public function show(LeaveRequest $leave)
    {
        $leave->load([
            'user',
            'leaveType',
            'manager',
            'managerApprover',
            'hrApprover'
        ]);

        return Inertia::render('Admin/Leaves/Show', [
            'leaveRequest' => $leave,
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
        $leaveBalances = \App\Models\LeaveBalance::where('user_id', $user->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        return Inertia::render('Admin/Leaves/Apply', [
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
        $balance = \App\Models\LeaveBalance::where('user_id', $user->id)
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
            $validated['attachment'] = $request->file('attachment')->store('leave-attachments', 'public');
        }

        // Set default emergency contact if requested
        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $user->emergency_contact_name;
            $validated['emergency_contact_phone'] = $user->emergency_contact_phone;
        }

        // Create leave request
        LeaveRequest::create([
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
                // For custom hours, default to half day
                return 0.5;
            
            case 'full_day':
            default:
                return $daysBetween;
        }
    }
}