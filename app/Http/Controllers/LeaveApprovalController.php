<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveApprovalController extends Controller
{
    /**
     * HR approves a leave request (final approval)
     */
    public function hrApprove(Request $request, LeaveRequest $leave)
    {
        // Validate that request is in correct status
        if ($leave->status !== 'pending_hr') {
            return back()->with('error', 'This leave request is not pending HR approval.');
        }

        $validated = $request->validate([
            'hr_comments' => 'nullable|string|max:1000',
        ]);

        // Approve the leave
        $leave->approveByHr(
            auth()->id(),
            $validated['hr_comments'] ?? null
        );

        return redirect()->route('leaves.index')->with('success', 
            "Leave request for {$leave->user->name} has been approved! Balance updated."
        );
    }

    /**
     * HR rejects a leave request
     */
    public function hrReject(Request $request, LeaveRequest $leave)
    {
        // Validate that request is in correct status
        if ($leave->status !== 'pending_hr') {
            return back()->with('error', 'This leave request is not pending HR approval.');
        }

        $validated = $request->validate([
            'hr_comments' => 'required|string|max:1000',
        ]);

        // Reject the leave
        $leave->rejectByHr(
            auth()->id(),
            $validated['hr_comments']
        );

        return redirect()->route('leaves.index')->with('success', 
            "Leave request for {$leave->user->name} has been rejected."
        );
    }

    /**
     * Manager approves a leave request
     */
    public function managerApprove(Request $request, LeaveRequest $leave)
    {
        // Check if current user is the assigned manager
        if ($leave->manager_id !== auth()->id()) {
            return back()->with('error', 'You are not authorized to approve this leave request.');
        }

        // Validate that request is in correct status
        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'This leave request is not pending manager approval.');
        }

        $validated = $request->validate([
            'manager_comments' => 'nullable|string|max:1000',
        ]);

        // Approve and forward to HR
        $leave->approveByManager(
            auth()->id(),
            $validated['manager_comments'] ?? null
        );

        return back()->with('success', 
            "Leave request approved and forwarded to HR for final approval."
        );
    }

    /**
     * Manager rejects a leave request
     */
    public function managerReject(Request $request, LeaveRequest $leave)
    {
        // Check if current user is the assigned manager
        if ($leave->manager_id !== auth()->id()) {
            return back()->with('error', 'You are not authorized to reject this leave request.');
        }

        // Validate that request is in correct status
        if ($leave->status !== 'pending_manager') {
            return back()->with('error', 'This leave request is not pending manager approval.');
        }

        $validated = $request->validate([
            'manager_comments' => 'required|string|max:1000',
        ]);

        // Reject the leave
        $leave->rejectByManager(
            auth()->id(),
            $validated['manager_comments']
        );

        return back()->with('success', 
            "Leave request has been rejected. Employee can appeal this decision."
        );
    }

    /**
     * ✅ NEW: HR approves an appealed leave request (FINAL)
     */
    public function approveAppeal(Request $request, LeaveRequest $leave)
    {
        // ✅ Check if user has HR permissions
        $user = auth()->user();
        $canApproveAsHR = $user->roles->whereIn('slug', [
            'super-admin', 
            'admin', 
            'hr-manager'
        ])->count() > 0;

        if (!$canApproveAsHR) {
            abort(403, 'Only HR can approve appeals.');
        }

        // ✅ Validate that request is in appealed status
        if ($leave->status !== 'appealed') {
            return back()->with('error', 'This leave request is not in appealed status.');
        }

        $validated = $request->validate([
            'hr_comments' => 'nullable|string|max:1000',
        ]);

        // ✅ Approve the appeal (uses existing approveByHr method)
        $leave->approveByHr(
            auth()->id(),
            $validated['hr_comments'] ?? 'Appeal approved by HR.'
        );

        return redirect()->route('leaves.show', $leave->id)->with('success', 
            "Appeal approved! Leave request for {$leave->user->name} has been approved and balance updated."
        );
    }

    /**
     * ✅ NEW: HR rejects an appealed leave request (FINAL)
     */
    public function rejectAppeal(Request $request, LeaveRequest $leave)
    {
        // ✅ Check if user has HR permissions
        $user = auth()->user();
        $canApproveAsHR = $user->roles->whereIn('slug', [
            'super-admin', 
            'admin', 
            'hr-manager'
        ])->count() > 0;

        if (!$canApproveAsHR) {
            abort(403, 'Only HR can reject appeals.');
        }

        // ✅ Validate that request is in appealed status
        if ($leave->status !== 'appealed') {
            return back()->with('error', 'This leave request is not in appealed status.');
        }

        $validated = $request->validate([
            'hr_comments' => 'required|string|max:1000',
        ]);

        // ✅ Reject the appeal (uses existing rejectByHr method)
        $leave->rejectByHr(
            auth()->id(),
            $validated['hr_comments']
        );

        return redirect()->route('leaves.show', $leave->id)->with('success', 
            "Appeal rejected. Final decision has been communicated to {$leave->user->name}."
        );
    }
}