<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'serial_number',
        'description',
        'category_id',
        'quantity',
        'min_quantity',
        'unit_price',
        'unit',
        'location',
        'manufacturer',
        'model',
        'purchase_date',
        'warranty_expiry',
        'status',
        'asset_type',
        'created_by',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'unit_price' => 'decimal:2',
    ];

    // Relationship: An inventory item belongs to a category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship: An inventory item belongs to a user (creator)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relationship: An inventory item has many assignments
    public function assignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    // Relationship: Current active assignment
    public function currentAssignment()
    {
        return $this->hasOne(AssetAssignment::class)->where('status', 'active');
    }

    // Relationship: An inventory item has many history records
    public function history()
    {
        return $this->hasMany(AssetHistory::class);
    }

    // Check if item is low stock
    public function isLowStock()
    {
        return $this->quantity <= $this->min_quantity;
    }

    // Check if item is assigned
    public function isAssigned()
    {
        return $this->currentAssignment()->exists();
    }

    // Scope: Filter by asset type
    public function scopeAssets($query)
    {
        return $query->where('asset_type', 'asset');
    }

    public function scopeConsumables($query)
    {
        return $query->where('asset_type', 'consumable');
    }

    // Scope: Low stock items
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'min_quantity');
    }
}