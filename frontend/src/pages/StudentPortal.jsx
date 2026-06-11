import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UtensilsCrossed, CalendarDays, AlertTriangle, LogOut, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import MainLayout from '@/components/layout/MainLayout';

const StudentPortal = () => {
    const { user, logout } = useAuth();
    const { students, getStudentAttendanceStats } = useHostel();
    const navigate = useNavigate();

    // Find the student record associated with the user
    const studentRecord = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id) ||
        (s.collegeNumber === user?.collegeNumber && user?.collegeNumber)
    );

    const stats = getStudentAttendanceStats(studentRecord?._id || studentRecord?.id);
    const collegeNumber = studentRecord?.collegeNumber || user?.collegeNumber;

    const portalActions = [
        {
            title: 'My Profile',
            description: 'View and manage your personal information and hostel details.',
            icon: User,
            color: 'bg-primary/10 text-primary',
            path: '/profile',
        },
        {
            title: 'Mess Information',
            description: 'Check daily menu, timings, and your attendance records.',
            icon: UtensilsCrossed,
            color: 'bg-success/10 text-success',
            path: '/mess-info',
        },
        {
            title: 'Leave Applications',
            description: 'Submit new leave requests and track your application status.',
            icon: CalendarDays,
            color: 'bg-amber-500/10 text-amber-500',
            path: '/leave-request',
        },
        {
            title: 'Report Issues',
            description: 'Submit complaints and get quick resolutions for hostel concerns.',
            icon: AlertTriangle,
            color: 'bg-red-500/10 text-red-500',
            path: '/complaints',
        },
    ];

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
                {/* Welcome Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
                            Welcome, <span className="text-primary">{user?.name || 'Student'}</span>
                        </h1>
                        <p className="mt-2 text-muted-foreground text-lg">
                            Manage your hostel life, mess, and leave applications from one central hub.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={logout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card
                        className="bg-primary/5 border-primary/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/mess-info')}
                    >
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Mess Attendance</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-bold text-primary">{stats?.percentage || 0}%</p>
                                <p className="text-xs text-muted-foreground mb-1">Current Range</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="bg-success/5 border-success/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/mess-info')}
                    >
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Days Present</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-bold text-success">{stats?.present || 0}</p>
                                <p className="text-xs text-muted-foreground mb-1">Records Found</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="bg-amber-500/5 border-amber-500/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate('/profile')}
                    >
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Registration No.</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-amber-600 font-mono tracking-tighter">
                                    {collegeNumber || 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {portalActions.map((action, index) => (
                        <Card
                            key={action.title}
                            className="group relative overflow-hidden cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => navigate(action.path)}
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <action.icon size={80} />
                            </div>
                            <CardHeader className="pb-4">
                                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon size={24} />
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight">{action.title}</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    {action.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform duration-300">
                                    Access Now <ChevronRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Support Section */}
                <div className="mt-16 p-8 rounded-3xl bg-muted/30 border border-border/50 text-center animate-fade-in">
                    <h2 className="text-xl font-bold mb-2">Need Assistance?</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                        If you're having trouble with the portal or have questions about hostel life, feel free to contact the warden or hostel administration.
                    </p>
                    <Button variant="outline" className="rounded-full px-8">
                        Contact Administration
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentPortal;
