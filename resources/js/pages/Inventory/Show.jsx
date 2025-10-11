// resources/js/Pages/Inventory/Show.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

import {
    Package,
    ArrowLeft,
    Edit,
    Trash2,
    Barcode as BarcodeIcon,
    Calendar,
    DollarSign,
    MapPin,
    Building2,
    Hash,
    User,
    AlertTriangle,
    CheckCircle2,
    Clock,
    History,
} from 'lucide-react';

export default function Show({ auth, item }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('inventory.destroy', item.id));
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            discontinued: 'bg-gray-100 text-gray-700 border-gray-200',
            out_of_stock: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getAssetTypeBadge = (type) => {
        const styles = {
            asset: 'bg-blue-100 text-blue-700 border-blue-200',
            consumable: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return styles[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const isLowStock = item.quantity <= item.min_quantity;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('inventory.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{item.name}</h2>
                                <p className="text-gray-600 mt-1">Item Details & Information</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('inventory.edit', item.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={item.name} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview Card */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{item.name}</CardTitle>
                                    {item.manufacturer && (
                                        <CardDescription className="text-base mt-1">
                                            {item.manufacturer} {item.model}
                                        </CardDescription>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={`${getAssetTypeBadge(item.asset_type)} border`}>
                                        {item.asset_type}
                                    </Badge>
                                    <Badge className={`${getStatusBadge(item.status)} border`}>
                                        {item.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {item.description && (
                                <div>
                                    <p className="text-gray-700">{item.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                                    <p className="font-mono font-medium text-gray-900">{item.sku}</p>
                                </div>
                                {item.serial_number && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Serial Number</p>
                                        <p className="font-mono text-sm text-gray-900">{item.serial_number}</p>
                                    </div>
                                )}
                                {item.category && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Category</p>
                                        <Badge
                                            className="border"
                                            style={{
                                                backgroundColor: item.category.color + '15',
                                                color: item.category.color,
                                                borderColor: item.category.color + '40'
                                            }}
                                        >
                                            {item.category.name}
                                        </Badge>
                                    </div>
                                )}
                                {item.location && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            Location
                                        </p>
                                        <p className="text-sm text-gray-900">{item.location}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Current Stock</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                            {item.quantity}
                                        </p>
                                        <span className="text-gray-500">{item.unit}</span>
                                    </div>
                                    {isLowStock && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Low Stock
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Minimum Stock</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-bold text-gray-900">{item.min_quantity}</p>
                                        <span className="text-gray-500">{item.unit}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Unit Price</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-gray-600" />
                                        <p className="text-3xl font-bold text-gray-900">{parseFloat(item.unit_price).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Total Value</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-gray-600" />
                                        <p className="text-3xl font-bold text-gray-900">
                                            {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {item.purchase_date && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Purchase Date</p>
                                            <p className="font-medium text-gray-900">{new Date(item.purchase_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}

                                {item.warranty_expiry && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Warranty Expiry</p>
                                            <p className="font-medium text-gray-900">{new Date(item.warranty_expiry).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}

                                {item.creator && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <User className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Created By</p>
                                            <p className="font-medium text-gray-900">{item.creator.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Updated</p>
                                        <p className="font-medium text-gray-900">{new Date(item.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment History */}
                    {item.assignments && item.assignments.length > 0 && (
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Assignment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {item.assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-full">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{assignment.user.name}</p>
                                                    <p className="text-sm text-gray-600">{assignment.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                    {assignment.status}
                                                </Badge>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(assignment.assigned_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Barcode Card */}
                    {item.barcode && (
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarcodeIcon className="h-5 w-5" />
                                    Barcode
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                                    <BarcodeIcon className="h-16 w-full text-gray-400 mb-4" />
                                    <p className="font-mono text-lg font-bold text-gray-900">{item.barcode}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Scan to identify this item</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Assignment */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Current Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {item.current_assignment?.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                                            <span className="text-lg font-medium text-white">
                                                {item.current_assignment.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.current_assignment.user.name}</p>
                                            <p className="text-sm text-gray-600">{item.current_assignment.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Assigned: {new Date(item.current_assignment.assigned_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-600">Not currently assigned</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href={route('inventory.edit', item.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Item
                                </Link>
                            </Button>
                            <Button className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" variant="outline" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={item.name}
            />
        </AuthenticatedLayout>
    );
}