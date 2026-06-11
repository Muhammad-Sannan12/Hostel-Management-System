import React, { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import {
    User,
    Phone,
    Home,
    Calendar as CalendarIcon,
    BadgeCheck,
    Building,
    ClipboardList,
    TrendingUp,
    CalendarDays,
    Mail,
    MapPin,
    ChevronRight,
    ArrowRight
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const StudentProfile = () => {
    const { user } = useAuth();
    const { students, messAttendance, getStudentLeaveHistory } = useHostel();

    // Find detailed student profile from HostelContext
    const studentProfile = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id) ||
        (s.collegeNumber === user?.collegeNumber && user?.collegeNumber)
    ) || {
        name: user?.name,
        collegeNumber: user?.collegeNumber || 'N/A',
        department: 'N/A',
        contact: 'N/A',
        room: { hostel: { name: 'Not Assigned' }, roomNumber: 'N/A' },
        admissionDate: new Date(),
        year: 'N/A'
    };

    // Date range state for attendance
    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    // Local helper for attendance stats within range
    const getAttendanceStatsInRange = (studentId) => {
        if (!dateRange?.from || !dateRange?.to || !studentId) {
            return { total: 0, present: 0, absent: 0, percentage: 0 };
        }

        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);

        const studentRecords = messAttendance.filter((a) => {
            const isStudent = a.student?._id === studentId || a.student === studentId;
            const recordDate = new Date(a.date);
            return isStudent && recordDate >= start && recordDate <= end;
        });

        const total = studentRecords.length;
        const present = studentRecords.filter((a) => a.status === 'Present').length;
        const absent = studentRecords.filter((a) => a.status === 'Absent').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        return { total, present, absent, percentage };
    };

    // Local helper for attendance history within range
    const getAttendanceHistoryInRange = (studentId) => {
        if (!dateRange?.from || !dateRange?.to || !studentId) return [];

        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);

        return messAttendance
            .filter((a) => {
                const isStudent = a.student?._id === studentId || a.student === studentId;
                const recordDate = new Date(a.date);
                return isStudent && recordDate >= start && recordDate <= end;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const stats = getAttendanceStatsInRange(studentProfile._id || studentProfile.id);
    const history = getAttendanceHistoryInRange(studentProfile._id || studentProfile.id);
    const leaves = getStudentLeaveHistory(studentProfile._id || studentProfile.id);

    const profileItems = [
        { label: 'College ID', value: studentProfile.collegeNumber, icon: BadgeCheck, color: 'text-blue-500' },
        { label: 'Department', value: studentProfile.department, icon: Building, color: 'text-purple-500' },
        { label: 'Year/Semester', value: studentProfile.year, icon: CalendarDays, color: 'text-orange-500' },
        { label: 'Contact', value: studentProfile.contact || studentProfile.contactNumber, icon: Phone, color: 'text-green-500' },
        { label: 'Parent Contact', value: studentProfile.parentContact, icon: Phone, color: 'text-amber-500' },
        { label: 'Hostel', value: studentProfile.room?.hostel?.name || studentProfile.hostelName || 'Not Assigned', icon: Home, color: 'text-red-500' },
        { label: 'Room No.', value: studentProfile.room?.roomNumber || studentProfile.roomNumber || 'N/A', icon: MapPin, color: 'text-cyan-500' },
    ];

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
                {/* Premium Header - Refined without icon box */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 to-primary p-10 mb-10 text-primary-foreground shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div>
                                <h1 className="font-display text-5xl font-black tracking-tighter mb-2">
                                    {studentProfile.user?.name || studentProfile.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                                        <BadgeCheck className="h-4 w-4 text-white" />
                                        <span className="text-sm font-bold tracking-tight">Reg #{studentProfile.collegeNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                                        <Building className="h-4 w-4 text-white" />
                                        <span className="text-sm font-bold tracking-tight">{studentProfile.department}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/20 border border-green-400/30 backdrop-blur-md text-green-300">
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-wider">Active Status</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Matriculation Date</p>
                            <p className="text-2xl font-black tracking-tight">
                                {studentProfile.admissionDate ? new Date(studentProfile.admissionDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="info" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-12 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="info" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Personal Details
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Attendance Record
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="animate-slide-up">
                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Profile Info Grid */}
                            <Card className="md:col-span-2 border-none shadow-premium overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4 border-b">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-primary" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>Formal registration details from the hostel office</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="grid gap-8 sm:grid-cols-2">
                                        {profileItems.map((item, index) => (
                                            <div key={index} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-primary/10">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                                    <item.icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-0.5">
                                                        {item.label}
                                                    </label>
                                                    <p className="text-base font-bold text-foreground">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary / Health Card */}
                            <div className="space-y-6">
                                <Card className="border-none shadow-premium bg-primary/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Attendance Health</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <p className="text-4xl font-black">{stats.percentage}%</p>
                                            <p className="text-xs font-bold text-muted-foreground mb-1">Total Attendance</p>
                                        </div>
                                        <Progress value={stats.percentage} className="h-2.5 rounded-full" />
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Your attendance is {stats.percentage >= 75 ? 'excellent' : 'below the required 75% threshold'}. Keep it up!
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="animate-slide-up space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30 p-6 rounded-3xl border border-border/50">
                            <div>
                                <h3 className="text-lg font-bold">Attendance Log</h3>
                                <p className="text-sm text-muted-foreground font-medium">Select a period to review your mess activity</p>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[300px] justify-start text-left font-bold h-12 rounded-xl bg-background border-border/50 hover:border-primary/30 shadow-sm",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        className="rounded-2xl"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-6 md:grid-cols-4">
                            <Card className="text-center p-6 border-none shadow-premium bg-primary text-primary-foreground">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Percentage</p>
                                <p className="text-4xl font-black">{stats.percentage}%</p>
                            </Card>
                            <Card className="text-center p-6 border-none shadow-premium">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                                <p className="text-3xl font-black">{stats.total}</p>
                            </Card>
                            <Card className="text-center p-6 border-none shadow-premium">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 text-success">Present</p>
                                <p className="text-3xl font-black text-success">{stats.present}</p>
                            </Card>
                            <Card className="text-center p-6 border-none shadow-premium">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 text-destructive">Absent</p>
                                <p className="text-3xl font-black text-destructive">{stats.absent}</p>
                            </Card>
                        </div>

                        <Card className="border-none shadow-premium overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Date</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Meal Type</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">Time Recorded</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y border-t">
                                            {history.length > 0 ? (
                                                history.map((record) => (
                                                    <tr key={record._id || record.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                                                                    {new Date(record.date).getDate()}
                                                                </div>
                                                                <span className="text-sm font-bold">
                                                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="outline" className="font-bold border-muted-foreground/20">
                                                                {record.mealType || record.meal}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full",
                                                                    record.status === 'Present' ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                                )} />
                                                                <span className={cn(
                                                                    "text-sm font-black",
                                                                    record.status === 'Present' ? "text-success" : "text-destructive"
                                                                )}>
                                                                    {record.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-xs font-bold text-muted-foreground opacity-60">
                                                                {record.updatedAt ? new Date(record.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                                            <CalendarIcon className="h-8 w-8" />
                                                            <p className="text-sm font-black uppercase tracking-widest">No records for this period</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default StudentProfile;
