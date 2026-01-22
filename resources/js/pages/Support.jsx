import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { MessageSquare, Plus, Bug, Lightbulb, Send, X } from 'lucide-react';

export default function Support() {
    const [statusFilter, setStatusFilter] = useState('open');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-purple-100 text-purple-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInHours < 24) {
            if (diffInHours < 1) {
                return 'Just now';
            }
            return `${diffInHours}h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [ticketType, setTicketType] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'medium',
        description: '',
        category: 'bug',
    });

    // Mock data - replace with real data later
    const [allTickets, setAllTickets] = useState([
        {
            id: 1,
            subject: 'Login page not loading on Safari',
            category: 'bug',
            priority: 'high',
            status: 'open',
            description: 'When trying to access the login page on Safari, it shows a blank screen.',
            created_at: '2026-01-20 09:30:00',
            updated_at: '2026-01-20 09:30:00',
            messages: [
                {
                    id: 1,
                    author: 'You',
                    is_support: false,
                    message: 'When trying to access the login page on Safari, it shows a blank screen.',
                    created_at: '2026-01-20 09:30:00',
                },
                {
                    id: 2,
                    author: 'Support Team',
                    is_support: true,
                    message: 'Thank you for reporting this issue. We\'re looking into it and will update you shortly.',
                    created_at: '2026-01-20 10:15:00',
                },
            ],
        },
        {
            id: 2,
            subject: 'Add dark mode support',
            category: 'feature',
            priority: 'medium',
            status: 'in_progress',
            description: 'It would be great to have a dark mode option for the application.',
            created_at: '2026-01-19 14:15:00',
            updated_at: '2026-01-21 10:00:00',
            messages: [
                {
                    id: 1,
                    author: 'You',
                    is_support: false,
                    message: 'It would be great to have a dark mode option for the application.',
                    created_at: '2026-01-19 14:15:00',
                },
                {
                    id: 2,
                    author: 'Support Team',
                    is_support: true,
                    message: 'Great suggestion! We\'ve added this to our roadmap and have started working on it.',
                    created_at: '2026-01-20 08:00:00',
                },
                {
                    id: 3,
                    author: 'You',
                    is_support: false,
                    message: 'Awesome! Looking forward to it. Will it include custom color schemes?',
                    created_at: '2026-01-21 09:30:00',
                },
                {
                    id: 4,
                    author: 'Support Team',
                    is_support: true,
                    message: 'We\'re starting with a default dark theme, but custom themes are on our future roadmap!',
                    created_at: '2026-01-21 10:00:00',
                },
            ],
        },
        {
            id: 3,
            subject: 'Export reports to PDF',
            category: 'feature',
            priority: 'low',
            status: 'open',
            description: 'Need ability to export monthly reports as PDF files.',
            created_at: '2026-01-18 11:00:00',
            updated_at: '2026-01-18 11:00:00',
            messages: [
                {
                    id: 1,
                    author: 'You',
                    is_support: false,
                    message: 'Need ability to export monthly reports as PDF files.',
                    created_at: '2026-01-18 11:00:00',
                },
            ],
        },
        {
            id: 4,
            subject: 'Dashboard widgets not refreshing',
            category: 'bug',
            priority: 'medium',
            status: 'resolved',
            description: 'The dashboard widgets show stale data and require manual page refresh.',
            created_at: '2026-01-15 16:45:00',
            updated_at: '2026-01-22 08:30:00',
            messages: [
                {
                    id: 1,
                    author: 'You',
                    is_support: false,
                    message: 'The dashboard widgets show stale data and require manual page refresh.',
                    created_at: '2026-01-15 16:45:00',
                },
                {
                    id: 2,
                    author: 'Support Team',
                    is_support: true,
                    message: 'We\'ve identified the issue. It was related to caching. Deploying a fix now.',
                    created_at: '2026-01-16 10:00:00',
                },
                {
                    id: 3,
                    author: 'Support Team',
                    is_support: true,
                    message: 'The fix has been deployed. Please clear your browser cache and let us know if the issue persists.',
                    created_at: '2026-01-16 14:30:00',
                },
                {
                    id: 4,
                    author: 'You',
                    is_support: false,
                    message: 'Works perfectly now! Thank you for the quick fix.',
                    created_at: '2026-01-17 09:00:00',
                },
                {
                    id: 5,
                    author: 'Support Team',
                    is_support: true,
                    message: 'Glad to hear it\'s working! Marking this as resolved.',
                    created_at: '2026-01-22 08:30:00',
                },
            ],
        },
    ]);

    // Filter tickets based on search and filters
    const tickets = allTickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const handleOpenDialog = (type) => {
        setTicketType(type);
        setFormData({
            ...formData,
            category: type,
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTicketType('');
        setFormData({
            subject: '',
            priority: 'medium',
            description: '',
            category: 'bug',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const newTicket = {
            id: allTickets.length + 1,
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            status: 'open',
            description: formData.description,
            created_at: now,
            updated_at: now,
            messages: [
                {
                    id: 1,
                    author: 'You',
                    is_support: false,
                    message: formData.description,
                    created_at: now,
                },
            ],
        };

        setAllTickets([newTicket, ...allTickets]);
        console.log('Ticket created:', newTicket);
        handleCloseDialog();
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const updatedTickets = allTickets.map((ticket) => {
            if (ticket.id === selectedTicket.id) {
                const newMsg = {
                    id: ticket.messages.length + 1,
                    author: 'You',
                    is_support: false,
                    message: newMessage,
                    created_at: now,
                };
                return {
                    ...ticket,
                    messages: [...ticket.messages, newMsg],
                    updated_at: now,
                };
            }
            return ticket;
        });

        setAllTickets(updatedTickets);
        const updatedTicket = updatedTickets.find((t) => t.id === selectedTicket.id);
        setSelectedTicket(updatedTicket);
        setNewMessage('');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Support" />

            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
                        <p className="text-gray-600 mt-1">Submit and track your support tickets</p>
                    </div>
                    <Button
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleOpenDialog('feature')}
                    >
                        <Plus className="h-4 w-4" />
                        New Ticket
                    </Button>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-md"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="all">All Status</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="text-sm text-gray-500 ml-auto">
                        Showing {tickets.length > 0 ? `1-${tickets.length}` : '0-0'} of {tickets.length}
                    </div>
                </div>

                {/* Tickets List / Empty State */}
                <div className="bg-white rounded-lg border border-gray-200 min-h-[400px]">
                    {tickets.length === 0 ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="text-center py-12">
                                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No tickets found
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Click "New Ticket" to submit a support request.
                                </p>
                                <Button
                                    className="flex items-center gap-2 mx-auto bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleOpenDialog('feature')}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Ticket
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        selectedTicket?.id === ticket.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                                    }`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                                    {ticket.subject}
                                                </h3>
                                                <Badge className={`${getPriorityBadgeColor(ticket.priority)} border-0 text-xs`}>
                                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {ticket.category === 'bug' ? (
                                                        <Bug className="h-3 w-3" />
                                                    ) : (
                                                        <Lightbulb className="h-3 w-3" />
                                                    )}
                                                    {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                                                </span>
                                                <span>•</span>
                                                <span>Ticket #{ticket.id}</span>
                                                <span>•</span>
                                                <span>Updated {formatDate(ticket.updated_at)}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <Badge className={`${getStatusBadgeColor(ticket.status)} border-0`}>
                                                {ticket.status === 'in_progress' ? 'In Progress' :
                                                 ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Conversation */}
                {selectedTicket && (
                    <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Conversation Header */}
                        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedTicket.subject}
                                    </h2>
                                    <Badge className={`${getStatusBadgeColor(selectedTicket.status)} border-0`}>
                                        {selectedTicket.status === 'in_progress' ? 'In Progress' :
                                         selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Ticket #{selectedTicket.id} • Created {formatDate(selectedTicket.created_at)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedTicket(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                            {selectedTicket.messages?.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.is_support ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[70%] ${message.is_support ? '' : 'flex flex-col items-end'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-700">
                                                {message.author}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${
                                                message.is_support
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'bg-blue-600 text-white'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={2}
                                        className="flex-1 resize-none"
                                    />
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 text-white hover:bg-blue-700 self-end"
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Ticket Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                Create New Ticket
                            </DialogTitle>
                            <DialogDescription>
                                Provide details about your request and we'll get back to you as soon as possible.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleInputChange('category', value)}
                                        required
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug">Bug Report</SelectItem>
                                            <SelectItem value="feature">Feature Request</SelectItem>
                                            <SelectItem value="question">Question</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Brief description of the issue"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleInputChange('priority', value)}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your request in detail..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={6}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleCloseDialog}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Submit Ticket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
