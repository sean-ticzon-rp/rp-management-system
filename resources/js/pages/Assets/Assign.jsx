// resources/js/Pages/Assets/Assign.jsx
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Laptop,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    Camera,
    Search,
    Package,
    CheckCircle2,
    X as XIcon,
} from 'lucide-react';

export default function Assign({ auth, preselectedItem, availableItems, users }) {
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [searchedItem, setSearchedItem] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [notFoundModalOpen, setNotFoundModalOpen] = useState(false);
    const [searchError, setSearchError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        inventory_item_id: preselectedItem?.id || '',
        user_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        notes: '',
        condition_on_assignment: 'Good',
    });

    useEffect(() => {
        if (preselectedItem) {
            setSearchedItem(preselectedItem);
        }
    }, [preselectedItem]);

    const handleBarcodeSearch = async (e) => {
        e.preventDefault();
        if (!barcodeSearch) return;

        setScanning(true);
        setSearchError('');
        try {
            const response = await fetch(route('assets.lookup'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ barcode: barcodeSearch })
            });

            const result = await response.json();
            
            if (result.found) {
                setSearchedItem(result.item);
                setData('inventory_item_id', result.item.id);
            } else {
                setSearchError(result.message || 'No item found with this barcode');
                setNotFoundModalOpen(true);
                setSearchedItem(null);
            }
        } catch (error) {
            setSearchError('Error looking up barcode. Please try again.');
            setNotFoundModalOpen(true);
        } finally {
            setScanning(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('assets.store'));
    };

    const selectedItem = searchedItem || availableItems.find(item => item.id === parseInt(data.inventory_item_id));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('assets.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Laptop className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Assign Asset</h2>
                                <p className="text-gray-600 mt-1">Assign equipment to an employee</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Assign Asset" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Barcode Scanner */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Quick Scan
                            </CardTitle>
                            <CardDescription>Scan or enter barcode</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter barcode..."
                                    value={barcodeSearch}
                                    onChange={(e) => setBarcodeSearch(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleBarcodeSearch(e);
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button 
                                    type="button" 
                                    onClick={handleBarcodeSearch} 
                                    disabled={scanning || !barcodeSearch}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                            {searchedItem && (
                                <Alert className="mt-4 bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800 font-medium">
                                        Found: {searchedItem.name}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle>Assignment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Asset *</Label>
                                    <Select 
                                        value={data.inventory_item_id.toString()} 
                                        onValueChange={(value) => {
                                            setData('inventory_item_id', value);
                                            setSearchedItem(availableItems.find(item => item.id === parseInt(value)));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name} - {item.sku}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.inventory_item_id && <p className="text-sm text-red-500">{errors.inventory_item_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Assign To *</Label>
                                    <Select value={data.user_id.toString()} onValueChange={(value) => setData('user_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Assignment Date *</Label>
                                    <Input
                                        type="date"
                                        value={data.assigned_date}
                                        onChange={(e) => setData('assigned_date', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Condition</Label>
                                    <Select value={data.condition_on_assignment} onValueChange={(value) => setData('condition_on_assignment', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Excellent">Excellent</SelectItem>
                                            <SelectItem value="Good">Good</SelectItem>
                                            <SelectItem value="Fair">Fair</SelectItem>
                                            <SelectItem value="Poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('assets.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                        {processing ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assigning...</>
                                        ) : (
                                            <><Save className="h-4 w-4 mr-2" />Assign Asset</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Preview */}
                {selectedItem && (
                    <div className="space-y-6">
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle>Asset Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Package className="h-6 w-6 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedItem.name}</p>
                                            <p className="text-sm text-gray-600">{selectedItem.sku}</p>
                                        </div>
                                    </div>
                                    {selectedItem.category && (
                                        <div className="mb-2">
                                            <span 
                                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                                                style={{ 
                                                    backgroundColor: selectedItem.category.color + '15',
                                                    color: selectedItem.category.color,
                                                    borderColor: selectedItem.category.color + '40'
                                                }}
                                            >
                                                {selectedItem.category.name}
                                            </span>
                                        </div>
                                    )}
                                    {selectedItem.manufacturer && (
                                        <p className="text-sm text-gray-600">
                                            {selectedItem.manufacturer} {selectedItem.model}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Not Found Modal */}
            {notFoundModalOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setNotFoundModalOpen(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Item Not Found</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">Barcode: {barcodeSearch}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotFoundModalOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <XIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                {searchError}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setNotFoundModalOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    asChild
                                >
                                    <Link href={route('inventory.create')}>
                                        Add New Item
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}