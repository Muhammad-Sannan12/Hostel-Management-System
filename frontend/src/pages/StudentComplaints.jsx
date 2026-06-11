import React, { useState } from 'react';
import {
    AlertTriangle,
    MessageSquare,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    Wrench,
    UtensilsCrossed,
    Sparkles,
    Shield,
    HelpCircle,
    History,
    Calendar,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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

const StudentComplaints = () => {
    const { user } = useAuth();
    const { students, complaints, addComplaint } = useHostel();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        description: '',
    });

    // Find the student record associated with the user
    const studentRecord = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id || s.userId === user?._id) ||
        (s.collegeNumber === user?.collegeNumber && user?.collegeNumber) ||
        (s._id === user?._id || s.id === user?._id)
    );

    const studentId = studentRecord?._id || studentRecord?.id;

    const studentComplaints = complaints
        .filter(c => {
            const complaintStudentId = c.student?._id || c.student?.id || c.student;
            return complaintStudentId === studentId && studentId;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!studentId) {
            toast.error('Student identity not verified. Please refresh.');
            return;
        }

        setIsSubmitting(true);

        const complaintData = {
            student: studentId,
            category: formData.category,
            description: formData.description,
        };

        const result = await addComplaint(complaintData);

        if (result.success) {
            toast.success('Your complaint has been submitted');
            setFormData({
                category: '',
                description: '',
            });
        }

        setIsSubmitting(false);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Maintenance': return <Wrench className="h-4 w-4" />;
            case 'Food': return <UtensilsCrossed className="h-4 w-4" />;
            case 'Cleanliness': return <Sparkles className="h-4 w-4" />;
            case 'Security': return <Shield className="h-4 w-4" />;
            default: return <HelpCircle className="h-4 w-4" />;
        }
    };

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Maintenance':
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case 'Food':
                return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case 'Cleanliness':
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case 'Security':
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved':
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case 'In Progress':
                return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            default:
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Resolved': return <CheckCircle2 className="h-3 w-3" />;
            case 'In Progress': return <Clock className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'High':
                return "bg-red-500/10 text-red-600 border-red-500/20";
            case 'Medium':
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            default:
                return "bg-slate-500/10 text-slate-600 border-slate-500/20";
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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 to-rose-600 p-10 mb-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <AlertTriangle size={280} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-black uppercase tracking-widest">
                                    Issue Reporting
                                </Badge>
                            </div>
                            <h1 className="font-display text-5xl font-black tracking-tighter mb-3">
                                Submit Complaints
                            </h1>
                            <p className="text-lg opacity-90 max-w-xl font-medium leading-relaxed">
                                Report issues and concerns regarding your hostel experience. We take every complaint seriously and strive for quick resolution.
                            </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2 text-right">
                            <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70 text-white">Pending</span>
                                <span className="text-3xl font-black tracking-tight">
                                    {studentComplaints.filter(c => c.status === 'Pending').length}
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
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    New Complaint
                                </CardTitle>
                                <CardDescription className="font-medium">All fields are required for processing.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Issue Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                            >
                                                <SelectTrigger className="h-11 border-muted hover:border-red-400 focus:ring-red-500 transition-all">
                                                    <SelectValue placeholder="Select category..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="Food">Food Quality</SelectItem>
                                                    <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                                                    <SelectItem value="Security">Security</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe the issue in detail..."
                                                className="min-h-[180px] border-muted hover:border-red-400 focus:ring-red-500 transition-all font-medium"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2 group"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            <>
                                                Submit Complaint
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
                                <h2 className="text-2xl font-black tracking-tight">Complaint History</h2>
                                <div className="h-px w-20 bg-muted-foreground/20 hidden md:block" />
                            </div>
                        </div>

                        <Card className="border-none shadow-premium overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50 border-b-border/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Submitted</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Description</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Priority</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Admin Response</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentComplaints.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-72 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                                            <History className="h-8 w-8 opacity-20" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-black text-foreground">No complaints submitted yet</p>
                                                            <p className="text-sm">Use the form to report any issues or concerns.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            studentComplaints.map((complaint, index) => (
                                                <TableRow key={index} className="group hover:bg-muted/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <TableCell className="py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-background transition-colors flex items-center justify-center shrink-0 border border-border/50">
                                                                <Calendar className="h-5 w-5 text-red-500" />
                                                            </div>
                                                            <div className="text-sm font-black tracking-tight whitespace-nowrap">
                                                                {formatDate(complaint.createdAt)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        <Badge variant="outline" className={cn(
                                                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-1.5 w-fit",
                                                            getCategoryStyles(complaint.category)
                                                        )}>
                                                            {getCategoryIcon(complaint.category)}
                                                            {complaint.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-6 max-w-[250px]">
                                                        <p className="text-sm font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                                            {complaint.description}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        <Badge variant="outline" className={cn(
                                                            "px-2 py-1 text-[9px] font-black uppercase tracking-widest border w-fit",
                                                            getPriorityStyles(complaint.priority)
                                                        )}>
                                                            {complaint.priority}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        <Badge variant="outline" className={cn(
                                                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-1.5 w-fit",
                                                            getStatusStyles(complaint.status)
                                                        )}>
                                                            {getStatusIcon(complaint.status)}
                                                            {complaint.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-6">
                                                        {complaint.adminRemarks ? (
                                                            <div className="flex items-start gap-2 max-w-[200px]">
                                                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                                <p className="text-sm font-medium text-muted-foreground leading-snug">
                                                                    {complaint.adminRemarks}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-black uppercase tracking-widest opacity-20">No response yet</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {/* Guidelines Note */}
                        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-red-700 mb-1">Complaint Guidelines</h4>
                                <p className="text-xs font-medium text-red-900/70 leading-relaxed">
                                    Please be specific and detailed when describing issues. Include relevant details such as location, time, and any other pertinent information. The administration will review and respond to all complaints within 48-72 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentComplaints;
