<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\InventoryItem;
use App\Models\User;
use App\Models\IndividualAssetAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    // List all individual assets
    public function index(Request $request)
    {
        // Use 'assignments' (plural) to match the relationship name in Asset model
        $query = Asset::with(['inventoryItem.category', 'currentAssignment.user']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('asset_tag', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhereHas('inventoryItem', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by inventory item
        if ($request->has('inventory_item_id') && $request->inventory_item_id !== 'all') {
            $query->where('inventory_item_id', $request->inventory_item_id);
        }

        $assets = $query->latest()->paginate(15)->withQueryString();
        
        $inventoryItems = InventoryItem::where('asset_type', 'asset')->get();

        return Inertia::render('Assets/IndividualAssets/Index', [
            'assets' => $assets,
            'inventoryItems' => $inventoryItems,
            'filters' => $request->only(['search', 'status', 'inventory_item_id']),
        ]);
    }

    // Show detailed view of a specific asset
    public function show(Asset $asset)
    {
        $asset->load([
            'inventoryItem.category',
            'assignments.user',
            'assignments.assignedBy',
            'currentAssignment.user'
        ]);

        return Inertia::render('Assets/IndividualAssets/Show', [
            'asset' => $asset,
        ]);
    }

    // Show edit form for a specific asset
    public function edit(Asset $asset)
    {
        $asset->load('inventoryItem.category');
        
        return Inertia::render('Assets/IndividualAssets/Edit', [
            'asset' => [
                ...$asset->toArray(),
                'purchase_date' => $asset->purchase_date?->format('Y-m-d'),
                'warranty_expiry' => $asset->warranty_expiry?->format('Y-m-d'),
                // Also ensure these relationships are properly serialized
                'inventory_item' => $asset->inventoryItem ? [
                    ...$asset->inventoryItem->toArray(),
                    'category' => $asset->inventoryItem->category,
                ] : null,
            ],
        ]);
    }

    // Update a specific asset
    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_tag' => 'required|string|unique:assets,asset_tag,' . $asset->id,
            'serial_number' => 'nullable|string|unique:assets,serial_number,' . $asset->id,
            'barcode' => 'nullable|string|unique:assets,barcode,' . $asset->id,
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'condition' => 'required|in:New,Good,Fair,Poor,Damaged',
            'status' => 'required|in:Available,Assigned,In Repair,Retired,Lost',
            'location' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $asset->update($validated);

        return redirect()->route('individual-assets.index')
                         ->with('success', 'Asset updated successfully!');
    }

    // Show assign form
    public function assignForm($assetId = null)
    {
        $asset = null;
        if ($assetId) {
            $asset = Asset::with('inventoryItem.category')->findOrFail($assetId);
        }

        $availableAssets = Asset::where('status', 'Available')
            ->whereDoesntHave('currentAssignment')
            ->with('inventoryItem')
            ->get();

        $users = User::where('employment_status', 'active')->orderBy('name')->get();

        return Inertia::render('Assets/IndividualAssets/Assign', [
            'preselectedAsset' => $asset,
            'availableAssets' => $availableAssets,
            'users' => $users,
        ]);
    }

    // Assign asset to user
    public function assign(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'user_id' => 'required|exists:users,id',
            'assigned_date' => 'required|date',
            'expected_return_date' => 'nullable|date',
            'assignment_notes' => 'nullable|string',
            'condition_on_assignment' => 'nullable|string',
        ]);

        $validated['assigned_by'] = auth()->id();
        $validated['status'] = 'active';

        // Create assignment
        IndividualAssetAssignment::create($validated);

        // Update asset status
        $asset = Asset::findOrFail($validated['asset_id']);
        $asset->update(['status' => 'Assigned']);

        return redirect()->route('individual-assets.index')
                         ->with('success', 'Asset assigned successfully!');
    }

    // Return asset
    public function return(Request $request, IndividualAssetAssignment $assignment)
    {
        $validated = $request->validate([
            'actual_return_date' => 'required|date',
            'condition_on_return' => 'nullable|string',
            'return_notes' => 'nullable|string',
        ]);

        $assignment->update([
            'actual_return_date' => $validated['actual_return_date'],
            'condition_on_return' => $validated['condition_on_return'] ?? null,
            'return_notes' => $validated['return_notes'] ?? null,
            'status' => 'returned',
        ]);

        // Update asset status and condition
        $assignment->asset->update([
            'status' => 'Available',
            'condition' => $validated['condition_on_return'] ?? $assignment->asset->condition,
        ]);

        return back()->with('success', 'Asset returned successfully!');
    }

    // Barcode lookup
    public function lookup(Request $request)
    {
        $barcode = $request->input('barcode');
        
        if (!$barcode) {
            return response()->json([
                'found' => false,
                'message' => 'Please provide a barcode'
            ]);
        }
        
        $asset = Asset::where('barcode', $barcode)
            ->with(['inventoryItem.category', 'currentAssignment.user'])
            ->first();

        if (!$asset) {
            return response()->json([
                'found' => false,
                'message' => 'No asset found with this barcode'
            ]);
        }

        return response()->json([
            'found' => true,
            'asset' => $asset
        ]);
    }
}