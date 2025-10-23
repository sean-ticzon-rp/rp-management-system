<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\LeaveBalance;
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

        // Get the employee's current balance for this leave type
        $leaveBalance = LeaveBalance::where('user_id', $leave->user_id)
            ->where('leave_type_id', $leave->leave_type_id)
            ->where('year', now()->year)
            ->first();

        return Inertia::render('Admin/Leaves/Show', [
            'leaveRequest' => $leave,
            'leaveBalance' => $leaveBalance,
        ]);
    }

    /**
     * Show the form for creating a new leave request (Admin version)
     * ✅ UPDATED: Support filing for other employees
     */
    public function create()
    {
        $currentUser = auth()->user();
        
        // ✅ Check if user is HR/Admin
        $isHROrAdmin = $currentUser->roles->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager'
        ])->count() > 0;

        // Get available leave types
        $leaveTypes = LeaveType::active()->ordered()->get();

        // Get current user's balances (for when filing for self)
        $leaveBalances = LeaveBalance::where('user_id', $currentUser->id)
            ->where('year', now()->year)
            ->with('leaveType')
            ->get()
            ->keyBy('leave_type_id');

        // Get all active users as potential managers
        $managers = User::where('employment_status', 'active')
            ->where('id', '!=', $currentUser->id)
            ->orderBy('name')
            ->get(['id', 'name', 'position', 'department']);

        // ✅ NEW: Get all employees (for HR/Admin to file on behalf of)
        $allUsers = [];
        if ($isHROrAdmin) {
            $allUsers = User::where('employment_status', 'active')
                ->with(['leaveBalances' => function($query) {
                    $query->where('year', now()->year)->with('leaveType');
                }])
                ->orderBy('name')
                ->get(['id', 'name', 'position', 'department', 'manager_id', 'emergency_contact_name', 'emergency_contact_phone']);
        }

        return Inertia::render('Admin/Leaves/Apply', [
            'leaveTypes' => $leaveTypes,
            'leaveBalances' => $leaveBalances,
            'user' => $currentUser->load('manager'),
            'managers' => $managers,
            'allUsers' => $allUsers, // ✅ NEW: For proxy filing
        ]);
    }

    /**
     * Store a newly created leave request (Admin version)
     * ✅ UPDATED: Support proxy filing
     */
    public function store(Request $request)
    {
        $currentUser = auth()->user();
        
        // ✅ Check if filing for another user
        $isHROrAdmin = $currentUser->roles->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager'
        ])->count() > 0;

        // ✅ Validate user_id if provided (HR/Admin only)
        if ($request->has('user_id') && $request->user_id != $currentUser->id) {
            if (!$isHROrAdmin) {
                abort(403, 'You are not authorized to file leave for other employees.');
            }
            $targetUserId = $request->user_id;
        } else {
            $targetUserId = $currentUser->id;
        }

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id', // ✅ NEW: Allow HR to file for others
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'duration' => 'required|in:full_day,half_day_am,half_day_pm,custom_hours',
            'custom_start_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i',
            'custom_end_time' => 'nullable|required_if:duration,custom_hours|date_format:H:i|after:custom_start_time',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'emergency_contact_name' => 'nullable|required_if:use_default_emergency_contact,false|string|max:255',
            'emergency_contact_phone' => 'nullable|required_if:use_default_emergency_contact,false|string|max:20',
            'use_default_emergency_contact' => 'boolean',
            'availability' => 'nullable|in:reachable,offline,emergency_only',
            'manager_id' => 'required|exists:users,id',
        ]);

        // Calculate total days
        $totalDays = $this->calculateTotalDays(
            $validated['start_date'],
            $validated['end_date'],
            $validated['duration']
        );

        // ✅ Check balance for the TARGET user (not current user)
        $balance = LeaveBalance::where('user_id', $targetUserId)
            ->where('leave_type_id', $validated['leave_type_id'])
            ->where('year', now()->year)
            ->first();

        if (!$balance || !$balance->hasSufficientBalance($totalDays)) {
            $targetUser = User::find($targetUserId);
            return back()->withInput()->with('error', 
                'Insufficient leave balance. ' . ($targetUser->id === $currentUser->id ? 'You have' : $targetUser->name . ' has') . ' ' .
                ($balance ? $balance->remaining_days : 0) . 
                ' days remaining but requested ' . $totalDays . ' days.'
            );
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('leave-attachments', 'private');
        }

        // Set default emergency contact if requested
        $targetUser = User::find($targetUserId);
        if ($validated['use_default_emergency_contact']) {
            $validated['emergency_contact_name'] = $targetUser->emergency_contact_name;
            $validated['emergency_contact_phone'] = $targetUser->emergency_contact_phone;
        }

        // Create leave request
        LeaveRequest::create([
            ...$validated,
            'user_id' => $targetUserId, // ✅ Use target user ID
            'total_days' => $totalDays,
            'status' => 'pending_manager',
        ]);

        // ✅ Different success messages
        $successMessage = $targetUserId === $currentUser->id
            ? 'Leave request submitted successfully! Your manager will review it.'
            : "Leave request for {$targetUser->name} submitted successfully!";

        return redirect()->route('leaves.index')->with('success', $successMessage);
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
                return 0.5;
            
            case 'custom_hours':
                return 0.5;
            
            case 'full_day':
            default:
                return $daysBetween;
        }
    }
}