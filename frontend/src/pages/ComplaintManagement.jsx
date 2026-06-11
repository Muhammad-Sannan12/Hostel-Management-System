import React, { useState } from 'react';
import { AlertTriangle, Check, X, Clock, FileText, Wrench, UtensilsCrossed, Sparkles, Shield, HelpCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ComplaintManagement = () => {
    const { complaints, updateComplaintStatus } = useHostel();

    const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
    const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress');
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Maintenance': return <Wrench className="mr-1 h-3 w-3" />;
            case 'Food': return <UtensilsCrossed className="mr-1 h-3 w-3" />;
            case 'Cleanliness': return <Sparkles className="mr-1 h-3 w-3" />;
            case 'Security': return <Shield className="mr-1 h-3 w-3" />;
            default: return <HelpCircle className="mr-1 h-3 w-3" />;
        }
    };

    const ComplaintCard = ({ complaint, showActions = false }) => {
        const [status, setStatus] = useState(complaint.status);
        const [priority, setPriority] = useState(complaint.priority || 'Medium');
        const [remark, setRemark] = useState(complaint.adminRemarks || '');

        const handleUpdate = async () => {
            const result = await updateComplaintStatus(complaint._id || complaint.id, status, remark, priority);
            if (result.success) {
                toast.success('Complaint updated successfully');
            }
        };

        return (
            <Card className="animate-scale-in">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg">{complaint.student?.user?.name || 'Student'}</CardTitle>
                            <CardDescription>
                                {complaint.student?.collegeNumber || 'N/A'} • {complaint.student?.room?.hostel?.name || 'Not Assigned'}
                            </CardDescription>
                        </div>
                        <Badge
                            className={cn(
                                complaint.status === 'Pending' && 'bg-warning/10 text-warning',
                                complaint.status === 'In Progress' && 'bg-blue-500/10 text-blue-600',
                                complaint.status === 'Resolved' && 'bg-success/10 text-success'
                            )}
                        >
                            {complaint.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                            {complaint.status === 'In Progress' && <Clock className="mr-1 h-3 w-3" />}
                            {complaint.status === 'Resolved' && <Check className="mr-1 h-3 w-3" />}
                            {complaint.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                            {getCategoryIcon(complaint.category)}
                            {complaint.category}
                        </Badge>
                        <Badge variant="outline" className={cn(
                            complaint.priority === 'High' && 'bg-red-500/10 text-red-600',
                            complaint.priority === 'Medium' && 'bg-amber-500/10 text-amber-600',
                            complaint.priority === 'Low' && 'bg-slate-500/10 text-slate-600'
                        )}>
                            {complaint.priority}
                        </Badge>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">Description:</p>
                        <p className="mt-1 text-sm">{complaint.description}</p>
                    </div>

                    {complaint.adminRemarks && !showActions && (
                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                            <p className="text-sm font-medium text-primary">Admin Remarks:</p>
                            <p className="mt-1 text-sm italic">"{complaint.adminRemarks}"</p>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground text-right">Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</p>

                    {showActions && (
                        <div className="space-y-3 pt-2 border-t">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Update Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Set Priority</label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Textarea
                                placeholder="Add admin remarks (optional)..."
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="min-h-[60px] text-sm"
                            />
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={handleUpdate}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Update Complaint
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between animate-fade-in">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Complaints
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        View and resolve complaints raised by students
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 flex gap-4 animate-slide-up">
                <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="font-medium text-warning">{pendingComplaints.length} Pending</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-600">{inProgressComplaints.length} In Progress</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-medium text-success">{resolvedComplaints.length} Resolved</span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-card">
                        <Clock className="mr-2 h-4 w-4" />
                        Pending ({pendingComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="inprogress" className="data-[state=active]:bg-card">
                        <Clock className="mr-2 h-4 w-4" />
                        In Progress ({inProgressComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-card">
                        <Check className="mr-2 h-4 w-4" />
                        Resolved ({resolvedComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-card">
                        <FileText className="mr-2 h-4 w-4" />
                        All ({complaints.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {pendingComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                            <Clock className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-lg font-medium text-muted-foreground">No pending complaints</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="inprogress" className="mt-6">
                    {inProgressComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                            <Clock className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-lg font-medium text-muted-foreground">No complaints in progress</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {inProgressComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="resolved" className="mt-6">
                    {resolvedComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                            <Check className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-lg font-medium text-muted-foreground">No resolved complaints</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {resolvedComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                    {complaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-lg font-medium text-muted-foreground">No complaints yet</p>
                            <p className="text-sm text-muted-foreground">Student complaints will appear here</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {complaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions={complaint.status !== 'Resolved'} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
};

export default ComplaintManagement;
