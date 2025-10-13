<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        // Load assets relationship to show individual asset counts
        $query = InventoryItem::with(['category', 'creator', 'currentAssignment.user', 'assets']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by asset type
        if ($request->has('asset_type')) {
            $query->where('asset_type', $request->asset_type);
        }

        // Filter low stock
        if ($request->has('filter') && $request->filter === 'low-stock') {
            $query->lowStock();
        }

        $items = $query->latest()->paginate(15)->withQueryString();
        
        $categories = Category::where('type', 'inventory')->get();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'asset_type', 'filter']),
        ]);
    }

    public function create()
    {
        $categories = Category::where('type', 'inventory')->get();
        
        return Inertia::render('Inventory/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_items,sku',
            'barcode' => 'nullable|string|unique:inventory_items,barcode',
            'serial_number' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status' => 'required|in:active,discontinued,out_of_stock',
            'asset_type' => 'required|in:consumable,asset',
        ]);

        $validated['created_by'] = auth()->id();

        // Create the inventory item
        $inventoryItem = InventoryItem::create($validated);

        // If it's an asset type, automatically create individual assets (placeholders)
        if ($validated['asset_type'] === 'asset' && $validated['quantity'] > 0) {
            for ($i = 1; $i <= $validated['quantity']; $i++) {
                \App\Models\Asset::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'asset_tag' => 'ASSET-' . $inventoryItem->id . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'serial_number' => null,  // HR will enter manually
                    'barcode' => null,  // HR will enter manually
                    'purchase_date' => $validated['purchase_date'],
                    'purchase_price' => $validated['unit_price'],
                    'warranty_expiry' => $validated['warranty_expiry'],
                    'condition' => 'Good',
                    'status' => 'Available',
                    'location' => $validated['location'],
                    'notes' => "Placeholder asset #{$i} - Please add serial number and barcode",
                ]);
            }
        }

        return redirect()->route('inventory.index')->with('success', 'Inventory item created successfully!' . 
            ($validated['asset_type'] === 'asset' ? " {$validated['quantity']} individual assets were created. Please add serial numbers and barcodes." : ''));
    }

    public function show(InventoryItem $inventory)
    {
        // Load both old assignments and new individual assets
        $inventory->load([
            'category', 
            'creator', 
            'assignments.user', 
            'assignments.assignedBy', 
            'history.user', 
            'history.performedBy',
            'assets.currentAssignment.user'  // NEW: Load individual assets
        ]);

        return Inertia::render('Inventory/Show', [
            'item' => $inventory,
        ]);
    }

    public function edit(InventoryItem $inventory)
    {
        $categories = Category::where('type', 'inventory')->get();
        
        return Inertia::render('Inventory/Edit', [
            'item' => [
                ...$inventory->toArray(),
                'purchase_date' => $inventory->purchase_date?->format('Y-m-d'),
                'warranty_expiry' => $inventory->warranty_expiry?->format('Y-m-d'),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, InventoryItem $inventory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_items,sku,' . $inventory->id,
            'barcode' => 'nullable|string|unique:inventory_items,barcode,' . $inventory->id,
            'serial_number' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'location' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'status' => 'required|in:active,discontinued,out_of_stock',
            'asset_type' => 'required|in:consumable,asset',
        ]);

        $inventory->update($validated);

        // If it's an asset type, sync the individual assets with the new quantity
        if ($validated['asset_type'] === 'asset') {
            $currentAssetCount = $inventory->assets()->count();
            $newQuantity = $validated['quantity'];

            // If quantity increased, create more assets
            if ($newQuantity > $currentAssetCount) {
                $assetsToCreate = $newQuantity - $currentAssetCount;
                
                for ($i = 1; $i <= $assetsToCreate; $i++) {
                    $assetNumber = $currentAssetCount + $i;
                    
                    \App\Models\Asset::create([
                        'inventory_item_id' => $inventory->id,
                        'asset_tag' => 'ASSET-' . $inventory->id . '-' . str_pad($assetNumber, 3, '0', STR_PAD_LEFT),
                        'serial_number' => null,  // HR will enter manually
                        'barcode' => null,  // HR will enter manually
                        'purchase_date' => $validated['purchase_date'],
                        'purchase_price' => $validated['unit_price'],
                        'warranty_expiry' => $validated['warranty_expiry'],
                        'condition' => 'Good',
                        'status' => 'Available',
                        'location' => $validated['location'],
                        'notes' => "Placeholder asset #{$assetNumber} - Please add serial number and barcode",
                    ]);
                }
            }
            // If quantity decreased, we DON'T automatically delete assets (to prevent data loss)
            // Admin can manually delete individual assets if needed
        }

        $message = 'Inventory item updated successfully!';
        
        if ($validated['asset_type'] === 'asset') {
            $currentCount = $inventory->assets()->count();
            $message .= " (Total individual assets: {$currentCount})";
        }

        return redirect()->route('inventory.index')->with('success', $message);
    }

    public function destroy(InventoryItem $inventory)
    {
        $inventory->delete();

        return redirect()->route('inventory.index')->with('success', 'Inventory item deleted successfully!');
    }
}