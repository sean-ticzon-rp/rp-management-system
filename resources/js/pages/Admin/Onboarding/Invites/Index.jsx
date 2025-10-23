// resources/js/Pages/Admin/Onboarding/Invites/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    UserPlus,
    Plus,
    Mail,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react';

export default function Index({ auth, invites, stats, filters }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Onboarding Invites</h2>
                            <p className="text-gray-600 mt-1">Manage pre-onboarding invitations</p>
                        </div>
                    </div>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href={route('onboarding.invites.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Send New Invite
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Onboarding Invites" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invites</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
                                </div>
                                <Mail className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pending || 0}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.submitted || 0}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats?.approved || 0}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <p>Invite list table coming soon...</p>
                        <p className="text-sm mt-2">For now, invites are sent via email with unique guest links</p>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}