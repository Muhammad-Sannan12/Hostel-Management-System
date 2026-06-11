import React from 'react';
import {
    Utensils,
    Calendar,
    Clock,
    ChefHat,
    ArrowRight,
    Star,
    Coffee,
    Pizza,
    Drumstick
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
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
import { cn } from '@/lib/utils';

const StudentMess = () => {
    const { user } = useAuth();
    const { messMenu } = useHostel();

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const sortedMenu = [...messMenu].sort((a, b) => {
        return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });

    const formatTime12h = (timeStr) => {
        if (!timeStr) return 'N/A';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-10 mb-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <Utensils size={280} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                    <Utensils className="h-6 w-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-black uppercase tracking-widest">
                                    Campus Dining Hall
                                </Badge>
                            </div>
                            <h1 className="font-display text-5xl font-black tracking-tighter mb-3">
                                Hostel Mess Menu
                            </h1>
                            <p className="text-lg opacity-90 max-w-xl font-medium leading-relaxed">
                                Fuel your academic journey with our daily meal schedule. Healthy, balanced dining for our student residents.
                            </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                            <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70 text-white">Today's Focus</span>
                                <span className="text-3xl font-black tracking-tight">{currentDay}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subheader */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black tracking-tight">Weekly Menu</h2>
                        <div className="h-px w-20 bg-muted-foreground/20 hidden md:block" />
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {sortedMenu.map((day, index) => {
                        const isToday = day.day === currentDay;

                        return (
                            <Card
                                key={index}
                                className={cn(
                                    "group border-none shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-2 animate-slide-up",
                                    isToday ? "ring-4 ring-orange-500 ring-offset-4 ring-offset-background" : "hover:shadow-2xl"
                                )}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardHeader className={cn(
                                    "p-6 transition-colors duration-500",
                                    isToday ? "bg-orange-500 text-white" : "bg-muted/30 group-hover:bg-muted/50"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                            {day.day}
                                        </CardTitle>
                                        {isToday && (
                                            <Badge className="bg-white text-orange-600 font-black px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                Active Today
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className={cn(
                                        "font-bold",
                                        isToday ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                        Full day meal schedule
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Coffee className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Breakfast</label>
                                        <p className="text-base font-bold leading-tight">{day.breakfast}</p>
                                    </div>

                                    <div className="relative pl-10 border-t pt-8">
                                        <div className="absolute left-0 top-9 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Pizza className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Lunch</label>
                                        <p className="text-base font-bold leading-tight">{day.lunch}</p>
                                    </div>

                                    <div className="relative pl-10 border-t pt-8">
                                        <div className="absolute left-0 top-9 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Drumstick className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Dinner</label>
                                        <p className="text-base font-bold leading-tight">{day.dinner}</p>
                                    </div>
                                </CardContent>
                                <div className={cn(
                                    "h-1 w-full",
                                    isToday ? "bg-orange-500" : "bg-transparent"
                                )} />
                            </Card>
                        );
                    })}
                </div>

                {/* Full Weekly Timing Table */}
                <div className="mt-16 animate-fade-in">
                    <div className="flex items-center gap-4 mb-8 px-2">
                        <h2 className="text-2xl font-black tracking-tight">Full Weekly Schedule & Timings</h2>
                        <div className="h-px w-20 bg-muted-foreground/20 hidden md:block" />
                    </div>

                    <Card className="border-none shadow-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-b-border/50">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] w-[150px]">Day</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Program</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Breakfast</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Lunch</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Dinner</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedMenu.map((day, idx) => {
                                        const isToday = day.day === currentDay;
                                        return (
                                            <React.Fragment key={idx}>
                                                {/* FSc Row */}
                                                <TableRow className={cn(
                                                    "border-b-border/30 transition-colors",
                                                    isToday ? "bg-orange-500/5 hover:bg-orange-500/10" : "hover:bg-muted/30"
                                                )}>
                                                    <TableCell className="font-black align-middle" rowSpan={2}>
                                                        <div className="flex items-center gap-2">
                                                            {day.day}
                                                            {isToday && <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter py-0">FSc</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.breakfastFscStart)} - {formatTime12h(day.breakfastFscEnd)}</TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.lunchFscStart)} - {formatTime12h(day.lunchFscEnd)}</TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.dinnerFscStart)} - {formatTime12h(day.dinnerFscEnd)}</TableCell>
                                                </TableRow>
                                                {/* BS Row */}
                                                <TableRow className={cn(
                                                    "border-b-border/50 transition-colors",
                                                    isToday ? "bg-orange-500/5 hover:bg-orange-500/10" : "hover:bg-muted/30"
                                                )}>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter py-0">BS</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.breakfastBsStart)} - {formatTime12h(day.breakfastBsEnd)}</TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.lunchBsStart)} - {formatTime12h(day.lunchBsEnd)}</TableCell>
                                                    <TableCell className="font-mono text-xs font-bold">{formatTime12h(day.dinnerBsStart)} - {formatTime12h(day.dinnerBsEnd)}</TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* Timing Footer */}
                <div className="mt-16 p-10 rounded-3xl bg-muted/30 border border-border/50 animate-fade-in">
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center shadow-md">
                                <Clock size={32} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Standard Serving Times</h3>
                                <p className="text-muted-foreground font-medium">Please ensure entry 15 minutes before closing. Timings vary by academic program.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    label: 'Breakfast',
                                    fsc: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.breakfastFscStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.breakfastFscEnd)}`,
                                    bs: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.breakfastBsStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.breakfastBsEnd)}`
                                },
                                {
                                    label: 'Lunch',
                                    fsc: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.lunchFscStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.lunchFscEnd)}`,
                                    bs: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.lunchBsStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.lunchBsEnd)}`
                                },
                                {
                                    label: 'Dinner',
                                    fsc: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.dinnerFscStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.dinnerFscEnd)}`,
                                    bs: `${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.dinnerBsStart)} - ${formatTime12h(sortedMenu.find(m => m.day === currentDay)?.dinnerBsEnd)}`
                                },
                            ].map((slot, i) => (
                                <Card key={i} className="bg-background/50 border-none shadow-sm overflow-hidden">
                                    <div className="bg-primary/10 px-4 py-2 border-b border-primary/5">
                                        <p className="text-xs font-black uppercase tracking-widest text-primary">{slot.label}</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">FSc Students</span>
                                            <span className="text-sm font-bold font-mono">{slot.fsc}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">BS</span>
                                            <span className="text-sm font-bold font-mono">{slot.bs}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentMess;
