<?php

namespace App\Http\Controllers;

use App\Models\AssetAssignment;
use App\Models\AssetHistory;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetAssignmentController extends Controller
{
    // Show assignment form
    public function create($inventoryItemId = null)
    {
        $item = null;
        if ($inventoryItemId) {
            $item = InventoryItem::with('category')->findOrFail($inventoryItemId);
        }

        $availableItems = InventoryItem::where('asset_type', 'asset')
            ->where('status', 'active')
            ->whereDoesntHave('currentAssignment')
            ->with('category')
            ->get();

        $users = User::orderBy('name')->get();

        return Inertia::render('Assets/Assign', [
            'preselectedItem' => $item,
            'availableItems' => $availableItems,
            'users' => $users,
        ]);
    }

    // Store new assignment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'user_id' => 'required|exists:users,id',
            'assigned_date' => 'required|date',
            'notes' => 'nullable|string',
            'condition_on_assignment' => 'nullable|string',
        ]);

        $validated['assigned_by'] = auth()->id();
        $validated['status'] = 'active';

        // Create assignment
        $assignment = AssetAssignment::create($validated);

        // Create history record
        AssetHistory::create([
            'inventory_item_id' => $validated['inventory_item_id'],
            'user_id' => $validated['user_id'],
            'performed_by' => auth()->id(),
            'action' => 'assigned',
            'notes' => $validated['notes'] ?? 'Asset assigned to user',
            'action_date' => $validated['assigned_date'],
        ]);

        return redirect()->route('assets.index')->with('success', 'Asset assigned successfully!');
    }

    // List all assignments
    public function index(Request $request)
    {
        $query = AssetAssignment::with(['inventoryItem.category', 'user', 'assignedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('inventoryItem', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            })->orWhereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $assignments = $query->latest()->paginate(15)->withQueryString();
        $users = User::orderBy('name')->get();

        return Inertia::render('Assets/Index', [
            'assignments' => $assignments,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'user_id']),
        ]);
    }

    // Return asset
    public function return(Request $request, AssetAssignment $assignment)
    {
        $validated = $request->validate([
            'return_date' => 'required|date',
            'condition_on_return' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $assignment->update([
            'return_date' => $validated['return_date'],
            'condition_on_return' => $validated['condition_on_return'] ?? null,
            'status' => 'returned',
            'notes' => $validated['notes'] ?? $assignment->notes,
        ]);

        // Create history record
        AssetHistory::create([
            'inventory_item_id' => $assignment->inventory_item_id,
            'user_id' => $assignment->user_id,
            'performed_by' => auth()->id(),
            'action' => 'returned',
            'notes' => $validated['notes'] ?? 'Asset returned',
            'action_date' => $validated['return_date'],
        ]);

        return back()->with('success', 'Asset returned successfully!');
    }

    // Barcode lookup
    public function lookup(Request $request)
    {
        $barcode = $request->input('barcode');
        
        $item = InventoryItem::where('barcode', $barcode)
            ->with(['category', 'currentAssignment.user'])
            ->first();

        if (!$item) {
            return response()->json([
                'found' => false,
                'message' => 'No item found with this barcode'
            ]);
        }

        return response()->json([
            'found' => true,
            'item' => $item
        ]);
    }
}