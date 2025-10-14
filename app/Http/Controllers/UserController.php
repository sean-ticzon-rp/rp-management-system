<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // ✅ FIX: Load Individual Assets instead of old Asset Assignments
        $query = User::with('roles', 'currentIndividualAssets.asset.inventoryItem');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
                ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('roles.id', $request->role);
            });
        }
        
        // ✅ Filter by account status
        if ($request->has('account_status') && $request->account_status !== 'all') {
            $query->where('account_status', $request->account_status);
        }

        // ✅ Order by pending first, then by newest
        $users = $query->orderByRaw("FIELD(account_status, 'pending', 'active', 'suspended', 'rejected')")
                    ->latest()
                    ->paginate(15)
                    ->withQueryString();
        
        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'account_status']),
            'filters' => $request->only(['search', 'role', 'account_status']),
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        
        return Inertia::render('Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'nullable|string|max:20',
            'personal_mobile' => 'nullable|string|max:20',
            'work_email' => 'nullable|email|max:255',
            'personal_email' => 'nullable|email|max:255',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'civil_status' => 'nullable|in:single,married,widowed,divorced,separated',
            'birthday' => 'nullable|date',
            'address_line_1' => 'nullable|string',
            'address_line_2' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_mobile' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'sss_number' => 'nullable|string|max:15',
            'tin_number' => 'nullable|string|max:20',
            'hdmf_number' => 'nullable|string|max:12',
            'philhealth_number' => 'nullable|string|max:15',
            'payroll_account' => 'nullable|string|max:12',
            'employee_id' => 'nullable|string|unique:users,employee_id',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'employment_status' => 'nullable|in:active,on_leave,terminated,resigned',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        // Handle profile picture upload
        $profilePicturePath = null;
        if ($request->hasFile('profile_picture')) {
            $profilePicturePath = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        // Combine name fields
        $fullName = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ?? '') . ' ' . $validated['last_name']);
        if ($validated['suffix'] && $validated['suffix'] !== 'none') {
            $fullName .= ' ' . $validated['suffix'];
        }

        $user = User::create([
            'profile_picture' => $profilePicturePath,
            'name' => $fullName,
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'] === 'none' ? null : $validated['suffix'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'personal_mobile' => $validated['personal_mobile'],
            'work_email' => $validated['work_email'],
            'personal_email' => $validated['personal_email'],
            'gender' => $validated['gender'],
            'civil_status' => $validated['civil_status'],
            'birthday' => $validated['birthday'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['postal_code'],
            'country' => $validated['country'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'emergency_contact_mobile' => $validated['emergency_contact_mobile'],
            'emergency_contact_relationship' => $validated['emergency_contact_relationship'],
            'sss_number' => $validated['sss_number'],
            'tin_number' => $validated['tin_number'],
            'hdmf_number' => $validated['hdmf_number'],
            'philhealth_number' => $validated['philhealth_number'],
            'payroll_account' => $validated['payroll_account'],
            'employee_id' => $validated['employee_id'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'hire_date' => $validated['hire_date'],
            'employment_status' => $validated['employment_status'] ?? 'active',
            'employment_type' => $validated['employment_type'],
            'password' => Hash::make($validated['password']),
        ]);

        if (isset($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully!');
    }

    public function show(User $user)
    {
        // ✅ FIX: Load Individual Assets instead of old Asset Assignments
        $user->load([
            'roles', 
            'currentIndividualAssets.asset.inventoryItem.category',
            'individualAssetAssignments.asset.inventoryItem',
            'ownedProjects',
            'assignedTasks.project'
        ]);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        // ✅ FIX: Load roles relationship
        $user->load('roles');
        $roles = Role::all();
        
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'personal_mobile' => 'nullable|string|max:20',
            'work_email' => 'nullable|email|max:255',
            'personal_email' => 'nullable|email|max:255',
            'gender' => 'nullable|in:male,female,other,prefer_not_to_say',
            'civil_status' => 'nullable|in:single,married,widowed,divorced,separated',
            'birthday' => 'nullable|date',
            'address_line_1' => 'nullable|string',
            'address_line_2' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_mobile' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'sss_number' => 'nullable|string|max:15',
            'tin_number' => 'nullable|string|max:20',
            'hdmf_number' => 'nullable|string|max:12',
            'philhealth_number' => 'nullable|string|max:15',
            'payroll_account' => 'nullable|string|max:12',
            'employee_id' => 'nullable|string|unique:users,employee_id,' . $user->id,
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'employment_status' => 'nullable|in:active,on_leave,terminated,resigned',
            'employment_type' => 'nullable|in:full_time,part_time,contract,intern',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $profilePicturePath = $request->file('profile_picture')->store('profile-pictures', 'public');
            $validated['profile_picture'] = $profilePicturePath;
        }

        // Combine name fields
        $fullName = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ?? '') . ' ' . $validated['last_name']);
        if ($validated['suffix'] && $validated['suffix'] !== 'none') {
            $fullName .= ' ' . $validated['suffix'];
        }

        $updateData = [
            'name' => $fullName,
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'suffix' => $validated['suffix'] === 'none' ? null : $validated['suffix'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'personal_mobile' => $validated['personal_mobile'] ?? null,
            'work_email' => $validated['work_email'],
            'personal_email' => $validated['personal_email'],
            'gender' => $validated['gender'],
            'civil_status' => $validated['civil_status'] ?? null,
            'birthday' => $validated['birthday'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['postal_code'],
            'country' => $validated['country'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'emergency_contact_mobile' => $validated['emergency_contact_mobile'] ?? null,
            'emergency_contact_relationship' => $validated['emergency_contact_relationship'],
            'sss_number' => $validated['sss_number'] ?? null,
            'tin_number' => $validated['tin_number'] ?? null,
            'hdmf_number' => $validated['hdmf_number'] ?? null,
            'philhealth_number' => $validated['philhealth_number'] ?? null,
            'payroll_account' => $validated['payroll_account'] ?? null,
            'employee_id' => $validated['employee_id'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'hire_date' => $validated['hire_date'],
            'employment_status' => $validated['employment_status'],
            'employment_type' => $validated['employment_type'] ?? null,
            'password' => $validated['password'] ? Hash::make($validated['password']) : $user->password,
        ];

        if (isset($validated['profile_picture'])) {
            $updateData['profile_picture'] = $validated['profile_picture'];
        }

        $user->update($updateData);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account!');
        }

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully!');
    }

    public function approve(User $user)
    {
        if ($user->account_status !== 'pending') {
            return back()->with('error', 'User is not pending approval!');
        }

        $user->update([
            'account_status' => 'active',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // TODO: Send email to user notifying approval
        
        return back()->with('success', "User {$user->name} has been approved!");
    }

    public function reject(User $user)
    {
        if ($user->account_status !== 'pending') {
            return back()->with('error', 'User is not pending approval!');
        }

        $user->update([
            'account_status' => 'rejected',
        ]);

        // TODO: Send email to user notifying rejection
        
        return back()->with('success', "User {$user->name} has been rejected.");
    }
}