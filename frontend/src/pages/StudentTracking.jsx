import React, { useState } from 'react';
import { Search, Eye, TrendingUp, Calendar as CalendarIcon, User, Phone, BookOpen, CalendarDays } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHostel } from '@/context/useHostel';
import { cn } from '@/lib/utils';

const StudentTracking = () => {
  const {
    students,
    hostels,
    messAttendance,
    leaveApplications,
    getStudentAttendanceHistory,
    getStudentLeaveHistory,
  } = useHostel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  // Local helper for attendance stats within range
  const getAttendanceStatsInRange = (studentId) => {
    if (!dateRange?.from || !dateRange?.to) {
      // If no range selected, return overall or empty stats
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
    if (!dateRange?.from || !dateRange?.to) return [];

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

  // Local helper for leave history within range
  const getLeaveHistoryInRange = (studentId) => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.to);
    end.setHours(23, 59, 59, 999);

    return leaveApplications
      .filter((l) => {
        const isStudent = l.student?._id === studentId || l.student === studentId;
        const leaveStart = new Date(l.startDate);
        const leaveEnd = new Date(l.endDate);
        // If the leave overlaps with the range
        return isStudent && (
          (leaveStart >= start && leaveStart <= end) ||
          (leaveEnd >= start && leaveEnd <= end) ||
          (leaveStart <= start && leaveEnd >= end)
        );
      })
      .sort((a, b) => new Date(b.appliedDate || b.createdAt).getTime() - new Date(a.appliedDate || a.createdAt).getTime());
  };

  const filteredStudents = students.filter((s) => {
    const studentName = s.user?.name || s.name || '';
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.collegeNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHostel = selectedHostel === 'all' || (s.room?.hostel?.name || s.hostelName) === selectedHostel;
    return matchesSearch && matchesHostel;
  });

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsStudentDialogOpen(true);
  };

  // Overall stats
  const totalStudents = students.length;
  const averageAttendance =
    students.length > 0
      ? Math.round(
        students.reduce((sum, s) => sum + getAttendanceStatsInRange(s._id || s.id).percentage, 0) /
        students.length
      )
      : 0;
  const lowAttendanceCount = students.filter(
    (s) => getAttendanceStatsInRange(s._id || s.id).percentage < 75 && getAttendanceStatsInRange(s._id || s.id).total > 0
  ).length;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">Student Tracking</h1>
        <p className="mt-2 text-muted-foreground">
          View and update records for all students in the hostel
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8 animate-slide-up">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{averageAttendance}%</p>
                <p className="text-sm text-muted-foreground">Average Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <User className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{lowAttendanceCount}</p>
                <p className="text-sm text-muted-foreground">Low Attendance (&lt;75%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-up">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Hostels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostels.map((hostel) => (
              <SelectItem key={hostel._id || hostel.id} value={hostel.name}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-16 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {students.length === 0
                  ? 'No students found. Add students from the Admissions page.'
                  : 'No students match your search criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const stats = getAttendanceStatsInRange(student._id || student.id);
            const leaveCount = getStudentLeaveHistory(student._id || student.id).length;
            return (
              <Card
                key={student._id || student.id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleViewStudent(student)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{student.user?.name || student.name}</CardTitle>
                      <CardDescription>{student.collegeNumber || student.registrationNumber}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hostel:</span>
                      <p className="font-medium">{student.room?.hostel?.name || student.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Room:</span>
                      <p className="font-medium">{student.room?.roomNumber || student.roomNumber || 'Not assigned'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Program:</span>
                      <p className="font-medium truncate">{student.department || student.program}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Leave Apps:</span>
                      <p className="font-medium">{leaveCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mess Attendance</span>
                      <span
                        className={cn(
                          'font-semibold',
                          stats.percentage >= 75 && 'text-success',
                          stats.percentage >= 50 && stats.percentage < 75 && 'text-amber-500',
                          stats.percentage < 50 && stats.total > 0 && 'text-destructive'
                        )}
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={stats.percentage}
                      className={cn(
                        'h-2',
                        stats.percentage >= 75 && '[&>div]:bg-success',
                        stats.percentage >= 50 && stats.percentage < 75 && '[&>div]:bg-amber-500',
                        stats.percentage < 50 && stats.total > 0 && '[&>div]:bg-destructive'
                      )}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Present: {stats.present}</span>
                      <span>Absent: {stats.absent}</span>
                      <span>Total: {stats.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selectedStudent.user?.name || selectedStudent.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent.collegeNumber || selectedStudent.registrationNumber} • {selectedStudent.room?.hostel?.name || selectedStudent.hostelName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  {(() => {
                    const stats = getAttendanceStatsInRange(selectedStudent._id || selectedStudent.id);
                    return (
                      <>
                        <Card className="text-center p-4">
                          <p className="text-2xl font-bold text-primary">{stats.percentage}%</p>
                          <p className="text-xs text-muted-foreground">Attendance</p>
                        </Card>
                        <Card className="text-center p-4">
                          <p className="text-2xl font-bold text-success">{stats.present}</p>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </Card>
                        <Card className="text-center p-4">
                          <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </Card>
                        <Card className="text-center p-4">
                          <p className="text-2xl font-bold">{stats.total}</p>
                          <p className="text-xs text-muted-foreground">Total Records</p>
                        </Card>
                      </>
                    );
                  })()}
                </div>

                <div className="flex justify-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Tabs for detailed sections */}
                <Tabs defaultValue="info" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="leaves">Leaves</TabsTrigger>
                  </TabsList>

                  {/* Student Info Tab */}
                  <TabsContent value="info">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Father Name:</span>
                            <p className="font-medium">{selectedStudent.fatherName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Program:</span>
                            <p className="font-medium">{selectedStudent.department || selectedStudent.program}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Year:</span>
                            <p className="font-medium">{selectedStudent.year}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{selectedStudent.contact || selectedStudent.contactNumber}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Room Number:</span>
                            <p className="font-medium">{selectedStudent.room?.roomNumber || selectedStudent.roomNumber || 'Not assigned'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Admission Date:</span>
                            <p className="font-medium">
                              {selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Attendance History Tab */}
                  <TabsContent value="attendance">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Attendance History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const history = getAttendanceHistoryInRange(selectedStudent._id || selectedStudent.id);
                          if (history.length === 0) {
                            return (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                No attendance records yet.
                              </p>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              {history.map((record) => (
                                <div
                                  key={record._id || record.id}
                                  className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline">{record.mealType || record.meal}</Badge>
                                    <span className="text-sm">
                                      {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  <Badge
                                    className={cn(
                                      record.status === 'Present' && 'bg-success/10 text-success',
                                      record.status === 'Absent' && 'bg-destructive/10 text-destructive'
                                    )}
                                  >
                                    {record.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Leave History Tab */}
                  <TabsContent value="leaves">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CalendarDays className="h-5 w-5" />
                          Leave History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const leaves = getLeaveHistoryInRange(selectedStudent._id || selectedStudent.id);
                          if (leaves.length === 0) {
                            return (
                              <p className="text-muted-foreground text-sm py-4 text-center">
                                No leave applications found for this range.
                              </p>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              {leaves.map((leave) => (
                                <div
                                  key={leave._id || leave.id}
                                  className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {leave.startDate} to {leave.endDate}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{leave.reason}</p>
                                  </div>
                                  <Badge
                                    className={cn(
                                      leave.status === 'Approved' && 'bg-success/10 text-success',
                                      leave.status === 'Rejected' && 'bg-destructive/10 text-destructive',
                                      leave.status === 'Pending' && 'bg-amber-500/10 text-amber-500'
                                    )}
                                  >
                                    {leave.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default StudentTracking;
