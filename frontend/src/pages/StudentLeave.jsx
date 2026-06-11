import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Send,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    XCircle,
    FileText,
    PlaneTakeoff,
    History,
    CalendarRange,
    MessageSquare,
    Info
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const StudentLeave = () => {
    const { user } = useAuth();
    const { students, leaveApplications, addLeaveApplication } = useHostel();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });

    // Find the student record associated with the user
    const studentRecord = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id) ||
        (s.collegeNumber === user?.collegeNumber && user?.collegeNumber)
    );

    const studentLeaves = leaveApplications
        .filter(l =>
            (l.student?._id === studentRecord?._id || l.student === studentRecord?._id) ||
            l.studentId === user?._id ||
            l.collegeNumber === user?.collegeNumber
        )
        .sort((a, b) => new Date(b.appliedDate || b.createdAt).getTime() - new Date(a.appliedDate || a.createdAt).getTime());

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error('Start date cannot be after end date');
            return;
        }

        setIsSubmitting(true);

        const applicationData = {
            student: studentRecord?._id,
            studentId: user?._id,
            collegeNumber: user?.collegeNumber,
            studentName: user?.name,
            ...formData,
            appliedDate: new Date().toISOString()
        };

        const result = await addLeaveApplication(applicationData);

        if (result.success) {
            toast.success('Your leave application has been submitted for review');
            setFormData({
                startDate: '',
                endDate: '',
                reason: '',
            });
        }

        setIsSubmitting(false);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved':
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case 'Rejected':
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle2 className="h-3 w-3" />;
            case 'Rejected': return <XCircle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-10 mb-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <PlaneTakeoff size={280} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                    <ClipboardList className="h-6 w-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-black uppercase tracking-widest">
                                    Leave Management
                                </Badge>
                            </div>
                            <h1 className="font-display text-5xl font-black tracking-tighter mb-3">
                                Absence Requests
                            </h1>
                            <p className="text-lg opacity-90 max-w-xl font-medium leading-relaxed">
                                Submit formal leave applications and track their approval status. Please allow 24 hours for administrative processing.
                            </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2 text-right">
                            <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70 text-white">Pending Requests</span>
                                <span className="text-3xl font-black tracking-tight">
                                    {studentLeaves.filter(l => l.status === 'Pending').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-12 items-start">
                    {/* Simplified Form Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-premium overflow-hidden sticky top-8">
                            <CardHeader className="bg-muted/30 pb-8">
                                <CardTitle className="text-2xl font-black flex items-center gap-2 tracking-tight">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    New Application
                                </CardTitle>
                                <CardDescription className="font-medium">All fields are mandatory for processing.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="startDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Arrival/Start Date</Label>
                                            <div className="relative">
                                                <CalendarRange className="absolute left-3 top-3 h-4 w-4 text-indigo-500 opacity-50" />
                                                <Input
                                                    id="startDate"
                                                    type="date"
                                                    className="pl-10 h-11 border-muted hover:border-indigo-400 focus:ring-indigo-500 transition-all font-medium"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="endDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Departure/End Date</Label>
                                            <div className="relative">
                                                <CalendarRange className="absolute left-3 top-3 h-4 w-4 text-indigo-500 opacity-50" />
                                                <Input
                                                    id="endDate"
                                                    type="date"
                                                    className="pl-10 h-11 border-muted hover:border-indigo-400 focus:ring-indigo-500 transition-all font-medium"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="reason" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Justification</Label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-indigo-500 opacity-50" />
                                                <Textarea
                                                    id="reason"
                                                    placeholder="State the purpose of your leave..."
                                                    className="pl-10 min-h-[120px] border-muted hover:border-indigo-400 focus:ring-indigo-500 transition-all font-medium pt-3"
                                                    value={formData.reason}
                                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                Submit Request
                                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sophisticated Table Section */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black tracking-tight">Request History</h2>
                                <div className="h-px w-20 bg-muted-foreground/20 hidden md:block" />
                            </div>
                        </div>

                        <Card className="border-none shadow-premium overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50 border-b-border/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Requested Period</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Justification</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Current Status</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Admin Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentLeaves.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-72 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                                            <History className="h-8 w-8 opacity-20" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-black text-foreground">Archival data is empty</p>
                                                            <p className="text-sm">You haven't submitted any leave requests yet.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            studentLeaves.map((leave, index) => (
                                                <TableRow key={index} className="group hover:bg-muted/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <TableCell className="py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-background transition-colors flex items-center justify-center shrink-0 border border-border/50">
                                                                <Calendar className="h-5 w-5 text-indigo-500" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black tracking-tight whitespace-nowrap">
                                                                    {formatDate(leave.startDate)}
                                                                </div>
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                                    thru {formatDate(leave.endDate)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 max-w-[250px]">
                                                        <p className="text-sm font-medium leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">
                                                            "{leave.reason}"
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        <Badge variant="outline" className={cn(
                                                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-1.5 w-fit",
                                                            getStatusStyles(leave.status)
                                                        )}>
                                                            {getStatusIcon(leave.status)}
                                                            {leave.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        {leave.remarks ? (
                                                            <div className="flex items-start gap-2 max-w-[200px]">
                                                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                                <p className="text-sm font-medium text-muted-foreground leading-snug">
                                                                    {leave.remarks}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-black uppercase tracking-widest opacity-20">No feedback yet</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Policy Note */}
                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-700 mb-1">Administrative Policy</h4>
                                <p className="text-xs font-medium text-indigo-900/70 leading-relaxed">
                                    Approved leave is required for all absences exceeding 24 hours. Students are requested to submit applications at least 2 days prior to the desired commencement of leave.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentLeave;
