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
        $query = InventoryItem::with(['category', 'creator', 'currentAssignment.user']);

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

        InventoryItem::create($validated);

        return redirect()->route('inventory.index')->with('success', 'Inventory item created successfully!');
    }

    public function show(InventoryItem $inventory)
    {
        $inventory->load(['category', 'creator', 'assignments.user', 'assignments.assignedBy', 'history.user', 'history.performedBy']);

        return Inertia::render('Inventory/Show', [
            'item' => $inventory,
        ]);
    }

    public function edit(InventoryItem $inventory)
    {
        $categories = Category::where('type', 'inventory')->get();
        
        return Inertia::render('Inventory/Edit', [
            'item' => $inventory,
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

        return redirect()->route('inventory.index')->with('success', 'Inventory item updated successfully!');
    }

    public function destroy(InventoryItem $inventory)
    {
        $inventory->delete();

        return redirect()->route('inventory.index')->with('success', 'Inventory item deleted successfully!');
    }
}