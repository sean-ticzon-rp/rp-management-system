<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('barcode')->unique()->nullable()->after('sku');
            $table->string('serial_number')->nullable()->after('barcode');
            $table->string('manufacturer')->nullable()->after('serial_number');
            $table->string('model')->nullable()->after('manufacturer');
            $table->date('purchase_date')->nullable()->after('model');
            $table->date('warranty_expiry')->nullable()->after('purchase_date');
            $table->enum('asset_type', ['consumable', 'asset'])->default('consumable')->after('status');
            // consumable = items that get used up (paper, pens)
            // asset = items that are assigned (computers, monitors)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'serial_number', 'manufacturer', 'model', 'purchase_date', 'warranty_expiry', 'asset_type']);
        });
    }
};
